import { ApiCollectionResponse, Press } from "../types";
import { BaseService } from "./base.js";

export class PressService extends BaseService {
  async getPress(): Promise<Press[]> {
    const { data } = await this.client.get<ApiCollectionResponse<Press>>("/press");
    return data;
  }
}
