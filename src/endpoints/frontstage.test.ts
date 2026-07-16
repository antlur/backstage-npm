import assert from "node:assert/strict";
import test from "node:test";

import type { BackstageClient } from "../client.js";
import { FrontstageService } from "./frontstage.js";

test("FrontstageService builds account-scoped page preview requests", async () => {
  const requests: Array<{ path: string; options?: RequestInit }> = [];
  const client = {
    get: async (path: string, options?: RequestInit) => {
      requests.push({ path, options });

      return { page: {} };
    }
  } as unknown as BackstageClient;

  const service = new FrontstageService(client);

  await service.page("/menu/dinner", { preview: true, previewId: "preview-123" }, { cache: "no-store" });

  assert.deepEqual(requests, [
    {
      path: "/frontstage/pages/menu/dinner?preview=true&previewId=preview-123",
      options: { cache: "no-store" }
    }
  ]);
});

test("FrontstageService uses the root page endpoint for an omitted slug", async () => {
  const requests: string[] = [];
  const client = {
    get: async (path: string) => {
      requests.push(path);

      return { page: {} };
    }
  } as unknown as BackstageClient;

  const service = new FrontstageService(client);

  await service.page();
  await service.page("/");

  assert.deepEqual(requests, ["/frontstage/pages", "/frontstage/pages"]);
});
