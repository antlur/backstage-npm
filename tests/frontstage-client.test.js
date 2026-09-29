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
  const headers = new Headers(call.options.headers);
  assert.equal(headers.get("Accept"), "application/json");
  assert.equal(headers.get("Authorization"), "Bearer token-123");
  assert.equal(headers.get("Content-Type"), "application/json");
  assert.equal(headers.get("X-Account-ID"), "account-123");
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

test("custom HeadersInit values preserve the SDK authorization and account headers", async () => {
  const customHeaders = [
    { headers: { "X-Request-ID": "object-header" }, expected: "object-header" },
    { headers: new Headers([["X-Request-ID", "headers-instance"]]), expected: "headers-instance" },
    { headers: [["X-Request-ID", "tuple-header"]], expected: "tuple-header" },
  ];

  for (const { headers, expected } of customHeaders) {
    const { calls } = await withMockedFetch({}, (client) => client.get("/probe", { headers, cache: "no-store" }));
    const mergedHeaders = new Headers(calls[0].options.headers);

    assert.equal(mergedHeaders.get("Authorization"), "Bearer token-123");
    assert.equal(mergedHeaders.get("X-Account-ID"), "account-123");
    assert.equal(mergedHeaders.get("Accept"), "application/json");
    assert.equal(mergedHeaders.get("X-Request-ID"), expected);
    assert.equal(calls[0].options.cache, "no-store");
  }
});

test("explicit client configuration works when process is unavailable", () => {
  const processDescriptor = Object.getOwnPropertyDescriptor(globalThis, "process");
  let client;

  Object.defineProperty(globalThis, "process", { configurable: true, value: undefined });

  try {
    client = new BackstageClient({
      accountId: "account-123",
      baseURL: "https://example.com/api",
      token: "token-123",
    });
  } finally {
    if (processDescriptor) {
      Object.defineProperty(globalThis, "process", processDescriptor);
    }
  }

  assert.ok(client);
});

test("studio entrypoint stays importable from the built package", async () => {
  const studio = await import("../dist/studio/index.js");

  assert.equal(typeof studio.defineBlock, "function");
  assert.equal(typeof studio.defineField, "function");
});

test("HTTP errors expose parsed JSON response data", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: false,
    status: 409,
    statusText: "Conflict",
    async text() {
      return JSON.stringify("block-123");
    },
  });

  try {
    const client = new BackstageClient({
      accountId: "account-123",
      baseURL: "https://example.com/api",
      token: "token-123",
    });

    await assert.rejects(
      () => client.blocks.create({ name: "Hero", slug: "hero", schema: { fields: [] } }),
      (error) => {
        assert.equal(error.status, 409);
        assert.equal(error.response.status, 409);
        assert.equal(error.response.data, "block-123");
        assert.match(error.message, /HTTP 409: Conflict/);
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
