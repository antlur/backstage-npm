import { existsSync } from "node:fs";
import path from "path";
import { pathToFileURL } from "url";
import { createJiti } from "jiti";
import type { BackstageUserConfig } from "../config.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateConfig(value: unknown): BackstageUserConfig {
  if (!isRecord(value)) {
    throw new Error("does not export a default object");
  }

  if (
    value.blockManifestDirectory !== undefined &&
    (typeof value.blockManifestDirectory !== "string" || value.blockManifestDirectory.trim() === "")
  ) {
    throw new Error("blockManifestDirectory must be a non-empty string when provided");
  }

  if (value.layouts !== undefined && !Array.isArray(value.layouts)) {
    throw new Error("layouts must be an array when provided");
  }

  return value as BackstageUserConfig;
}

export async function loadBackstageConfig(): Promise<BackstageUserConfig | null> {
  const rootConfigPath = path.resolve(process.cwd(), "backstage.config.ts");
  const legacyConfigPath = path.resolve(process.cwd(), "backstage/config.ts");
  const rootConfigExists = existsSync(rootConfigPath);
  const legacyConfigExists = existsSync(legacyConfigPath);

  if (rootConfigExists && legacyConfigExists) {
    console.warn("Both backstage.config.ts and backstage/config.ts exist; using backstage.config.ts.");
  }

  const configPath = rootConfigExists ? rootConfigPath : legacyConfigExists ? legacyConfigPath : null;

  if (!configPath) return null;

  try {
    // Trailing separator so jiti treats the project root as the parent directory.
    const jiti = createJiti(pathToFileURL(path.join(process.cwd(), "/")).href, {
      tsconfigPaths: true,
      jsx: true,
    });

    const config = await jiti.import(configPath, { default: true });

    return validateConfig(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load ${path.relative(process.cwd(), configPath)}: ${message}`);
  }
}
