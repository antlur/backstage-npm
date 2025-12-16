import type { ApiSingleResponse } from "../types/index";
import { BaseService } from "./base.js";

interface BlockParams {
  name: string;
  slug: string;
  schema: any;
  description?: string;
}

export class BlocksService extends BaseService {
  /**
   * Get all blocks
   * @todo Implement this method when the API endpoint is available
   */
  async all(options?: RequestInit) {
    throw new Error("Method not implemented. Please use the Backstage API documentation for available endpoints.");
  }

  async create(params: BlockParams, options?: RequestInit) {
    const res = await this.client.post<ApiSingleResponse<BlockParams>>("/blocks", params, options);
    return res.data;
  }

  async update(id: string, params: BlockParams, options?: RequestInit) {
    const res = await this.client.put<ApiSingleResponse<BlockParams>>(`/blocks/${id}`, params, options);
    return res.data;
  }
}
