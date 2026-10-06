import assert from "node:assert/strict";
import test from "node:test";

import type { BackstageClient } from "../client.js";
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
  };
  const requests: Array<{ path: string; options?: RequestInit }> = [];
  const client = {
    get: async (path: string, options?: RequestInit) => {
      requests.push({ path, options });
      return { data: [page] };
    },
  } as unknown as BackstageClient;

  const result = await new PageService(client).getHeadlessPages({ cache: "no-store" });

  assert.deepEqual(requests, [{ path: "/pages", options: { cache: "no-store" } }]);
  assert.deepEqual(result, [{
    ...page,
    blocks: [page.blocks[0], { ...page.blocks[1], fields: {} }],
  }]);
  const heroFields = result[0].blocks[0].fields;
  assert.equal(heroFields.heading, "Welcome");
  assert.deepEqual(result[0].blocks[1].fields, {});
});

test("PageService reads an individual page from the single-resource response", async () => {
  const page = { id: "page-1", title: "About", slug: "about" };
  const requests: Array<{ path: string; options?: RequestInit }> = [];
  const client = {
    get: async (path: string, options?: RequestInit) => {
      requests.push({ path, options });
      return { data: page };
    },
  } as unknown as BackstageClient;
  const options = { cache: "no-store" as const };

  const result = await new PageService(client).getPage("page-1", options);

  assert.deepEqual(result, page);
  assert.deepEqual(requests, [{ path: "/pages/page-1", options }]);
});

test("PageService creates pages with website ownership and optional parent nesting", async () => {
  const page = { id: "page-1", title: "About", slug: "/about" };
  const requests: Array<{ path: string; data: unknown; options?: RequestInit }> = [];
  const client = {
    post: async (path: string, data: unknown, options?: RequestInit) => {
      requests.push({ path, data, options });
      return { data: page };
    },
  } as unknown as BackstageClient;
  const params = {
    title: "About",
    slug: "/about",
    website_id: "website-1",
    parent_id: "parent-1",
    blocks: {
      blocks: [{
        id: "block-1",
        type: "hero",
        variant: "default",
        data: { heading: "Welcome" },
      }],
    },
  };
  const options = { headers: { "X-Test": "true" } };

  const result = await new PageService(client).createPage(params, options);

  assert.deepEqual(result, page);
  assert.deepEqual(requests, [{ path: "/pages", data: params, options }]);
});

test("PageService updates website ownership and allows clearing the parent", async () => {
  const page = { id: "page-1", title: "About", slug: "/about" };
  const requests: Array<{ path: string; data: unknown; options?: RequestInit }> = [];
  const client = {
    put: async (path: string, data: unknown, options?: RequestInit) => {
      requests.push({ path, data, options });
      return { data: page };
    },
  } as unknown as BackstageClient;
  const params = {
    website_id: "website-2",
    parent_id: null,
    blocks: { blocks: [{ id: "block-1", type: "hero", data: { heading: "Updated" } }] },
  };
  const options = { headers: { "X-Test": "true" } };

  const result = await new PageService(client).updatePage("page-1", params, options);

  assert.deepEqual(result, page);
  assert.deepEqual(requests, [{ path: "/pages/page-1", data: params, options }]);
});

test("PageService rejects malformed nonempty Headless block fields", async () => {
  const client = {
    get: async () => ({
      data: [{
        id: "page-1",
        title: "Home",
        slug: "/",
        pathname: "/",
        blocks: [{ id: "block-1", type: "hero", variant: null, fields: ["invalid"] }],
        settings: {},
        is_home: true,
        layout: null,
        meta: { title: "Home", description: null },
      }],
    }),
  } as unknown as BackstageClient;

  await assert.rejects(
    () => new PageService(client).getHeadlessPages(),
    /Headless page block block-1 fields must be object-shaped/,
  );
});

test("PageService normalizes empty layout data and preserves arbitrary field values", async () => {
  const page = {
    id: "page-1",
    title: "Home",
    slug: "/",
    pathname: "/",
    blocks: [],
    settings: {},
    is_home: true,
    layout: {
      id: "layout-1",
      name: "Site layout",
      slug: "site-layout",
      schema: { fields: [] },
      data: [],
    },
    meta: { title: "Home", description: null },
  };
  const client = {
    get: async () => ({ data: [page] }),
  } as unknown as BackstageClient;

  const result = await new PageService(client).getHeadlessPages();
  assert.deepEqual(result[0].layout?.data, {});

  const layoutData = { eyebrow: "Welcome", show_banner: true, media: { id: "media-1" } };
  const populatedClient = {
    get: async () => ({ data: [{ ...page, layout: { ...page.layout, data: layoutData } }] }),
  } as unknown as BackstageClient;
  const populated = await new PageService(populatedClient).getHeadlessPages();

  assert.deepEqual(populated[0].layout?.data, layoutData);
});

test("PageService rejects malformed Headless layout data", async () => {
  const client = {
    get: async () => ({
      data: [{
        id: "page-1",
        title: "Home",
        slug: "/",
        pathname: "/",
        blocks: [],
        settings: {},
        is_home: true,
        layout: {
          id: "layout-1",
          name: "Site layout",
          slug: "site-layout",
          schema: { fields: [] },
          data: ["invalid"],
        },
        meta: { title: "Home", description: null },
      }],
    }),
  } as unknown as BackstageClient;

  await assert.rejects(
    () => new PageService(client).getHeadlessPages(),
    /Headless page page-1 layout data must be object-shaped/,
  );
});
