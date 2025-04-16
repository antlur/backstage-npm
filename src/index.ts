// Re-export config
export { defineConfig, getGlobalConfig } from "./config.js";

// Re-export the client class
export { BackstageClient } from "./client.js";

// Re-export endpoints
export * from "./endpoints/alerts.js";
export * from "./endpoints/events.js";
export * from "./endpoints/locations.js";
export * from "./endpoints/media.js";
export * from "./endpoints/menus.js";
export * from "./endpoints/navigation.js";
export * from "./endpoints/pages.js";
export * from "./endpoints/press.js";
export * from "./endpoints/website.js";

// Re-export domain types
export * from "./types/index.js";
