import path from "path";
import { pathToFileURL } from "url";
import { createJiti } from "jiti";
import type { BackstageUserConfig } from "../config.js";

export async function loadBackstageConfig(): Promise<BackstageUserConfig | null> {
  const configPath = path.resolve(process.cwd(), "backstage/config.ts");

  try {
    // Trailing separator so jiti treats the project root as the parent directory.
    const jiti = createJiti(pathToFileURL(path.join(process.cwd(), "/")).href, {
      tsconfigPaths: true,
      jsx: true,
    });

    const config = await jiti.import(configPath, { default: true });

    if (config && typeof config === "object") {
      return config as BackstageUserConfig;
    }

    console.warn("backstage/config.ts does not export a default object");
    return null;
  } catch (error) {
    console.error("Failed to load backstage/config.ts:", error);
    return null;
  }
}
