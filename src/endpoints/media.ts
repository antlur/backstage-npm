import { ApiCollectionResponse, Media } from "../types/index.js";
import { BaseService } from "./base.js";

export class MediaService extends BaseService {
  async all() {
    const res = await this.client.get<ApiCollectionResponse<Media>>("/media");
    return res.data;
  }
}
