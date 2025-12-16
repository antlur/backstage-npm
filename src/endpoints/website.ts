import type { ApiCollectionResponse, Website } from "../types/index";
import { BaseService } from "./base.js";

export class WebsiteService extends BaseService {
  async getWebsite(options?: RequestInit): Promise<Website> {
    const res = await this.client.get<ApiCollectionResponse<Website>>("/websites", options);
    return res.data[0];
  }

  async routes(options?: RequestInit): Promise<string[]> {
    const website = await this.getWebsite(options);

    return this.client.get<string[]>(`/websites/${website.id}/routes`, options);
  }
}
