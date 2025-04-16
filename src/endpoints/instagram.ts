import { ApiCollectionResponse, InstagramPost } from "../types/index.js";
import { BaseService } from "./base.js";

export class InstagramService extends BaseService {
  async latest(): Promise<InstagramPost[]> {
    const { data } = await this.client.get<ApiCollectionResponse<InstagramPost>>("/instagram-posts");
    return data;
  }
}
