// Re-export config
export { defineConfig, getGlobalConfig } from "./config";

// Re-export the client class
export { BackstageClient } from "./client";

// Re-export endpoints
export * from "./endpoints/alerts";
export * from "./endpoints/events";
export * from "./endpoints/locations";
export * from "./endpoints/menus";
export * from "./endpoints/navigation";
export * from "./endpoints/pages";
export * from "./endpoints/press";
export * from "./endpoints/website";

// Re-export domain types
export * from "./types";
