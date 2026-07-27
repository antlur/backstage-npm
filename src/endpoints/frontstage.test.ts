import assert from "node:assert/strict";
import test from "node:test";

import type { BackstageClient } from "../client.js";
import type { FrontstageRoute, FrontstageSiteResponse } from "../types/frontstage.js";
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

test("Frontstage contracts expose rendering modes, route settings, and structured location data", () => {
  const modes: Pick<FrontstageSiteResponse["site"], "rendererMode" | "routingMode" | "routeSettings"> = {
    rendererMode: "frontstage",
    routingMode: "managed",
    routeSettings: {
      locations: "locations",
      location: "location",
      menus: "menu",
      events: "events",
      press: "press",
      locationAtRoot: false,
      nestLocationEntries: true
    }
  };
  const contact: NonNullable<FrontstageSiteResponse["contact"]> = {
    postalAddress: {
      streetAddress: "55 W Illinois St, Suite 200",
      addressLocality: "Chicago",
      addressRegion: "IL",
      postalCode: "60654"
    },
    geo: {
      latitude: 41.890407,
      longitude: -87.632448
    }
  };
  const route: FrontstageRoute = {
    path: "/menu",
    source: "module"
  };

  assert.equal(modes.rendererMode, "frontstage");
  assert.equal(modes.routeSettings?.nestLocationEntries, true);
  assert.equal(contact.postalAddress?.addressLocality, "Chicago");
  assert.equal(route.source, "module");
});
