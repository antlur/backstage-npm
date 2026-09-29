import assert from "node:assert/strict";
import test from "node:test";

import type { BackstageClient } from "../client.js";
import { WebsiteService } from "./website.js";

test("WebsiteService validates the canonical route list", async () => {
  const client = {
    get: async () => ["/", "/about"],
  } as unknown as BackstageClient;

  assert.deepEqual(await new WebsiteService(client).getWebsiteRoutes("website-1"), ["/", "/about"]);
});

test("WebsiteService rejects a non-string canonical route", async () => {
  const client = {
    get: async () => ["/", { path: "/about" }],
  } as unknown as BackstageClient;

  await assert.rejects(
    () => new WebsiteService(client).getWebsiteRoutes("website-1"),
    /invalid website route list/,
  );
});
