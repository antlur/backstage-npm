import { ApiCollectionResponse, Website } from "../types";
import { BaseService } from "./base";

export class WebsiteService extends BaseService {
  async getWebsite(): Promise<Website> {
    const res = await this.client.get<ApiCollectionResponse<Website>>("/websites");
    return res.data[0];
  }
}
