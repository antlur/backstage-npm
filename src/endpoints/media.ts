import type { ApiCollectionResponse, Media } from "../types/index";
import { BaseService } from "./base.js";

export class MediaService extends BaseService {
  async all(options?: RequestInit) {
    const res = await this.client.get<ApiCollectionResponse<Media>>("/media", options);
    return res.data;
  }
}
