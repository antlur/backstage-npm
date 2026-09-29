import assert from "node:assert/strict";
import test from "node:test";

import type { BackstageClient } from "../client.js";
import type { HeadlessPage } from "../types/headless-page.js";
import { PageService } from "./pages.js";

test("PageService reads Headless pages from the existing account-scoped endpoint", async () => {
  const page = {
    id: "page-1",
    title: "Home",
    slug: "/",
    pathname: "/",
    blocks: [
      { id: "block-1", type: "hero", variant: "default", fields: { heading: "Welcome" } },
      { id: "block-2", type: "decorative-rule", variant: null, fields: [] },
    ],
    settings: {},
    is_home: true,
    layout: null,
    meta: { title: "Home", description: null },
  } satisfies HeadlessPage;
  const requests: Array<{ path: string; options?: RequestInit }> = [];
  const client = {
    get: async (path: string, options?: RequestInit) => {
      requests.push({ path, options });
      return { data: [page] };
    },
  } as unknown as BackstageClient;

  const result = await new PageService(client).getHeadlessPages({ cache: "no-store" });

  assert.deepEqual(requests, [{ path: "/pages", options: { cache: "no-store" } }]);
  assert.deepEqual(result, [page]);
  const heroFields = result[0].blocks[0].fields;
  assert.ok(!Array.isArray(heroFields));
  assert.equal(heroFields.heading, "Welcome");
  assert.deepEqual(result[0].blocks[1].fields, []);
});
