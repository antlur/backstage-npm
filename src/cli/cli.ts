#!/usr/bin/env node

// Must be first: ESM evaluates imports in order, and later modules read process.env at load time.
import "./load-env.js";

import { program } from "commander";
import { loadBackstageConfig } from "./load-config.js";
import { syncBlocks } from "./actions/sync-blocks.js";
import { syncBlueprints } from "./actions/sync-blueprints.js";
import { syncThemeTokens } from "./actions/sync-theme-tokens.js";
import { syncLayouts } from "./actions/sync-layouts.js";
import { validateManifestPath } from "./actions/block-manifests.js";

program
  .name("backstage")
  .description("CLI tool for Backstage CMS")
  .version(process.env.npm_package_version || "1.0.0");

program
  .command("sync [type]")
  .description("Sync blocks, blueprints, layouts, and theme tokens with the Backstage CMS")
  .option("--dry-run", "Preview block manifest or layout changes without writing (use with sync blocks, layouts, or theme-tokens)")
  .action(async (type = "all", options) => {
    if (options.dryRun && type !== "blocks" && type !== "layouts" && type !== "theme-tokens") {
      throw new Error("--dry-run is supported only with 'backstage sync blocks', 'backstage sync layouts', or 'backstage sync theme-tokens'.");
    }

    const backstageConfig = await loadBackstageConfig();

    if (!backstageConfig) {
      console.error("No Backstage config found. Add backstage.config.ts (or the legacy backstage/config.ts).");
      process.exitCode = 1;
      return;
    }

    if (type === "blocks") {
      await syncBlocks(backstageConfig, { dryRun: options.dryRun });
      return;
    }

    if (type === "blueprints") {
      await syncBlueprints(backstageConfig);
      return;
    }

    if (type === "layouts") {
      await syncLayouts(backstageConfig, { dryRun: options.dryRun });
      return;
    }

    if (type === "theme-tokens") {
      await syncThemeTokens(backstageConfig, { dryRun: options.dryRun });
      return;
    }

    if (type === "all") {
      await syncBlocks(backstageConfig);
      await syncBlueprints(backstageConfig);
      await syncLayouts(backstageConfig);
      await syncThemeTokens(backstageConfig);
      return;
    }

    console.error(`Unknown type: ${type}. Valid types are: blocks, blueprints, layouts, theme-tokens, all`);
    process.exit(1);
  });

const blocks = program.command("block").description("Validate project-owned block manifests");

blocks.command("validate [path]")
  .description("Validate one manifest file or all manifests under a directory")
  .action(async (path) => {
    const config = path === undefined ? await loadBackstageConfig() : null;
    const identities = await validateManifestPath(path ?? config?.blockManifestDirectory);
    for (const identity of identities) console.log(`Valid: ${identity}`);
    console.log(`Validated ${identities.length} block manifest(s).`);
  });

program.parseAsync().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
