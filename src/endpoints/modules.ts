import type { AccountModule, AccountModuleKey, ApiCollectionResponse } from "../types/index";
import { BaseService } from "./base.js";

export class ModulesService extends BaseService {
  async list(options?: RequestInit): Promise<AccountModule[]> {
    const { data } = await this.client.get<ApiCollectionResponse<AccountModule>>("/modules", options);
    return data;
  }

  async isEnabled(moduleKey: AccountModuleKey, options?: RequestInit): Promise<boolean> {
    const modules = await this.list(options);
    return modules.some((module) => module.key === moduleKey && module.enabled);
  }
}
