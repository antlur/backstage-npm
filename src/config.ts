const ROOT = process.cwd();
const CONFIG_PATH = process.env.BACKSTAGE_CONFIG_PATH || "./backstage.config";
const DEFAULT_BASE_URL = "https://bckstg.app/api";

export interface BackstageUserConfig {
  baseURL: string;
  token: string;
  accountId: string;
  onError?: (error: Error) => void;
  fetchOptions?: RequestInit;
}

let globalConfig: BackstageUserConfig | null = null;

export function defineConfig(config: BackstageUserConfig): void {
  globalConfig = config;
}

export function getGlobalConfig(): BackstageUserConfig | null {
  return globalConfig;
}
