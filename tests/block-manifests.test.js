import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  parseBlockManifest,
  syncBlockManifests,
  validateBlockManifest,
  BackstageClient,
} from "../dist/index.js";
import { syncBlocks } from "../dist/cli/actions/sync-blocks.js";

const cliPath = fileURLToPath(new URL("../dist/cli/cli.js", import.meta.url));

function runCli(args, cwd) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, npm_package_version: "1.15.4" },
  });
}

const heroManifest = (registry_identity = "backstage:hero@1") => ({
  manifest_version: 1,
  type: "block",
  registry_identity,
  name: "Hero",
  slug: "hero",
  schema: { fields: [{ name: "Heading", slug: "heading", type: "text", order: 0 }] },
});

const contactManifest = () => ({
  ...heroManifest("example:contact@1"),
  name: "Contact",
  slug: "contact",
});

const repeatableActionsManifest = () => ({
  ...heroManifest("example:actions@1"),
  name: "Actions",
  slug: "actions",
  schema: { fields: [{
    name: "Actions", slug: "actions", type: "repeater", order: 0,
    fields: [
      { name: "Label", slug: "label", type: "text", required: true, order: 0 },
      { name: "URL", slug: "href", type: "url", required: true, order: 1 },
    ],
  }] },
});

test("validates local contracts without requiring a bundled catalog", () => {
  const hero = heroManifest("starter-astro:hero@1");
  const revised = {
    ...hero,
    derived_from: "backstage:hero@1",
    schema: { fields: [
      ...hero.schema.fields,
      { name: "Layout", slug: "layout", type: "select", order: 1, options: [{ label: "Compact", value: "compact" }] },
    ] },
  };
  assert.deepEqual(validateBlockManifest(revised), revised);
  assert.doesNotThrow(() => validateBlockManifest({ ...revised, registry_identity: "starter-astro:hero@2" }));
  assert.throws(() => parseBlockManifest({ ...hero, manifest_version: 2 }), /Unsupported manifest_version/);
  assert.throws(() => parseBlockManifest({ ...hero, derived_from: hero.registry_identity }), /derived_from cannot match/);
  assert.throws(() => parseBlockManifest({ ...hero, renderer: "react" }), /renderer-specific/);
  assert.throws(() => parseBlockManifest({
    ...hero, schema: { fields: [...hero.schema.fields, ...hero.schema.fields] },
  }), /duplicates/);
});

test("CLI validates an explicit project manifest and no longer installs bundled blocks", async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), "backstage-blocks-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));

  const file = join(cwd, "manifest.json");
  await writeFile(file, JSON.stringify(heroManifest("example:hero@1")));
  const valid = runCli(["block", "validate", file], cwd);
  assert.equal(valid.status, 0, valid.stderr);
  assert.match(valid.stdout, /example:hero@1/);

  for (const command of ["install", "fork", "list", "search"]) {
    const removed = runCli(["block", command], cwd);
    assert.notEqual(removed.status, 0);
    assert.match(removed.stderr, /unknown command/);
  }

  const syncWithoutConfig = runCli(["sync", "blocks"], cwd);
  assert.notEqual(syncWithoutConfig.status, 0);
  const syncHelp = runCli(["sync", "--help"], cwd);
  assert.equal(syncHelp.status, 0, syncHelp.stderr);
  assert.match(syncHelp.stdout, /--dry-run/);
  const invalidDryRun = runCli(["sync", "all", "--dry-run"], cwd);
  assert.notEqual(invalidDryRun.status, 0);
  assert.match(invalidDryRun.stderr, /supported only with 'backstage sync blocks'/);

  await writeFile(file, JSON.stringify({ ...heroManifest(), registry_identity: "bad" }));
  const invalid = runCli(["block", "validate", file], cwd);
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /Invalid block identity/);
});

test("CLI uses the root config and configured block directory, with legacy config fallback", async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), "backstage-config-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));

  await mkdir(join(cwd, "src/blocks/hero"), { recursive: true });
  await writeFile(
    join(cwd, "src/blocks/hero/manifest.json"),
    JSON.stringify(heroManifest("example:hero@1")),
  );
  await writeFile(
    join(cwd, "backstage.config.ts"),
    'export default { blockManifestDirectory: "src/blocks" };\n',
  );

  const rootConfigValidation = runCli(["block", "validate"], cwd);
  assert.equal(rootConfigValidation.status, 0, rootConfigValidation.stderr);
  assert.match(rootConfigValidation.stdout, /Validated 1 block manifest/);

  await mkdir(join(cwd, "backstage"), { recursive: true });
  await mkdir(join(cwd, "legacy-blocks/legacy"), { recursive: true });
  await writeFile(
    join(cwd, "backstage/config.ts"),
    'export default { blockManifestDirectory: "legacy-blocks" };\n',
  );
  await writeFile(
    join(cwd, "legacy-blocks/legacy/manifest.json"),
    JSON.stringify(contactManifest()),
  );

  const rootTakesPrecedence = runCli(["block", "validate"], cwd);
  assert.equal(rootTakesPrecedence.status, 0, rootTakesPrecedence.stderr);
  assert.match(rootTakesPrecedence.stderr, /using backstage\.config\.ts/);
  assert.match(rootTakesPrecedence.stdout, /Validated 1 block manifest/);

  const legacyCwd = await mkdtemp(join(tmpdir(), "backstage-legacy-config-"));
  t.after(() => rm(legacyCwd, { recursive: true, force: true }));
  await mkdir(join(legacyCwd, "backstage"), { recursive: true });
  await mkdir(join(legacyCwd, "custom-blocks/hero"), { recursive: true });
  await writeFile(
    join(legacyCwd, "backstage/config.ts"),
    'export default { blockManifestDirectory: "custom-blocks" };\n',
  );
  await writeFile(
    join(legacyCwd, "custom-blocks/hero/manifest.json"),
    JSON.stringify(heroManifest("example:hero@1")),
  );

  const legacyValidation = runCli(["block", "validate"], legacyCwd);
  assert.equal(legacyValidation.status, 0, legacyValidation.stderr);
  assert.match(legacyValidation.stdout, /Validated 1 block manifest/);
});

test("sync blocks reads the configured manifest directory in dry-run mode", async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), "backstage-sync-config-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));
  const manifestsDirectory = join(cwd, "src/blocks");
  await mkdir(join(manifestsDirectory, "hero"), { recursive: true });
  await writeFile(
    join(manifestsDirectory, "hero/manifest.json"),
    JSON.stringify(heroManifest("example:hero@1")),
  );

  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      async json() { return { data: [] }; },
    };
  };

  try {
    await syncBlocks({
      accountId: "account-id",
      baseURL: "https://example.test/api",
      token: "api-token",
      blockManifestDirectory: manifestsDirectory,
    }, { dryRun: true });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://example.test/api/blocks");
    assert.equal(calls[0].options.method, "GET");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("sync creates and updates only definitions by immutable registry identity", async () => {
  const manifest = validateBlockManifest({
    ...heroManifest(),
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

  const changedManifest = validateBlockManifest({
    ...manifest,
    schema: { fields: [
      ...manifest.schema.fields,
      { name: "Layout", slug: "layout", type: "select", options: [{ label: "Compact", value: "compact" }] },
    ] },
  });
  assert.deepEqual(await syncBlockManifests(client, [changedManifest], { dryRun: true }), { created: 0, updated: 1, unchanged: 0 });
  assert.equal(calls.some((call) => call.method === "update"), false);
  assert.deepEqual(await syncBlockManifests(client, [changedManifest]), { created: 0, updated: 1, unchanged: 0 });
  const update = calls.find((call) => call.method === "update");
  assert.equal(update.id, "hero-id");
  assert.equal(update.payload.registry_identity, manifest.registry_identity);
  assert.deepEqual(update.payload.schema, changedManifest.schema);
  assert.equal(update.payload.derived_from, "backstage:hero@1");
  assert.deepEqual(await syncBlockManifests(client, [changedManifest]), { created: 0, updated: 0, unchanged: 1 });
  assert.equal("pages" in client, false);
});

test("dry-run plans manifest changes without creating or updating account blocks", async () => {
  const manifest = heroManifest();
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

test("explicit adoption updates only an unregistered matching slug and supports dry-run", async () => {
  const manifest = heroManifest();
  const legacy = {
    id: "legacy-hero-id",
    name: "Legacy Hero",
    slug: manifest.slug,
    registry_identity: null,
    schema: structuredClone(manifest.schema),
  };
  const writes = [];
  const client = {
    blocks: {
      async list() { return [structuredClone(legacy)]; },
      async create() { throw new Error("adoption should not create a second block"); },
      async update(id, payload) {
        writes.push({ id, payload });
        return { id, ...payload };
      },
    },
  };
  const options = { adoptUnregisteredSlugs: [manifest.slug] };

  assert.deepEqual(await syncBlockManifests(client, [manifest], { ...options, dryRun: true }), {
    created: 0,
    updated: 1,
    unchanged: 0,
  });
  assert.deepEqual(writes, []);

  assert.deepEqual(await syncBlockManifests(client, [manifest], options), {
    created: 0,
    updated: 1,
    unchanged: 0,
  });
  assert.equal(writes[0].id, legacy.id);
  assert.equal(writes[0].payload.registry_identity, manifest.registry_identity);
});

test("explicit adoption never updates a slug registered to a different identity", async () => {
  const manifest = heroManifest();
  let updated = false;
  const client = {
    blocks: {
      async list() {
        return [{ id: "owned-hero-id", slug: manifest.slug, registry_identity: "another-site:hero@1" }];
      },
      async create() { throw new Error("must not create over a registered slug"); },
      async update() { updated = true; },
    },
  };

  await assert.rejects(
    () => syncBlockManifests(client, [manifest], { adoptUnregisteredSlugs: [manifest.slug] }),
    /already owned by another-site:hero@1/,
  );
  assert.equal(updated, false);
});

test("sync reports omitted required metadata and does not repeat writes for unsupported fields", async () => {
  const manifest = repeatableActionsManifest();
  const remote = {
    id: "cta-id",
    ...structuredClone(manifest),
    name: "Legacy Call to Action",
  };
  let updates = 0;

  const withoutRequired = (fields) => fields.map(({ fields: nested, ...field }) => {
    const copy = { ...field };
    delete copy.required;
    return { ...copy, fields: withoutRequired(nested ?? []) };
  });

  const client = {
    blocks: {
      async list() { return [structuredClone(remote)]; },
      async create() { throw new Error("should not create"); },
      async update(id, payload) {
        updates += 1;
        Object.assign(remote, payload);
        remote.schema = { fields: withoutRequired(payload.schema.fields) };
        return structuredClone(remote);
      },
    },
  };

  const first = await syncBlockManifests(client, [manifest]);
  assert.equal(first.updated, 1);
  assert.equal(first.warnings?.some((warning) => warning.includes("actions.label")), true);
  assert.equal(first.warnings?.some((warning) => warning.includes("actions.href")), true);

  const second = await syncBlockManifests(client, [manifest]);
  assert.deepEqual(second, {
    created: 0,
    updated: 0,
    unchanged: 1,
    warnings: first.warnings,
  });
  assert.equal(updates, 1);
});

test("sync treats nested blueprint slugs and resolved IDs as equivalent on repeat runs", async () => {
  const base = heroManifest();
  const manifest = validateBlockManifest({
    ...base,
    name: "Product Hero",
    slug: "product-hero",
    registry_identity: "site:product-hero@1",
    derived_from: base.registry_identity,
    schema: {
      fields: [
        ...base.schema.fields,
        {
          name: "Related products",
          slug: "related_products",
          type: "repeater",
          order: 6,
          fields: [
            {
              name: "Product",
              slug: "product",
              type: "reference",
              order: 0,
              allowed_references: ["products"],
            },
          ],
        },
      ],
    },
  });
  const blueprintId = "61cbe0b2-113f-4ab3-95ad-31b5748da4cc";
  let remote = {
    id: "product-hero-id",
    ...structuredClone(manifest),
    name: "Earlier Product Hero",
  };
  const writes = [];
  let blueprintReads = 0;

  const resolveReferences = (fields) => fields.map((field) => ({
    ...field,
    ...(field.allowed_references
      ? { allowed_references: field.allowed_references.map((reference) => reference === "products" ? blueprintId : reference) }
      : {}),
    fields: resolveReferences(field.fields ?? []),
  }));

  const client = {
    blocks: {
      async list() { return [structuredClone(remote)]; },
      async create() { throw new Error("should not create"); },
      async update(id, payload) {
        writes.push({ id, payload: structuredClone(payload) });
        remote = {
          ...remote,
          ...structuredClone(payload),
          schema: { fields: resolveReferences(payload.schema.fields) },
        };
        return structuredClone(remote);
      },
    },
    blueprints: {
      async list() {
        blueprintReads += 1;
        return [{ id: blueprintId, slug: "products" }];
      },
    },
  };

  assert.deepEqual(await syncBlockManifests(client, [manifest]), { created: 0, updated: 1, unchanged: 0 });
  assert.deepEqual(
    writes[0].payload.schema.fields.find(({ slug }) => slug === "related_products").fields[0].allowed_references,
    ["products"],
    "the API payload should keep the manifest slug rather than sending a resolved UUID",
  );
  assert.deepEqual(
    remote.schema.fields.find(({ slug }) => slug === "related_products").fields[0].allowed_references,
    [blueprintId],
    "Backstage should resolve the manifest slug in its stored response",
  );

  assert.deepEqual(await syncBlockManifests(client, [manifest]), { created: 0, updated: 0, unchanged: 1 });
  assert.equal(writes.length, 1, "the repeated sync should not add another write");
  assert.equal(blueprintReads, 1, "the repeat sync should resolve the UUID stored by Backstage");

  const unresolvedId = "e0c7f893-e8f9-4fed-98bb-1263e763248a";
  remote.schema.fields.find(({ slug }) => slug === "related_products").fields[0].allowed_references = [unresolvedId];
  await assert.rejects(
    () => syncBlockManifests(client, [manifest]),
    /Cannot resolve Backstage blueprint reference.*refusing to write/,
  );
  assert.equal(writes.length, 1, "an unresolved reference must not trigger an unchecked update");
});

test("manifest collisions are all detected before the first account write", async () => {
  const hero = heroManifest();
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
  const hero = heroManifest();
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
  const manifest = heroManifest();
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
    ...heroManifest(),
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
  const manifest = heroManifest();
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
    ...heroManifest(),
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
  const manifest = heroManifest();
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
  const manifest = heroManifest();
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
  const manifest = heroManifest();
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
  const hero = heroManifest();
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
