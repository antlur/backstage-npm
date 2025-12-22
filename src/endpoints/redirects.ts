import type { ApiCollectionResponse, Redirect } from "../types/index";
import { BaseService } from "./base.js";

export class RedirectService extends BaseService {
  async getRedirects(options?: RequestInit): Promise<Redirect[]> {
    const { data } = await this.client.get<ApiCollectionResponse<Redirect>>("/redirects", options);
    return data;
  }
}
