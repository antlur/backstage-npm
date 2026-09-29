import assert from "node:assert/strict";
import test from "node:test";

import type { BackstageClient } from "../client.js";
import { RouteService } from "./routes.js";

test("RouteService validates and returns Backstage route resolutions", async () => {
  const requests: string[] = [];
  const client = {
    get: async (path: string) => {
      requests.push(path);

      return {
        type: "page",
        data: { id: "page-1" },
        meta: { id: "page-1", type: "page", path: "/about" },
      };
    },
  } as unknown as BackstageClient;
  const service = new RouteService(client);

  const route = await service.resolve("/about?x=1");

  assert.equal(route.type, "page");
  assert.equal(route.meta.path, "/about");
  assert.deepEqual(requests, ["/routes/resolve?path=%2Fabout%3Fx%3D1"]);
});

test("RouteService rejects malformed route resolutions", async () => {
  const client = {
    get: async () => ({ type: "page", data: {}, meta: [] }),
  } as unknown as BackstageClient;

  await assert.rejects(
    () => new RouteService(client).resolve("/about"),
    /invalid route resolution response/,
  );
});
