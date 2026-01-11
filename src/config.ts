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

let globalConfig: BackstageUserConfig = {
  baseURL: process.env.BACKSTAGE_API_URL ?? DEFAULT_BASE_URL,
  token: process.env.BACKSTAGE_API_KEY ?? undefined,
  accountId: process.env.BACKSTAGE_ACCOUNT_ID ?? undefined,
};

export function defineConfig(config: BackstageUserConfig): BackstageUserConfig {
  globalConfig = {
    ...globalConfig,
    ...config,
  };
  return globalConfig;
}

export function getGlobalConfig(): BackstageUserConfig {
  // read the config from the project root
  return globalConfig;
}
