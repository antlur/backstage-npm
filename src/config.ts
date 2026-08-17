import type { BlockDefinition } from "./studio/types/index.js";

const DEFAULT_BASE_URL = "https://bckstg.app/api";

export interface BlueprintDefinition {
  name: string;
  slug: string;
  slug_single?: string;
  description?: string;
  is_routable?: boolean;
  has_location?: boolean;
  has_route_index?: boolean;
  fields: Array<{
    name: string;
    slug: string;
    type: string;
    type_id?: string | null;
    is_primary?: boolean;
    is_multiple?: boolean;
    show_in_list?: boolean;
    order: number;
    allowed_references?: string[];
    options?: Array<{ label: string; value: any }>;
    placeholder?: string;
  }>;
}

export interface BackstageUserConfig {
  accountId?: string | undefined;
  token?: string | undefined;
  baseURL?: string;
  blocks?: BlockDefinition<any>[] | undefined;
  blueprints?: BlueprintDefinition[] | undefined;
  layouts?: any[] | undefined;
  onError?: (error: Error) => void;
}

let userConfig: BackstageUserConfig = {};

function envConfig(): BackstageUserConfig {
  return {
    baseURL: process.env.BACKSTAGE_API_URL ?? DEFAULT_BASE_URL,
    token: process.env.BACKSTAGE_API_KEY ?? undefined,
    accountId: process.env.BACKSTAGE_ACCOUNT_ID ?? undefined,
  };
}

function mergeDefined(base: BackstageUserConfig, overrides: BackstageUserConfig): BackstageUserConfig {
  const merged: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      merged[key] = value;
    }
  }

  return merged as BackstageUserConfig;
}

export function defineConfig(config: BackstageUserConfig): BackstageUserConfig {
  userConfig = mergeDefined(userConfig, config);
  return getGlobalConfig();
}

export function getGlobalConfig(): BackstageUserConfig {
  // Env is read lazily so values loaded after this module (e.g. by the CLI's dotenv) still apply.
  return mergeDefined(envConfig(), userConfig);
}

export function resolveConfig(config?: BackstageUserConfig): BackstageUserConfig {
  return config ? mergeDefined(getGlobalConfig(), config) : getGlobalConfig();
}
