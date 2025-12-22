import type { ApiCollectionResponse, ApiSingleResponse, Menu } from "../types/index";
import { BaseService } from "./base.js";

export interface CreateMenuParams {
  title: string;
  slug: string;
  subtitle?: string;
  is_default?: boolean;
}

export interface UpdateMenuParams {
  title?: string;
  slug?: string;
  subtitle?: string;
  is_default?: boolean;
}

export class MenuService extends BaseService {
  async getMenus(options?: RequestInit): Promise<Menu[]> {
    const res = await this.client.get<ApiCollectionResponse<Menu>>("/menus", options);
    const menus = res.data;
    return menus;
  }

  async getMenu(id: string, options?: RequestInit) {
    const res = await this.client.get<ApiCollectionResponse<Menu>>(
      `/menus?filter[id]=${id}&include=categories.items`,
      options
    );
    const data = res.data;

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    return data;
  }

  async getMenuBySlug(slug: string, options?: RequestInit) {
    const res = await this.client.get<ApiCollectionResponse<Menu>>(
      `/menus?filter[slug]=${slug}&include=categories.items`,
      options
    );
    const data = res.data;

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    return data;
  }

  async createMenu(params: CreateMenuParams, options?: RequestInit): Promise<Menu> {
    const { data } = await this.client.post<ApiSingleResponse<Menu>>("/menus", params, options);
    return data;
  }

  async updateMenu(id: string, params: UpdateMenuParams, options?: RequestInit): Promise<Menu> {
    const { data } = await this.client.put<ApiSingleResponse<Menu>>(`/menus/${id}`, params, options);
    return data;
  }

  async deleteMenu(id: string, options?: RequestInit): Promise<void> {
    await this.client.delete(`/menus/${id}`, options);
  }
}
