import type { ApiCollectionResponse, ApiSingleResponse, Press } from "../types/index";
import { BaseService } from "./base.js";

export interface PressSeoParams {
  title?: string;
  description?: string;
}

export interface CreatePressParams {
  title: string;
  source: string;
  published_at: string;
  slug?: string | null;
  url?: string | null;
  featured_media_id?: number | null;
  excerpt?: string | null;
  content?: string | null;
  is_featured?: boolean;
  custom_fields?: Record<string, any> | null;
  location_ids?: string[];
  seo?: PressSeoParams;
}

export interface UpdatePressParams {
  title: string;
  source: string;
  published_at: string;
  slug?: string | null;
  url?: string | null;
  featured_media_id?: number | null;
  excerpt?: string | null;
  content?: string | null;
  is_featured?: boolean;
  custom_fields?: Record<string, any> | null;
  location_ids?: string[];
  seo?: PressSeoParams;
}

export class PressService extends BaseService {
  async getPress(options?: RequestInit): Promise<Press[]> {
    const { data } = await this.client.get<ApiCollectionResponse<Press>>("/press", options);
    return data;
  }

  async getPressItem(id: string, options?: RequestInit): Promise<Press | null> {
    try {
      const { data } = await this.client.get<ApiSingleResponse<Press>>(`/press/${id}`, options);
      return data;
    } catch (error) {
      return null;
    }
  }

  async createPress(params: CreatePressParams, options?: RequestInit): Promise<Press> {
    const { data } = await this.client.post<ApiSingleResponse<Press>>("/press", params, options);
    return data;
  }

  async updatePress(id: string, params: UpdatePressParams, options?: RequestInit): Promise<Press> {
    const { data } = await this.client.put<ApiSingleResponse<Press>>(`/press/${id}`, params, options);
    return data;
  }

  async deletePress(id: string, options?: RequestInit): Promise<void> {
    await this.client.delete(`/press/${id}`, options);
  }
}
