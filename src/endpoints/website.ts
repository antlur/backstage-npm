import { ApiCollectionResponse, Website } from "../types";
import { BaseService } from "./base.js";

export class WebsiteService extends BaseService {
  async getWebsite(): Promise<Website> {
    const res = await this.client.get<ApiCollectionResponse<Website>>("/websites");
    return res.data[0];
  }

  async routes(): Promise<string[]> {
    const website = await this.getWebsite();

    return this.client.get<string[]>(`/websites/${website.id}/routes`);
  }
}
