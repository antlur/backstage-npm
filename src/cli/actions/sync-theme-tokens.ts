import { BackstageClient } from "../../client.js";
import type { BackstageUserConfig } from "../../config.js";
import { validateThemeTokenDeclarations } from "../../theme-tokens/declarations.js";
import type { ThemeTokenDeclarations } from "../../types/theme-tokens.js";

function comparable(tokens: ThemeTokenDeclarations): string {
  return JSON.stringify(Object.keys(tokens).sort().map((key) => [key, tokens[key]]));
}

/** Register declarations only. The website API preserves all editor overrides. */
export async function syncThemeTokens(
  config: BackstageUserConfig,
  options: { dryRun?: boolean } = {},
): Promise<{ websiteId: string; changed: boolean } | null> {
  if (config.themeTokens === undefined) {
    console.log("No theme token declarations found in config");
    return null;
  }

  const tokens = validateThemeTokenDeclarations(config.themeTokens);
  const client = new BackstageClient(config);
  const websites = await client.website.getWebsites();
  if (!Array.isArray(websites) || websites.length !== 1 || !websites[0].id) {
    throw new Error("Theme token sync requires exactly one website in the selected account.");
  }
  const website = websites[0];
  if (!website.theme_tokens || !Object.hasOwn(website.theme_tokens, "tokens")) {
    throw new Error("This Backstage server does not expose theme token declarations. Update the server before syncing.");
  }
  const current = validateThemeTokenDeclarations(website.theme_tokens.tokens);
  const changed = comparable(tokens) !== comparable(current);

  if (changed && !options.dryRun) {
    await client.website.updateWebsite(website.id, { theme_tokens: { tokens } });
  }
  console.log(`Theme tokens ${options.dryRun ? "preview" : "sync"}: ${changed ? (options.dryRun ? "would update" : "updated") : "unchanged"}`);
  return { websiteId: website.id, changed };
}
