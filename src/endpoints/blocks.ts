import type { ApiCollectionResponse, ApiSingleResponse, AccountBlock } from "../types/index";
import { BaseService } from "./base.js";

export interface CreateBlockParams {
  name: string;
  slug: string;
  schema: any;
  description?: string;
}

export interface UpdateBlockParams {
  name?: string;
  slug?: string;
  schema?: any;
  description?: string;
}

export class BlocksService extends BaseService {
  async list(options?: RequestInit): Promise<AccountBlock[]> {
    const { data } = await this.client.get<ApiCollectionResponse<AccountBlock>>("/blocks", options);
    return data;
  }

  async get(id: string, options?: RequestInit): Promise<AccountBlock | null> {
    try {
      const { data } = await this.client.get<ApiSingleResponse<AccountBlock>>(`/blocks/${id}`, options);
      return data;
    } catch (error) {
      return null;
    }
  }

  async create(params: CreateBlockParams, options?: RequestInit): Promise<AccountBlock> {
    const { data } = await this.client.post<ApiSingleResponse<AccountBlock>>("/blocks", params, options);
    return data;
  }

  async update(id: string, params: UpdateBlockParams, options?: RequestInit): Promise<AccountBlock> {
    const { data } = await this.client.put<ApiSingleResponse<AccountBlock>>(`/blocks/${id}`, params, options);
    return data;
  }

  async delete(id: string, options?: RequestInit): Promise<void> {
    await this.client.delete(`/blocks/${id}`, options);
  }
}
