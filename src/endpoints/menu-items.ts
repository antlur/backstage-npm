import type { ApiCollectionResponse, ApiSingleResponse, MenuItem } from "../types/index";
import { BaseService } from "./base.js";

export interface CreateMenuItemParams {
  title: string;
  nickname?: string | null;
  post_title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  price?: string | null;
  price2?: string | null;
  prices?: Array<{ label?: string; price?: string | number }> | null;
  has_multiple_prices?: boolean;
  has_hidden_price?: boolean;
  price_type?: string | null;
  image_id?: number | null;
  dietary_tags?: string[] | null;
}

export interface UpdateMenuItemParams extends Partial<CreateMenuItemParams> {}

export class MenuItemService extends BaseService {
  async list(options?: RequestInit): Promise<MenuItem[]> {
    const { data } = await this.client.get<ApiCollectionResponse<MenuItem>>("/menu-items", options);
    return data;
  }

  async get(id: string, options?: RequestInit): Promise<MenuItem | null> {
    try {
      const { data } = await this.client.get<ApiSingleResponse<MenuItem>>(`/menu-items/${id}`, options);
      return data;
    } catch (error) {
      return null;
    }
  }

  async create(params: CreateMenuItemParams, options?: RequestInit): Promise<MenuItem> {
    const { data } = await this.client.post<ApiSingleResponse<MenuItem>>("/menu-items", params, options);
    return data;
  }

  async update(id: string, params: UpdateMenuItemParams, options?: RequestInit): Promise<MenuItem> {
    const { data } = await this.client.put<ApiSingleResponse<MenuItem>>(`/menu-items/${id}`, params, options);
    return data;
  }

  async delete(id: string, options?: RequestInit): Promise<void> {
    await this.client.delete(`/menu-items/${id}`, options);
  }
}
