#!/usr/bin/env node

// Must be first: ESM evaluates imports in order, and later modules read process.env at load time.
import "./load-env.js";

import { program } from "commander";
import { loadBackstageConfig } from "./load-config.js";
import { syncBlocks } from "./actions/sync-blocks.js";
import { syncBlueprints } from "./actions/sync-blueprints.js";
import { syncLayouts } from "./actions/sync-layouts.js";
import {
  forkBlock,
  installBlock,
  listBlocks,
  searchBlocks,
  validateManifestPath,
} from "./actions/block-manifests.js";

program
  .name("backstage")
  .description("CLI tool for Backstage CMS")
  .version(process.env.npm_package_version || "1.0.0");

program
  .command("sync [type]")
  .description("Sync blocks, blueprints, and layouts with the Backstage CMS")
  .action(async (type = "all") => {
    const backstageConfig = await loadBackstageConfig();

    if (!backstageConfig) {
      console.error("Failed to load backstage/config.ts");
      process.exitCode = 1;
      return;
    }

    if (type === "blocks") {
      await syncBlocks(backstageConfig);
      return;
    }

    if (type === "blueprints") {
      await syncBlueprints(backstageConfig);
      return;
    }

    if (type === "layouts") {
      await syncLayouts(backstageConfig);
      return;
    }

    if (type === "all") {
      await syncBlocks(backstageConfig);
      await syncBlueprints(backstageConfig);
      await syncLayouts(backstageConfig);
      return;
    }

    console.error(`Unknown type: ${type}. Valid types are: blocks, blueprints, layouts, all`);
    process.exit(1);
  });

const blocks = program.command("block").description("Discover, install, fork, and validate semantic block manifests");

blocks.command("list").description("List the SDK block registry").action(() => {
  for (const item of listBlocks()) console.log(item);
});

blocks.command("search <query>").description("Search the SDK block registry").action((query) => {
  const results = searchBlocks(query);
  for (const item of results) console.log(item);
  if (results.length === 0) console.log("No matching blocks found.");
});

blocks
  .command("install <identity>")
  .description("Install a registry block manifest and Astro renderer scaffold")
  .action(async (identity) => {
    const directory = await installBlock(identity);
    console.log(`Installed ${identity} in ${directory}`);
  });

blocks.command("fork <identity>")
  .description("Fork a registry block's semantic contract into a site namespace")
  .requiredOption("--namespace <namespace>", "Site or project namespace")
  .option("--slug <slug>", "Local Backstage slug (defaults to <namespace>-<key>)")
  .action(async (identity, options) => {
    const directory = await forkBlock(identity, options.namespace, options.slug);
    console.log(`Forked ${identity} into ${directory}`);
  });

blocks.command("validate [path]")
  .description("Validate one manifest file or all manifests under a directory")
  .action(async (path) => {
    const identities = await validateManifestPath(path);
    for (const identity of identities) console.log(`Valid: ${identity}`);
    console.log(`Validated ${identities.length} block manifest(s).`);
  });

program.parseAsync().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
