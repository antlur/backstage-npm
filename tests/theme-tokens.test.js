import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { defineConfig, normalizeThemeRadius, resolveDesignTokenSource, validateThemeTokenDeclarations } from "../dist/index.js";
import { syncThemeTokens } from "../dist/cli/actions/sync-theme-tokens.js";

const declarations = {
  action: { label: " Action ", type: "color", cssVariable: "--theme-color-action", default: "#abc" },
};
const normalized = validateThemeTokenDeclarations(declarations);
const config = { accountId: "account-1", token: "test-token", baseURL: "https://example.test/api", designTokens: { source: "backstage" } };
const website = (tokens = {}, values = { action: "palette:primary", retired: "#123456" }) => ({ id: "website-1", theme_tokens: { tokens, values } });

async function withServerState(websites, callback, failure) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    if (failure) return new Response(JSON.stringify({ message: "Request rejected" }), { status: failure });
    if (options.method === "PUT") {
      const body = JSON.parse(options.body);
      websites[0].theme_tokens.tokens = body.theme_tokens.tokens;
      return new Response(JSON.stringify({ data: websites[0] }));
    }
    return new Response(JSON.stringify({ data: websites }));
  };
  try { await callback(calls); } finally { globalThis.fetch = originalFetch; }
}

test("design source defaults local, is explicit, and rejects malformed configuration", () => {
  assert.equal(resolveDesignTokenSource({}), "local");
  assert.equal(resolveDesignTokenSource({ designTokens: {} }), "local");
  assert.equal(resolveDesignTokenSource({ designTokens: { source: "local" } }), "local");
  assert.equal(resolveDesignTokenSource(config), "backstage");
  for (const designTokens of [null, [], "backstage", { source: "auto" }, { source: null }, { source: true }]) {
    assert.throws(() => resolveDesignTokenSource({ designTokens }), /designTokens.source/);
    assert.throws(() => defineConfig({ designTokens }), /designTokens.source/);
  }
});

test("local and omitted design sources make no theme requests, including dry runs without credentials", async () => {
  await withServerState([], async (calls) => {
    for (const designTokens of [undefined, {}, { source: "local" }]) {
      for (const options of [{}, { dryRun: true }]) {
        assert.equal(await syncThemeTokens({ designTokens, themeTokens: declarations }, options), null);
      }
    }
    assert.equal(calls.length, 0);
  });
});

test("declarations match the API's normalization and reject unsupported token types and CSS", () => {
  assert.equal(normalized.action.default, "#AABBCC");
  assert.equal(normalized.action.label, "Action");
  assert.equal(declarations.action.default, "#abc");
  for (const patch of [
    { type: "font" }, { cssVariable: "--x;color:red" }, { cssVariable: "color" },
    { default: "palette:primary" }, { default: "red" }, { label: "" }, { extra: true },
  ]) assert.throws(() => validateThemeTokenDeclarations({ action: { ...declarations.action, ...patch } }), /Theme token/);
  assert.throws(() => validateThemeTokenDeclarations({ "bad.key": declarations.action }), /invalid token key/);
  assert.throws(() => validateThemeTokenDeclarations([]), /must be an object/);
  assert.throws(() => validateThemeTokenDeclarations(Object.fromEntries(Array.from({ length: 129 }, (_, i) => [`t${i}`, declarations.action]))), /128/);
});

test("radius declarations normalize canonical values and reject invalid defaults and variables", () => {
  assert.equal(normalizeThemeRadius(" pill "), "pill");
  assert.equal(normalizeThemeRadius(" 32px "), "32px");
  for (const value of [null, 12, "PILL", " 33px ", "1 px", "9999px"]) {
    assert.equal(normalizeThemeRadius(value), null);
  }

  const radius = {
    label: " Button radius ",
    type: "radius",
    cssVariable: " --theme-radius-button ",
    default: " 12px ",
  };
  assert.deepEqual(validateThemeTokenDeclarations({ "button-radius": radius }), {
    "button-radius": {
      label: "Button radius",
      type: "radius",
      cssVariable: "--theme-radius-button",
      default: "12px",
    },
  });
  for (const patch of [
    { default: "33px" },
    { default: "PILL" },
    { default: 12 },
    { cssVariable: "--theme-color-button" },
    { cssVariable: `--theme-radius-${"a".repeat(70)}` },
    { extra: true },
  ]) assert.throws(() => validateThemeTokenDeclarations({ "button-radius": { ...radius, ...patch } }), /Theme token/);
});

test("sync accepts mixed color and radius declarations and preserves editor values", async () => {
  const state = website({
    action: normalized.action,
    "button-radius": { label: "Button radius", type: "radius", cssVariable: "--theme-radius-button", default: "8px" },
  }, { action: "palette:primary", "button-radius": "pill", retired: "#123456" });
  const mixedDeclarations = {
    action: declarations.action,
    "button-radius": { label: " Button radius ", type: "radius", cssVariable: " --theme-radius-button ", default: " 12px " },
  };
  const mixedNormalized = validateThemeTokenDeclarations(mixedDeclarations);

  await withServerState([state], async (calls) => {
    assert.deepEqual(await syncThemeTokens({ ...config, themeTokens: mixedDeclarations }), { websiteId: "website-1", changed: true });
    const write = calls.find((call) => call.method === "PUT");
    assert.deepEqual(JSON.parse(write.body), { theme_tokens: { tokens: mixedNormalized } });
    assert.deepEqual(state.theme_tokens.values, { action: "palette:primary", "button-radius": "pill", retired: "#123456" });
    assert.equal((await syncThemeTokens({ ...config, themeTokens: mixedDeclarations })).changed, false);
    assert.equal(calls.filter((call) => call.method === "PUT").length, 1);
  });
});

test("sync updates declarations only and becomes a no-op after server normalization", async () => {
  const state = website();
  await withServerState([state], async (calls) => {
    assert.deepEqual(await syncThemeTokens({ ...config, themeTokens: declarations }), { websiteId: "website-1", changed: true });
    const write = calls.find((call) => call.method === "PUT");
    assert.equal(write.url, "https://example.test/api/websites/website-1");
    assert.equal(new Headers(write.headers).get("X-Account-Id"), "account-1");
    assert.deepEqual(JSON.parse(write.body), { theme_tokens: { tokens: normalized } });
    assert.deepEqual(state.theme_tokens.values, { action: "palette:primary", retired: "#123456" });
    assert.equal((await syncThemeTokens({ ...config, themeTokens: declarations })).changed, false);
    assert.equal(calls.filter((call) => call.method === "PUT").length, 1);
  });
});

test("dry-run reads the selected website without writing", async () => {
  await withServerState([website()], async (calls) => {
    assert.equal((await syncThemeTokens({ ...config, themeTokens: declarations }, { dryRun: true })).changed, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, "GET");
  });
});

test("omitted config leaves declarations alone while an explicit empty object clears only declarations", async () => {
  await withServerState([website(normalized)], async (calls) => {
    assert.equal(await syncThemeTokens(config), null);
    assert.equal(calls.length, 0);
    await syncThemeTokens({ ...config, themeTokens: {} });
    assert.deepEqual(JSON.parse(calls[1].body), { theme_tokens: { tokens: {} } });
  });
});

test("invalid local config, ambiguous accounts, and older APIs cannot cause a write", async () => {
  await withServerState([website()], async (calls) => {
    await assert.rejects(() => syncThemeTokens({ ...config, themeTokens: { invalid: { type: "font" } } }));
    assert.equal(calls.length, 0);
  });
  for (const websites of [[], [website(), website()], [{ id: "old-server" }]]) {
    await withServerState(websites, async (calls) => {
      await assert.rejects(() => syncThemeTokens({ ...config, themeTokens: declarations }), /exactly one|does not expose/);
      assert.ok(calls.every((call) => call.method === "GET"));
    });
  }
  await withServerState([], async () => {
    await assert.rejects(() => syncThemeTokens({ ...config, themeTokens: declarations }), /Request rejected/);
  }, 403);
});

test("CLI supports declaration dry-run and reports failed writes with a nonzero exit", async () => {
  const directory = await mkdtemp(join(tmpdir(), "backstage-theme-"));
  let writes = 0;
  let requests = 0;
  const server = createServer(async (request, response) => {
    requests++;
    response.setHeader("Content-Type", "application/json");
    if (request.method === "PUT") { writes++; response.writeHead(422); response.end(JSON.stringify({ message: "Invalid declarations" })); }
    else response.end(JSON.stringify({ data: [website()] }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const run = (args) => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [new URL("../dist/cli/cli.js", import.meta.url).pathname, "sync", "theme-tokens", ...args], {
      cwd: directory, env: { ...process.env, BACKSTAGE_API_URL: `http://127.0.0.1:${server.address().port}`, BACKSTAGE_ACCOUNT_ID: "account-1", BACKSTAGE_API_KEY: "test-token" },
    });
    let output = "";
    child.stdout.on("data", (value) => { output += value; });
    child.stderr.on("data", (value) => { output += value; });
    child.once("error", reject);
    child.once("close", (status) => resolve({ status, output }));
  });
  try {
    await writeFile(join(directory, "backstage.config.ts"), `export default ${JSON.stringify({ themeTokens: declarations })}`);
    const local = await run(["--dry-run"]);
    assert.equal(local.status, 0, local.output);
    assert.match(local.output, /local CSS/);
    assert.equal(requests, 0);
    await writeFile(join(directory, "backstage.config.ts"), `export default ${JSON.stringify({ designTokens: { source: "auto" }, themeTokens: declarations })}`);
    const invalid = await run([]);
    assert.equal(invalid.status, 1, invalid.output);
    assert.match(invalid.output, /designTokens.source/);
    assert.equal(requests, 0);
    await writeFile(join(directory, "backstage.config.ts"), `export default ${JSON.stringify({ designTokens: { source: "backstage" }, themeTokens: declarations })}`);
    const preview = await run(["--dry-run"]);
    assert.equal(preview.status, 0, preview.output);
    assert.match(preview.output, /would update/);
    assert.equal(writes, 0);
    const failed = await run([]);
    assert.equal(failed.status, 1, failed.output);
    assert.match(failed.output, /Invalid declarations/);
    assert.equal(writes, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  }
});
