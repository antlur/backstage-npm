import { ApiCollectionResponse, Media } from "../types";
import { BaseService } from "./base";

export class MediaService extends BaseService {
  async all() {
    const res = await this.client.get<ApiCollectionResponse<Media>>("/media");
    return res.data;
  }
}
