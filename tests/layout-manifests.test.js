import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  parseLayoutManifest,
  validateLayoutDefinition,
  validateLayoutDefinitions,
} from "../dist/layouts/manifest.js";
import { syncLayouts } from "../dist/cli/actions/sync-layouts.js";

const cliPath = fileURLToPath(new URL("../dist/cli/cli.js", import.meta.url));

function runCli(args, cwd) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, npm_package_version: "1.19.2" },
  });
}

function runCliAsync(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd,
      env: { ...process.env, npm_package_version: "1.19.2" },
    });
    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", (status, signal) => resolve({ status, signal, stdout, stderr }));
  });
}

function response(status, body) {
  const text = JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 409 ? "Conflict" : status >= 400 ? "Error" : "OK",
    json: async () => body,
    text: async () => text,
  };
}

const layoutManifest = {
  manifest_version: 1,
  type: "layout",
  name: "Standard Page",
  slug: "standard-page",
  schema: {
    fields: [{ name: "Content Width", slug: "content_width", type: "select", options: [{ label: "Wide", value: "wide" }] }],
  },
};

const clientConfig = (layouts) => ({
  accountId: "account-id",
  token: "api-token",
  baseURL: "https://example.test/api",
  layouts,
});

test("layout manifest validation accepts the standard envelope and rejects malformed contracts", () => {
  assert.deepEqual(parseLayoutManifest(layoutManifest), layoutManifest);
  assert.equal(validateLayoutDefinition({ name: "Inline", slug: "inline", schema: { fields: [] } }).slug, "inline");

  assert.throws(() => parseLayoutManifest({ ...layoutManifest, manifest_version: 2 }), /Unsupported manifest_version/);
  assert.throws(() => parseLayoutManifest({ ...layoutManifest, type: "block" }), /Manifest type must be "layout"/);
  assert.throws(() => parseLayoutManifest({ ...layoutManifest, unexpected: true }), /Unknown layout manifest field/);
  assert.throws(() => parseLayoutManifest({ ...layoutManifest, schema: { fields: [], unexpected: true } }), /Unknown layout schema field/);
  assert.throws(
    () => parseLayoutManifest({ ...layoutManifest, schema: { fields: [{ name: "Bad", slug: "bad", type: "unknown" }] } }),
    /not a supported Backstage field type/,
  );
  assert.throws(() => validateLayoutDefinition({ name: "Missing schema", slug: "missing" }), /schema must be an object/);
});

test("inline layout configuration remains compatible and duplicate slugs are rejected", () => {
  const inline = { name: "Legacy layout", slug: "legacy", schema: { fields: [], metadata: { legacy: true } }, component: "ignored-by-sync" };
  assert.deepEqual(validateLayoutDefinition(inline), {
    name: "Legacy layout",
    slug: "legacy",
    schema: inline.schema,
  });

  assert.throws(
    () => validateLayoutDefinitions([inline, { ...inline, name: "Duplicate" }]),
    /Multiple local layouts use slug "legacy"/,
  );
  assert.throws(() => validateLayoutDefinitions({}), /layouts must be an array/);
});

test("layout sync validates the complete list before making any writes", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (...args) => {
    calls.push(args);
    return response(201, { data: { id: "new-layout" } });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const malformed = { ...layoutManifest, slug: "" };
  await assert.rejects(() => syncLayouts(clientConfig([layoutManifest, malformed])), /slug must be a non-empty string/);
  await assert.rejects(() => syncLayouts(clientConfig([layoutManifest, { ...layoutManifest, name: "Duplicate" }])), /Multiple local layouts/);
  assert.equal(calls.length, 0);
});

test("layout sync sends the existing create payload shape", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (options.method === "GET") return response(200, { data: [] });
    return response(201, { data: { id: "new-layout" } });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  await syncLayouts(clientConfig([layoutManifest]));

  assert.deepEqual(calls.map(({ options }) => options.method), ["GET", "POST"]);
  assert.equal(calls[1].url, "https://example.test/api/layouts");
  assert.deepEqual(JSON.parse(calls[1].options.body), {
    name: layoutManifest.name,
    slug: layoutManifest.slug,
    schema: layoutManifest.schema,
  });
});

test("layout sync resolves create conflicts through the account layout list by slug", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  let listCount = 0;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (options.method === "POST") return response(409, { id: "untrusted-conflict-id" });
    if (options.method === "GET") {
      listCount += 1;
      return response(200, { data: listCount === 1 ? [] : [{
        id: "account-layout-id",
        name: "Old name",
        slug: layoutManifest.slug,
        schema: { fields: layoutManifest.schema.fields },
      }] });
    }
    if (options.method === "PUT") return response(200, { data: { id: "account-layout-id" } });
    throw new Error(`Unexpected request ${options.method} ${url}`);
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  await syncLayouts(clientConfig([layoutManifest]));

  assert.deepEqual(calls.map(({ options }) => options.method), ["GET", "POST", "GET", "PUT"]);
  assert.equal(calls[2].url, "https://example.test/api/layouts");
  assert.equal(calls[3].url, "https://example.test/api/layouts/account-layout-id");
  assert.deepEqual(JSON.parse(calls[3].options.body), {
    name: layoutManifest.name,
    slug: layoutManifest.slug,
    schema: layoutManifest.schema,
  });
});

test("layout sync leaves unchanged schemas alone when the API omits unsupported field metadata", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  const calls = [];
  const warnings = [];
  const local = structuredClone(layoutManifest);
  local.schema.fields[0].required = true;
  const remoteField = structuredClone(local.schema.fields[0]);
  delete remoteField.required;
  remoteField.type_id = "account-field-type";
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return response(200, { data: [{
      id: "account-layout-id",
      name: local.name,
      slug: local.slug,
      schema: { fields: [remoteField] },
    }] });
  };
  console.warn = (message) => warnings.push(message);
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
  });

  const result = await syncLayouts(clientConfig([local]));

  assert.deepEqual(result, { created: 0, updated: 0, unchanged: 1 });
  assert.deepEqual(calls.map(({ options }) => options.method), ["GET"]);
  assert.match(warnings.join("\n"), /may not enforce this field as required/);
});

test("layout sync ignores Backstage-generated nested field IDs across repeated syncs", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  const local = {
    name: "Action Layout",
    slug: "action-layout",
    schema: { fields: [{
      name: "Actions",
      slug: "actions",
      type: "fieldset",
      fields: [{ name: "Label", slug: "label", type: "text" }],
    }] },
  };
  const remoteSchema = structuredClone(local.schema);
  remoteSchema.fields[0].fields[0].id = "backstage-generated-field-id";
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return response(200, { data: [{
      id: "account-layout-id",
      name: local.name,
      slug: local.slug,
      schema: remoteSchema,
    }] });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const first = await syncLayouts(clientConfig([local]));
  const second = await syncLayouts(clientConfig([local]));

  assert.deepEqual(first, { created: 0, updated: 0, unchanged: 1 });
  assert.deepEqual(second, { created: 0, updated: 0, unchanged: 1 });
  assert.deepEqual(calls.map(({ options }) => options.method), ["GET", "GET"]);
});

test("layout sync still updates meaningful schema changes without normalizing the request payload", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  const local = {
    name: "Action Layout",
    slug: "action-layout",
    schema: { fields: [{
      name: "Actions",
      slug: "actions",
      type: "fieldset",
      fields: [{ id: "preserved-field-id", name: "Label", slug: "label", type: "text", description: "Button label" }],
    }] },
  };
  const remoteSchema = structuredClone(local.schema);
  remoteSchema.fields[0].fields[0].id = "backstage-generated-field-id";
  remoteSchema.fields[0].fields[0].description = "Old description";
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (options.method === "GET") {
      return response(200, { data: [{
        id: "account-layout-id",
        name: local.name,
        slug: local.slug,
        schema: remoteSchema,
      }] });
    }
    return response(200, { data: { id: "account-layout-id" } });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const result = await syncLayouts(clientConfig([local]));

  assert.deepEqual(result, { created: 0, updated: 1, unchanged: 0 });
  assert.deepEqual(calls.map(({ options }) => options.method), ["GET", "PUT"]);
  assert.deepEqual(JSON.parse(calls[1].options.body), {
    name: local.name,
    slug: local.slug,
    schema: local.schema,
  });
});

test("layout sync rejects account-only nested fields before any layout writes", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  const local = {
    name: "Action Layout",
    slug: "action-layout",
    schema: { fields: [{
      name: "Actions",
      slug: "actions",
      type: "fieldset",
      fields: [{ name: "Label", slug: "label", type: "text" }],
    }] },
  };
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return response(200, { data: [{
      id: "account-layout-id",
      name: local.name,
      slug: local.slug,
      schema: { fields: [{
        ...local.schema.fields[0],
        fields: [
          ...local.schema.fields[0].fields,
          { name: "URL", slug: "href", type: "url" },
        ],
      }] },
    }] });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  await assert.rejects(
    () => syncLayouts(clientConfig([
      { name: "Would Create", slug: "would-create", schema: { fields: [] } },
      local,
    ])),
    /schema fields not present in the local definition: actions.href/,
  );
  assert.deepEqual(calls.map(({ options }) => options.method), ["GET"]);
});

test("layout dry-run reports planned creates and updates without writing", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  const update = { name: "Updated Layout", slug: "to-update", schema: { fields: [] } };
  const unchanged = { name: "Unchanged Layout", slug: "unchanged", schema: { fields: [] } };
  const create = { name: "New Layout", slug: "to-create", schema: { fields: [] } };
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return response(200, { data: [{
      id: "update-id",
      name: "Old Layout Name",
      slug: update.slug,
      schema: { fields: [] },
    }, {
      id: "unchanged-id",
      ...unchanged,
    }] });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const result = await syncLayouts(clientConfig([update, unchanged, create]), { dryRun: true });

  assert.deepEqual(result, { created: 1, updated: 1, unchanged: 1 });
  assert.deepEqual(calls.map(({ options }) => options.method), ["GET"]);
});

test("layout sync propagates preflight, create, and update failures", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  globalThis.fetch = async () => response(500, { message: "create failed" });
  await assert.rejects(() => syncLayouts(clientConfig([layoutManifest])), /Failed to list account layouts before sync: HTTP 500/);

  globalThis.fetch = async (_url, options) => {
    if (options.method === "GET") return response(200, { data: [] });
    return response(500, { message: "create failed" });
  };
  await assert.rejects(() => syncLayouts(clientConfig([layoutManifest])), /Failed to create layout standard-page: HTTP 500/);

  globalThis.fetch = async (_url, options) => {
    if (options.method === "GET") return response(200, { data: [{
      id: "account-layout-id",
      name: "Old name",
      slug: layoutManifest.slug,
      schema: { fields: layoutManifest.schema.fields },
    }] });
    return response(500, { message: "update failed" });
  };
  await assert.rejects(() => syncLayouts(clientConfig([layoutManifest])), /Failed to update layout standard-page: HTTP 500/);
});

test("config loading rejects arrays and invalid manifest directory values", async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), "backstage-invalid-config-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));

  await writeFile(join(cwd, "backstage.config.ts"), "export default [];\n");
  const arrayConfig = runCli(["sync", "layouts"], cwd);
  assert.notEqual(arrayConfig.status, 0);
  assert.match(arrayConfig.stderr, /does not export a default object/);

  await writeFile(join(cwd, "backstage.config.ts"), 'export default { blockManifestDirectory: "  " };\n');
  const emptyDirectory = runCli(["sync", "layouts"], cwd);
  assert.notEqual(emptyDirectory.status, 0);
  assert.match(emptyDirectory.stderr, /blockManifestDirectory must be a non-empty string/);

  await writeFile(join(cwd, "backstage.config.ts"), "export default { blockManifestDirectory: 42 };\n");
  const nonStringDirectory = runCli(["sync", "layouts"], cwd);
  assert.notEqual(nonStringDirectory.status, 0);
  assert.match(nonStringDirectory.stderr, /blockManifestDirectory must be a non-empty string/);
});

test("CLI exits nonzero when a layout write fails", async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), "backstage-layout-cli-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));

  const server = createServer((request, responseStream) => {
    if (request.method === "GET") {
      responseStream.writeHead(200, { "Content-Type": "application/json" });
      responseStream.end(JSON.stringify({ data: [] }));
      return;
    }
    responseStream.writeHead(500, { "Content-Type": "application/json" });
    responseStream.end(JSON.stringify({ message: "write failed" }));
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const address = server.address();
  assert.ok(address && typeof address === "object");

  await writeFile(
    join(cwd, "backstage.config.ts"),
    `export default { accountId: "account-id", token: "api-token", baseURL: "http://127.0.0.1:${address.port}", layouts: [${JSON.stringify(layoutManifest)}] };\n`,
  );

  const result = await runCliAsync(["sync", "layouts"], cwd);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Failed to create layout standard-page: HTTP 500/);
});

test("CLI supports sync layouts --dry-run without sending writes", async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), "backstage-layout-dry-run-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));

  const methods = [];
  const server = createServer((request, responseStream) => {
    methods.push(request.method);
    responseStream.writeHead(200, { "Content-Type": "application/json" });
    responseStream.end(JSON.stringify({ data: [] }));
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const address = server.address();
  assert.ok(address && typeof address === "object");

  await writeFile(
    join(cwd, "backstage.config.ts"),
    `export default { accountId: "account-id", token: "api-token", baseURL: "http://127.0.0.1:${address.port}", layouts: [${JSON.stringify({ name: "Preview", slug: "preview", schema: { fields: [] } })}] };\n`,
  );

  const result = await runCliAsync(["sync", "layouts", "--dry-run"], cwd);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Layout sync preview: 1 to create, 0 to update, 0 unchanged/);
  assert.deepEqual(methods, ["GET"]);
});
