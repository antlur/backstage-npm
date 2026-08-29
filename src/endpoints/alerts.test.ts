import assert from "node:assert/strict";
import test from "node:test";

import type { BackstageClient } from "../client.js";
import type { Alert } from "../types/alert.js";
import { AlertService } from "./alerts.js";

test("AlertService exposes route-aware alert targets without changing the request", async () => {
  const alert = {
    id: "alert-123",
    title: "Weekend hours",
    type: "banner",
    is_global: false,
    published: true,
    pages: [],
    target_mode: "selected",
    targets: [
      {
        type: "destination",
        value: "system:location:location-123",
        label: "River North",
        path: "/locations/river-north",
        resolved: true,
      },
      {
        type: "path",
        value: "/private-events",
        label: "/private-events",
        path: "/private-events",
        resolved: true,
      },
    ],
    start_at: null,
    end_at: null,
    media: null,
    content: "Open late this weekend.",
    cta_label: null,
    cta_url: null,
    analytics_name: null,
    analytics_category: null,
    analytics_label: null,
    position: null,
  } satisfies Alert;
  const requests: Array<{ path: string; options?: RequestInit }> = [];
  const client = {
    get: async (path: string, options?: RequestInit) => {
      requests.push({ path, options });

      return { data: [alert] };
    },
  } as unknown as BackstageClient;

  const service = new AlertService(client);
  const result = await service.getAlerts({ cache: "no-store" });

  assert.deepEqual(requests, [{ path: "/alerts", options: { cache: "no-store" } }]);
  assert.deepEqual(result, [alert]);
  assert.equal(result[0].target_mode, "selected");
  assert.equal(result[0].targets?.[0].path, "/locations/river-north");
});
