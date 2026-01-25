// Re-export config
export { defineConfig, getGlobalConfig } from "./config.js";

// Re-export the client class
export { BackstageClient } from "./client.js";

// Re-export endpoints
export * from "./endpoints/alerts.js";
export * from "./endpoints/auth.js";
export * from "./endpoints/blocks.js";
export * from "./endpoints/blueprints.js";
export * from "./endpoints/entries.js";
export * from "./endpoints/events.js";
export * from "./endpoints/forms.js";
export * from "./endpoints/instagram.js";
export * from "./endpoints/layouts.js";
export * from "./endpoints/locations.js";
export * from "./endpoints/media.js";
export * from "./endpoints/menus.js";
export * from "./endpoints/menu-items.js";
export * from "./endpoints/navigation.js";
export * from "./endpoints/pages.js";
export * from "./endpoints/press.js";
export * from "./endpoints/redirects.js";
export * from "./endpoints/routes.js";
export * from "./endpoints/website.js";

// Re-export domain types
export * from "./types/index.js";
