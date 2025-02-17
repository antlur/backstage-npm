import path from "path";
import { createServer, mergeConfig, loadConfigFromFile } from "vite";
import type { BackstageUserConfig } from "../config";

export async function loadBackstageConfig(): Promise<BackstageUserConfig | null> {
  try {
    const configPath = path.resolve(process.cwd(), "backstage/config.ts");

    // Load user's Vite configuration
    const userViteConfig = await loadConfigFromFile({
      command: "serve",
      mode: "development",
    });

    // This is a hack because the react-router plugin was throwing errors
    const userPlugins = userViteConfig?.config?.plugins?.filter((plugin: any) => {
      return plugin.name === "vite-tsconfig-paths";
    });
    // @ts-ignore
    userViteConfig.config.plugins = userPlugins;

    // Merge with defaults
    const viteConfig = mergeConfig(userViteConfig?.config ?? {}, {
      configFile: false, // Disable auto config loading
      resolve: {
        alias: userViteConfig?.config?.resolve?.alias ?? {},
      },
      server: { middlewareMode: true },
    });

    // Create Vite server with user's aliases
    const server = await createServer(viteConfig);

    // Dynamically import the config
    const module = await server.ssrLoadModule(configPath);
    await server.close();

    if (module && typeof module.default === "object") {
      return module.default;
    } else {
      console.warn("backstage/config.ts does not export a default object");
      return null;
    }
  } catch (error) {
    console.error("Failed to load backstage/config.ts:", error);
    return null;
  }
}
