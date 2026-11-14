import assert from "node:assert/strict";
import test from "node:test";

import type { BackstageClient } from "../client.js";
import type { StructuredDataDocument } from "../types/structured-data.js";
import { StructuredDataService } from "./structured-data.js";

const restaurant = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Example",
  url: "https://example.com",
} satisfies StructuredDataDocument;

test("StructuredDataService returns the JSON-LD document without unwrapping data", async () => {
  const requests: Array<{ path: string; options?: RequestInit }> = [];
  const client = {
    get: async (path: string, options?: RequestInit) => {
      requests.push({ path, options });
      return restaurant;
    },
  } as unknown as BackstageClient;

  const result = await new StructuredDataService(client).get({ cache: "no-store" });

  assert.deepEqual(requests, [{ path: "/structured-data", options: { cache: "no-store" } }]);
  assert.deepEqual(result, restaurant);
  assert.equal("data" in result, false);
});

test("StructuredDataService returns a schema.org graph document", async () => {
  const document = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "Example", url: "https://example.com" },
      { "@type": "Restaurant", name: "Example" },
    ],
  } satisfies StructuredDataDocument;
  const client = {
    get: async () => document,
  } as unknown as BackstageClient;

  assert.deepEqual(await new StructuredDataService(client).get(), document);
});

test("StructuredDataService rejects an envelope wrapped in data", async () => {
  const client = {
    get: async () => ({ data: restaurant }),
  } as unknown as BackstageClient;

  await assert.rejects(
    () => new StructuredDataService(client).get(),
    /invalid structured data document/,
  );
});
