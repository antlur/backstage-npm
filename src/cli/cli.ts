#!/usr/bin/env node

import { config } from "dotenv";
import { resolve } from "path";
import { program } from "commander";
import { loadBackstageConfig } from "./load-config.js";
import { syncBlocks } from "./actions/sync-blocks.js";
import { syncLayouts } from "./actions/sync-layouts.js";

config({ path: resolve(process.cwd(), ".env") });

program
  .name("backstage")
  .description("CLI tool for Backstage CMS")
  .version(process.env.npm_package_version || "1.0.0");

program
  .command("sync <type>")
  .description("Sync blocks and layouts with the Backstage CMS")
  .action(async (type) => {
    const backstageConfig = await loadBackstageConfig();

    if (!backstageConfig) {
      console.error("Failed to load backstage.config.ts");
      return;
    }

    if (type === "blocks") {
      syncBlocks(backstageConfig);
    }

    if (type === "layouts") {
      syncLayouts(backstageConfig);
    }

    if (type === "all") {
      syncBlocks(backstageConfig);
      syncLayouts(backstageConfig);
    }

    console.error(`Unknown type: ${type}`);
    return;
  });

program.parse();
