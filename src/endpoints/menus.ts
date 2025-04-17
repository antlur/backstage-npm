import type { ApiCollectionResponse, Menu } from "../types/index";
import { BaseService } from "./base.js";

export class MenuService extends BaseService {
  async getMenus(): Promise<Menu[]> {
    const res = await this.client.get<ApiCollectionResponse<Menu>>("/menus");
    const menus = res.data;
    return menus;
  }

  async getMenu(id: string) {
    const res = await this.client.get<ApiCollectionResponse<Menu>>(`/menus?filter[id]=${id}&include=categories.items`);
    const data = res.data;

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    return data;
  }

  async getMenuBySlug(slug: string) {
    const res = await this.client.get<ApiCollectionResponse<Menu>>(
      `/menus?filter[slug]=${slug}&include=categories.items`
    );
    const data = res.data;

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    return data;
  }
}
