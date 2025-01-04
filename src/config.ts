import { AxiosError } from "axios";

const ROOT = process.cwd();
const CONFIG_PATH = process.env.BACKSTAGE_CONFIG_PATH || "./backstage.config";
const DEFAULT_BASE_URL = "https://bckstg.app/api";

export interface BackstageUserConfig {
  accountId?: string | undefined;
  token?: string | undefined;
  baseURL?: string;
  onError?: (error: AxiosError) => void;
}

let globalConfig: BackstageUserConfig = {
  baseURL: DEFAULT_BASE_URL,
};

export function defineConfig(config: BackstageUserConfig): BackstageUserConfig {
  console.log("Define config", config);
  globalConfig = {
    ...globalConfig,
    ...config,
  };
  console.log("Global config", globalConfig);
  return globalConfig;
}

export function getGlobalConfig(): BackstageUserConfig {
  // read the config from the project root
  return globalConfig;
}
