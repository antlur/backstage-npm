import assert from "node:assert/strict";
import test from "node:test";

import type { BackstageClient } from "../client.js";
import { NavigationService } from "./navigation.js";

test("NavigationService builds navigation trees at every nesting depth", async () => {
  const items = [
    { id: "home", text: "Home", parent_id: null },
    { id: "about", text: "About", parent_id: "home" },
    { id: "team", text: "Team", parent_id: "about" },
    { id: "leadership", text: "Leadership", parent_id: "team" },
    { id: "history", text: "History", parent_id: "about" },
    { id: "contact", text: "Contact", parent_id: null },
  ].map((item) => ({
    ...item,
    url: `/${item.id}`,
    html: "",
    new_window: false,
    type: "link",
    style: "",
    children: [],
  }));
  const navigation = { id: "navigation-1", name: "Main", items };
  const requests: Array<{ path: string; options?: RequestInit }> = [];
  const client = {
    get: async (path: string, options?: RequestInit) => {
      requests.push({ path, options });
      return { data: navigation };
    },
  } as unknown as BackstageClient;
  const options = { cache: "no-store" as const };

  const result = await new NavigationService(client).getNavigation("navigation-1", options);

  assert.deepEqual(requests, [{ path: "/navigations/navigation-1", options }]);
  assert.deepEqual(result.items.map((item) => item.id), ["home", "contact"]);
  assert.deepEqual(result.items[0].children.map((item) => item.id), ["about"]);
  assert.deepEqual(result.items[0].children[0].children.map((item) => item.id), ["team", "history"]);
  assert.deepEqual(
    result.items[0].children[0].children[0].children.map((item) => item.id),
    ["leadership"],
  );
});

test("NavigationService reads each navigation from a single-resource detail response", async () => {
  const listedNavigations = [
    { id: "navigation-1", name: "Main", items: [] },
    { id: "navigation-2", name: "Footer", items: [] },
  ];
  const details = new Map([
    ["/navigations/navigation-1", {
      id: "navigation-1",
      name: "Main",
      items: [
        { id: "home", parent_id: null },
        { id: "about", parent_id: "home" },
        { id: "team", parent_id: "about" },
      ],
    }],
    ["/navigations/navigation-2", {
      id: "navigation-2",
      name: "Footer",
      items: [{ id: "privacy", parent_id: null }],
    }],
  ]);
  const requests: Array<{ path: string; options?: RequestInit }> = [];
  const client = {
    get: async (path: string, options?: RequestInit) => {
      requests.push({ path, options });
      if (path === "/navigations") {
        return { data: listedNavigations };
      }

      return { data: details.get(path) };
    },
  } as unknown as BackstageClient;
  const options = { cache: "no-store" as const };

  const service = new NavigationService(client);
  const result = await service.getNavigations(options);

  assert.deepEqual(result[0].items[0].children[0].children.map((item) => item.id), ["team"]);
  assert.deepEqual(result[1].items.map((item) => item.id), ["privacy"]);
  const defaultNavigation = await service.getDefaultNavigation(options);
  assert.equal(defaultNavigation.id, "navigation-1");
  assert.deepEqual(defaultNavigation.items[0].children[0].children.map((item) => item.id), ["team"]);
  assert.deepEqual(requests, [
    { path: "/navigations", options },
    { path: "/navigations/navigation-1", options },
    { path: "/navigations/navigation-2", options },
    { path: "/navigations", options },
    { path: "/navigations/navigation-1", options },
    { path: "/navigations/navigation-2", options },
  ]);
});
