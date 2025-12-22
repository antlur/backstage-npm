import type { ApiCollectionResponse, ApiSingleResponse, AccountLayout } from "../types/index";
import { BaseService } from "./base.js";

export interface CreateLayoutParams {
  name: string;
  slug: string;
  schema: any;
}

export interface UpdateLayoutParams {
  name?: string;
  slug?: string;
  schema?: any;
}

export class LayoutService extends BaseService {
  async list(options?: RequestInit): Promise<AccountLayout[]> {
    const { data } = await this.client.get<ApiCollectionResponse<AccountLayout>>("/layouts", options);
    return data;
  }

  async get(id: string, options?: RequestInit): Promise<AccountLayout | null> {
    try {
      const { data } = await this.client.get<ApiSingleResponse<AccountLayout>>(`/layouts/${id}`, options);
      return data;
    } catch (error) {
      return null;
    }
  }

  async create(params: CreateLayoutParams, options?: RequestInit): Promise<AccountLayout> {
    const { data } = await this.client.post<ApiSingleResponse<AccountLayout>>("/layouts", params, options);
    return data;
  }

  async update(id: string, params: UpdateLayoutParams, options?: RequestInit): Promise<AccountLayout> {
    const { data } = await this.client.put<ApiSingleResponse<AccountLayout>>(`/layouts/${id}`, params, options);
    return data;
  }

  async delete(id: string, options?: RequestInit): Promise<void> {
    await this.client.delete(`/layouts/${id}`, options);
  }
}
