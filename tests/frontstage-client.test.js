import assert from "node:assert/strict";
import test from "node:test";

import { BackstageClient } from "../dist/index.js";

function createResponse(body) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    async json() {
      return body;
    },
    async text() {
      return JSON.stringify(body);
    },
  };
}

async function withMockedFetch(body, run) {
  const originalFetch = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return createResponse(body);
  };

  try {
    const client = new BackstageClient({
      accountId: "account-123",
      baseURL: "https://example.com/api",
      token: "token-123",
    });

    const result = await run(client);
    return { calls, result };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function assertDefaultHeaders(call) {
  assert.deepEqual(call.options.headers, {
    Accept: "application/json",
    Authorization: "Bearer token-123",
    "Content-Type": "application/json",
    "X-Account-ID": "account-123",
  });
}

test("frontstage.site fetches the site contract endpoint", async () => {
  const expected = { contractVersion: "2026-05-frontstage-v1", site: { name: "HQ" } };
  const { calls, result } = await withMockedFetch(expected, (client) => client.frontstage.site());

  assert.deepEqual(result, expected);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://example.com/api/frontstage/site");
  assert.equal(calls[0].options.method, "GET");
  assertDefaultHeaders(calls[0]);
});

test("frontstage.page normalizes the root slug and omits preview params by default", async () => {
  const expected = { contractVersion: "2026-05-frontstage-v1", page: { slug: "/" } };
  const { calls, result } = await withMockedFetch(expected, (client) => client.frontstage.page("/"));

  assert.deepEqual(result, expected);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://example.com/api/frontstage/pages");
  assert.equal(calls[0].options.method, "GET");
});

test("frontstage.page serializes preview params for nested slugs", async () => {
  const expected = { contractVersion: "2026-05-frontstage-v1", page: { slug: "about/team" } };
  const { calls, result } = await withMockedFetch(expected, (client) =>
    client.frontstage.page("/about/team", { preview: true, previewId: "preview-123" }),
  );

  assert.deepEqual(result, expected);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://example.com/api/frontstage/pages/about/team?preview=true&previewId=preview-123");
  assert.equal(calls[0].options.method, "GET");
});

test("frontstage.routes fetches the route contract collection", async () => {
  const expected = { contractVersion: "2026-05-frontstage-v1", routes: [{ pathname: "/" }] };
  const { calls, result } = await withMockedFetch(expected, (client) => client.frontstage.routes());

  assert.deepEqual(result, expected);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://example.com/api/frontstage/routes");
  assert.equal(calls[0].options.method, "GET");
});

test("frontstage.blocks fetches the block contract collection", async () => {
  const expected = { contractVersion: "2026-05-frontstage-v1", blocks: [{ type: "hero" }] };
  const { calls, result } = await withMockedFetch(expected, (client) => client.frontstage.blocks());

  assert.deepEqual(result, expected);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://example.com/api/frontstage/blocks");
  assert.equal(calls[0].options.method, "GET");
});

test("studio entrypoint stays importable from the built package", async () => {
  const studio = await import("../dist/studio/index.js");

  assert.equal(typeof studio.defineBlock, "function");
  assert.equal(typeof studio.defineField, "function");
});
