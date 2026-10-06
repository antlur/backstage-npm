import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  getRegistryBlock,
  listRegistryBlocks,
  parseBlockManifest,
  searchRegistryBlocks,
  syncBlockManifests,
  validateBlockManifest,
  BackstageClient,
} from "../dist/index.js";

const cliPath = fileURLToPath(new URL("../dist/cli/cli.js", import.meta.url));

function runCli(args, cwd) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, npm_package_version: "1.15.4" },
  });
}

test("registry lists the site starter block contracts and reports unsupported versions", () => {
  const identities = listRegistryBlocks().map((manifest) => manifest.registry_identity);
  assert.deepEqual(identities.sort(), [
    "backstage:hero@1",
    "starter-astro:call-to-action@1",
    "starter-astro:card-grid@1",
    "starter-astro:contact-form@1",
    "starter-astro:hero@1",
    "starter-astro:image-gallery@1",
    "starter-astro:image@1",
    "starter-astro:instagram-feed@1",
    "starter-astro:media-with-text@1",
    "starter-astro:menu@1",
    "starter-astro:rich-text@1",
    "starter-astro:upcoming-events@1",
    "starter-astro:video-hero@1",
  ]);
  assert.deepEqual(
    getRegistryBlock("starter-astro:hero@1").schema.fields.map(({ slug }) => slug),
    ["variant", "eyebrow", "heading", "body", "image", "imageAlt", "logo", "logoAlt", "actions"],
  );
  assert.equal(getRegistryBlock("backstage:hero@1").registry_identity, "backstage:hero@1");
  assert.equal(searchRegistryBlocks("public Instagram posts").length, 1);
  assert.equal(getRegistryBlock("starter-astro:menu@1").schema.fields[0].type, "menu_select");
  assert.deepEqual(
    getRegistryBlock("starter-astro:call-to-action@1").schema.fields.find(({ slug }) => slug === "actions")?.fields.map(({ slug }) => slug),
    ["label", "href"],
  );
  assert.deepEqual(
    getRegistryBlock("starter-astro:image-gallery@1").schema.fields.find(({ slug }) => slug === "image_fit")?.options.map(({ value }) => value),
    ["cover", "contain"],
  );
  assert.equal(getRegistryBlock("starter-astro:upcoming-events@1").schema.fields.at(-1)?.slug, "view_all_label");
  assert.deepEqual(
    getRegistryBlock("starter-astro:video-hero@1").schema.fields.map(({ slug }) => slug),
    ["eyebrow", "heading", "body", "video", "poster", "actions"],
  );
  assert.throws(() => getRegistryBlock("starter-astro:hero@2"), /Unsupported version/);
  assert.throws(() => getRegistryBlock("backstage:missing@1"), /not available/);
});

test("manifest validation checks supported schema fields, identity, and explicit forks", () => {
  const hero = getRegistryBlock("backstage:hero@1");
  assert.equal(validateBlockManifest(hero).registry_identity, "backstage:hero@1");

  assert.throws(
    () => parseBlockManifest({ ...hero, manifest_version: 2 }),
    /Unsupported manifest_version/,
  );
  assert.throws(
    () => validateBlockManifest({ ...hero, registry_identity: "backstage:hero@3" }),
    /Unsupported registry identity/,
  );
  assert.throws(
    () => parseBlockManifest({ ...hero, derived_from: "backstage:hero@1" }),
    /derived_from cannot match/,
  );
  assert.throws(
    () => parseBlockManifest({ ...hero, renderer: "react" }),
    /renderer-specific/,
  );

  const duplicateFields = structuredClone(hero);
  duplicateFields.schema.fields.push({ ...duplicateFields.schema.fields[0] });
  assert.throws(() => parseBlockManifest(duplicateFields), /duplicates/);

  const changedStandard = structuredClone(hero);
  changedStandard.schema.fields[1].required = true;
  assert.throws(() => validateBlockManifest(changedStandard), /Fork it to a site namespace/);

  assert.equal(
    validateBlockManifest({ ...hero, name: "Homepage Banner", slug: "homepage-banner", description: "Local label." }).slug,
    "homepage-banner",
  );

  const presentationChange = structuredClone(hero);
  presentationChange.schema.fields[1].name = "Main heading";
  presentationChange.schema.fields[1].order = 10;
  assert.equal(validateBlockManifest(presentationChange).registry_identity, "backstage:hero@1");

  const starterHero = getRegistryBlock("starter-astro:hero@1");
  assert.equal(validateBlockManifest(starterHero).derived_from, "backstage:hero@1");
  assert.throws(
    () => validateBlockManifest({ ...starterHero, derived_from: "backstage:hero@2" }),
    /registry-owned and its derived_from value cannot be changed/,
  );

  const fork = {
    ...changedStandard,
    registry_identity: "sunda:hero@1",
    derived_from: "backstage:hero@1",
  };
  assert.equal(validateBlockManifest(fork).derived_from, "backstage:hero@1");
});

test("CLI installs without overwriting, forks with provenance, and validates manifests", async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), "backstage-blocks-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));

  const syncWithoutConfig = runCli(["sync", "blocks"], cwd);
  assert.notEqual(syncWithoutConfig.status, 0);

  const list = runCli(["block", "list"], cwd);
  assert.equal(list.status, 0, list.stderr);
  assert.match(list.stdout, /backstage:hero@1/);

  const search = runCli(["block", "search", "introduction"], cwd);
  assert.equal(search.status, 0, search.stderr);
  assert.match(search.stdout, /backstage:hero@1/);

  const install = runCli(["block", "install", "starter-astro:hero@1"], cwd);
  assert.equal(install.status, 0, install.stderr);
  const manifestPath = join(cwd, "blocks", "hero", "manifest.json");
  const astroPath = join(cwd, "blocks", "hero", "Hero.astro");
  const installed = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(installed.registry_identity, "starter-astro:hero@1");
  assert.match(await readFile(astroPath, "utf8"), /HeroBlock/);

  const callToActionInstall = runCli(["block", "install", "starter-astro:call-to-action@1"], cwd);
  assert.equal(callToActionInstall.status, 0, callToActionInstall.stderr);
  const callToActionPath = join(cwd, "blocks", "call-to-action", "CallToAction.astro");
  assert.match(await readFile(callToActionPath, "utf8"), /CallToActionBlock/);
  assert.doesNotMatch(await readFile(callToActionPath, "utf8"), /HeroBlock/);

  const menuInstall = runCli(["block", "install", "starter-astro:menu@1"], cwd);
  assert.equal(menuInstall.status, 0, menuInstall.stderr);
  assert.equal(JSON.parse(await readFile(join(cwd, "blocks", "menu", "manifest.json"), "utf8")).schema.fields[0].type, "menu_select");

  const videoHeroInstall = runCli(["block", "install", "starter-astro:video-hero@1"], cwd);
  assert.equal(videoHeroInstall.status, 0, videoHeroInstall.stderr);
  assert.equal(JSON.parse(await readFile(join(cwd, "blocks", "video-hero", "manifest.json"), "utf8")).schema.fields[3].type, "media");
  assert.match(await readFile(join(cwd, "blocks", "video-hero", "VideoHero.astro"), "utf8"), /VideoHeroBlock/);

  const repeatedInstall = runCli(["block", "install", "starter-astro:hero@1"], cwd);
  assert.notEqual(repeatedInstall.status, 0);
  assert.equal(JSON.parse(await readFile(manifestPath, "utf8")).registry_identity, "starter-astro:hero@1");

  const fork = runCli(["block", "fork", "starter-astro:hero@1", "--namespace", "sunda"], cwd);
  assert.equal(fork.status, 0, fork.stderr);
  const forked = JSON.parse(await readFile(join(cwd, "blocks", "sunda-hero", "manifest.json"), "utf8"));
  assert.equal(forked.registry_identity, "sunda:hero@1");
  assert.equal(forked.derived_from, "starter-astro:hero@1");

  const validation = runCli(["block", "validate"], cwd);
  assert.equal(validation.status, 0, validation.stderr);
  assert.match(validation.stdout, /Validated 5 block manifest/);

  const unsupported = runCli(["block", "install", "starter-astro:hero@2"], cwd);
  assert.notEqual(unsupported.status, 0);
  assert.match(unsupported.stderr, /Unsupported version/);

  const syncHelp = runCli(["sync", "--help"], cwd);
  assert.equal(syncHelp.status, 0, syncHelp.stderr);
  assert.match(syncHelp.stdout, /--dry-run/);

  const invalidDryRun = runCli(["sync", "all", "--dry-run"], cwd);
  assert.notEqual(invalidDryRun.status, 0);
  assert.match(invalidDryRun.stderr, /supported only with 'backstage sync blocks'/);

  const invalidPath = join(cwd, "blocks", "invalid.json");
  await writeFile(invalidPath, JSON.stringify({ ...installed, registry_identity: "bad" }));
  const invalid = runCli(["block", "validate", invalidPath], cwd);
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /Invalid block identity/);
});

test("sync creates and updates only definitions by immutable registry identity", async () => {
  const manifest = validateBlockManifest({
    ...getRegistryBlock("backstage:hero@1"),
    slug: "sunda-hero",
    registry_identity: "sunda:hero@1",
    derived_from: "backstage:hero@1",
  });
  const remote = [];
  const calls = [];
  const client = {
    blocks: {
      async list() {
        calls.push({ method: "list" });
        return remote.map((block) => ({ ...block }));
      },
      async create(payload) {
        calls.push({ method: "create", payload });
        const created = { id: "hero-id", ...payload };
        remote.push(created);
        return created;
      },
      async update(id, payload) {
        calls.push({ method: "update", id, payload });
        const index = remote.findIndex((block) => block.id === id);
        remote[index] = { ...remote[index], ...payload };
        return remote[index];
      },
    },
  };

  assert.deepEqual(await syncBlockManifests(client, [manifest]), { created: 1, updated: 0, unchanged: 0 });
  assert.equal(calls.find((call) => call.method === "create").payload.registry_identity, "sunda:hero@1");
  assert.equal(calls.find((call) => call.method === "create").payload.derived_from, "backstage:hero@1");

  assert.deepEqual(await syncBlockManifests(client, [manifest]), { created: 0, updated: 0, unchanged: 1 });
  assert.equal(calls.some((call) => call.method === "update"), false);

  const changedManifest = validateBlockManifest({ ...manifest, name: "Sunda Hero" });
  assert.deepEqual(await syncBlockManifests(client, [changedManifest]), { created: 0, updated: 1, unchanged: 0 });
  const update = calls.find((call) => call.method === "update");
  assert.equal(update.id, "hero-id");
  assert.equal(update.payload.derived_from, "backstage:hero@1");
  assert.deepEqual(await syncBlockManifests(client, [changedManifest]), { created: 0, updated: 0, unchanged: 1 });
  assert.equal("pages" in client, false);
});

test("dry-run plans manifest changes without creating or updating account blocks", async () => {
  const manifest = getRegistryBlock("backstage:hero@1");
  const writes = [];
  const client = {
    blocks: {
      async list() { return []; },
      async create(payload) { writes.push({ method: "create", payload }); },
      async update(id, payload) { writes.push({ method: "update", id, payload }); },
    },
  };

  assert.deepEqual(await syncBlockManifests(client, [manifest], { dryRun: true }), {
    created: 1,
    updated: 0,
    unchanged: 0,
  });
  assert.deepEqual(writes, []);
});

test("manifest collisions are all detected before the first account write", async () => {
  const hero = getRegistryBlock("backstage:hero@1");
  const first = validateBlockManifest({
    ...hero,
    registry_identity: "site:intro@1",
    derived_from: hero.registry_identity,
    name: "Intro",
    slug: "site-intro",
  });
  const writes = [];
  const client = {
    blocks: {
      async list() { return [{ id: "legacy", slug: "hero", registry_identity: null }]; },
      async create(payload) { writes.push({ method: "create", payload }); },
      async update(id, payload) { writes.push({ method: "update", id, payload }); },
    },
  };

  await assert.rejects(() => syncBlockManifests(client, [first, hero]), /already owned by unregistered block/);
  assert.deepEqual(writes, []);
});

test("account-only schema fields refuse the entire sync before any writes", async () => {
  const hero = getRegistryBlock("backstage:hero@1");
  const first = validateBlockManifest({
    ...hero,
    registry_identity: "site:intro@1",
    derived_from: hero.registry_identity,
    name: "Intro",
    slug: "site-intro",
  });
  const accountFields = [
    ...structuredClone(hero.schema.fields),
    { name: "Account Note", slug: "account_note", type: "text" },
  ];
  const writes = [];
  const client = {
    blocks: {
      async list() {
        return [{
          id: "hero-id",
          slug: hero.slug,
          name: hero.name,
          description: hero.description,
          registry_identity: hero.registry_identity,
          schema: { fields: accountFields },
        }];
      },
      async create(payload) { writes.push({ method: "create", payload }); },
      async update(id, payload) { writes.push({ method: "update", id, payload }); },
    },
  };

  await assert.rejects(() => syncBlockManifests(client, [first, hero]), /account_note/);
  assert.deepEqual(writes, []);
});

test("omitted derived_from metadata is preserved and does not cause a needless update", async () => {
  const manifest = getRegistryBlock("backstage:hero@1");
  let updated = false;
  const client = {
    blocks: {
      async list() {
        return [{
          id: "hero-id",
          name: manifest.name,
          slug: manifest.slug,
          description: manifest.description,
          registry_identity: manifest.registry_identity,
          derived_from: "site:legacy-hero@1",
          schema: structuredClone(manifest.schema),
        }];
      },
      async create() { throw new Error("should not create"); },
      async update() { updated = true; },
    },
  };

  assert.deepEqual(await syncBlockManifests(client, [manifest]), { created: 0, updated: 0, unchanged: 1 });
  assert.equal(updated, false);
});

test("manifest sync sends the merged identity fields through the existing account-block endpoint", async () => {
  const manifest = validateBlockManifest({
    ...getRegistryBlock("backstage:hero@1"),
    slug: "sunda-hero",
    registry_identity: "sunda:hero@1",
    derived_from: "backstage:hero@1",
  });
  const originalFetch = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    const body = options.body ? JSON.parse(options.body) : null;
    const data = options.method === "GET"
      ? []
      : { id: "sunda-hero-id", ...body, registry_identity: body.registry_identity, derived_from: body.derived_from };

    return {
      ok: true,
      status: 200,
      statusText: "OK",
      async json() {
        return { data, meta: { current_page: 1, from: 1, last_page: 1 } };
      },
    };
  };

  try {
    const client = new BackstageClient({
      accountId: "account-id",
      baseURL: "https://example.test/api",
      token: "api-token",
    });

    assert.deepEqual(await syncBlockManifests(client, [manifest]), { created: 1, updated: 0, unchanged: 0 });
    assert.equal(calls[0].url, "https://example.test/api/blocks");
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[1].url, "https://example.test/api/blocks");
    assert.equal(calls[1].options.method, "POST");
    const headers = new Headers(calls[1].options.headers);
    assert.equal(headers.get("Authorization"), "Bearer api-token");
    assert.equal(headers.get("X-Account-ID"), "account-id");
    assert.equal(JSON.parse(calls[1].options.body).registry_identity, "sunda:hero@1");
    assert.equal(JSON.parse(calls[1].options.body).derived_from, "backstage:hero@1");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("sync refuses to update an unregistered block when its slug conflicts", async () => {
  const manifest = getRegistryBlock("backstage:hero@1");
  let updated = false;
  const client = {
    blocks: {
      async list() {
        return [{ id: "legacy-id", slug: "hero", registry_identity: null }];
      },
      async create() {
        throw new Error("should not create over a conflicting slug");
      },
      async update() {
        updated = true;
        throw new Error("should not update an unregistered block");
      },
    },
  };

  await assert.rejects(() => syncBlockManifests(client, [manifest]), /already owned by unregistered block/);
  assert.equal(updated, false);
});

test("sync refuses to rename a registered slug that authored pages may reference", async () => {
  const manifest = validateBlockManifest({
    ...getRegistryBlock("backstage:hero@1"),
    slug: "homepage-banner",
  });
  let updated = false;
  const client = {
    blocks: {
      async list() {
        return [{ id: "hero-id", slug: "hero", registry_identity: "backstage:hero@1" }];
      },
      async create() {
        throw new Error("should not create");
      },
      async update() {
        updated = true;
      },
    },
  };

  await assert.rejects(() => syncBlockManifests(client, [manifest]), /authored pages may refer to it/);
  assert.equal(updated, false);
});

test("sync does not treat a create conflict response ID as a registry identity match", async () => {
  const manifest = getRegistryBlock("backstage:hero@1");
  let updated = false;
  let listCount = 0;
  const client = {
    blocks: {
      async list() {
        listCount += 1;
        return listCount === 1 ? [] : [{ id: "legacy-id", slug: "hero", registry_identity: null }];
      },
      async create() {
        const error = new Error("conflict");
        error.response = { status: 409, data: "legacy-id" };
        throw error;
      },
      async update() {
        updated = true;
      },
    },
  };

  await assert.rejects(() => syncBlockManifests(client, [manifest]), /already owned by unregistered block/);
  assert.equal(updated, false);
});

test("sync reconciles a concurrent create only when the matching definition is safe", async () => {
  const manifest = getRegistryBlock("backstage:hero@1");
  let listCount = 0;
  let updated = false;
  const client = {
    blocks: {
      async list() {
        listCount += 1;
        return listCount === 1 ? [] : [{
          id: "hero-id",
          ...manifest,
          schema: structuredClone(manifest.schema),
        }];
      },
      async create() {
        const error = new Error("conflict");
        error.response = { status: 409 };
        throw error;
      },
      async update() { updated = true; },
    },
  };

  assert.deepEqual(await syncBlockManifests(client, [manifest]), { created: 0, updated: 0, unchanged: 1 });
  assert.equal(updated, false);
  assert.equal(listCount, 2);
});

test("sync refuses a concurrent matching block with account-only fields", async () => {
  const manifest = getRegistryBlock("backstage:hero@1");
  const accountFields = [
    ...structuredClone(manifest.schema.fields),
    { name: "Account Note", slug: "account_note", type: "text" },
  ];
  let listCount = 0;
  let updated = false;
  const client = {
    blocks: {
      async list() {
        listCount += 1;
        return listCount === 1 ? [] : [{
          id: "hero-id",
          name: manifest.name,
          slug: manifest.slug,
          registry_identity: manifest.registry_identity,
          schema: { fields: accountFields },
        }];
      },
      async create() {
        const error = new Error("conflict");
        error.response = { status: 409 };
        throw error;
      },
      async update() { updated = true; },
    },
  };

  await assert.rejects(() => syncBlockManifests(client, [manifest]), /account_note/);
  assert.equal(updated, false);
  assert.equal(listCount, 2);
});

test("partial sync failures report completed writes for safe recovery", async () => {
  const hero = getRegistryBlock("backstage:hero@1");
  const manifests = [
    validateBlockManifest({
      ...hero,
      registry_identity: "site:first@1",
      derived_from: hero.registry_identity,
      name: "First",
      slug: "site-first",
    }),
    validateBlockManifest({
      ...hero,
      registry_identity: "site:second@1",
      derived_from: hero.registry_identity,
      name: "Second",
      slug: "site-second",
    }),
  ];
  const created = [];
  const client = {
    blocks: {
      async list() { return []; },
      async create(payload) {
        if (payload.slug === "site-second") {
          const error = new Error("API unavailable");
          error.response = { status: 503 };
          throw error;
        }
        created.push(payload.slug);
        return { id: "first-id", ...payload };
      },
      async update() { throw new Error("should not update"); },
    },
  };

  await assert.rejects(
    () => syncBlockManifests(client, manifests),
    /stopped at site:second@1 after 1 created, 0 updated, and 0 unchanged.*API unavailable/,
  );
  assert.deepEqual(created, ["site-first"]);
});
