import type { ApiCollectionResponse, InstagramPost } from "../types/index";
import { BaseService } from "./base.js";

export class InstagramService extends BaseService {
  async latest(options?: RequestInit): Promise<InstagramPost[]> {
    const { data } = await this.client.get<ApiCollectionResponse<InstagramPost>>("/instagram-posts", options);
    return data;
  }
}
