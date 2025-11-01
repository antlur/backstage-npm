import type { ApiCollectionResponse, Page } from "../types/index";
import { BaseService } from "./base.js";

export class PageService extends BaseService {
  async getPages(): Promise<Page[]> {
    const res = await this.client.get<ApiCollectionResponse<Page>>("/pages");
    return res.data;
  }

  async getPage(id: string): Promise<Page | null> {
    const res = await this.client.get<ApiCollectionResponse<Page>>(`/pages/${id}`);
    if (!res.data || res.data.length === 0) {
      return null;
    }
    return res.data[0];
  }

  async getPageBySlug(slug: string): Promise<Page | null> {
    const res = await this.client.get<ApiCollectionResponse<Page>>(`/pages?filter[slug]=${slug}`);
    if (!res.data || res.data.length === 0) {
      return null;
    }
    return res.data[0];
  }

  async getHomePage(): Promise<Page | null> {
    const res = await this.client.get<ApiCollectionResponse<Page>>("/pages?filter[slug]=/");
    if (!res.data || res.data.length === 0) {
      return null;
    }
    return res.data[0];
  }

  async getPageByPathname(pathname: string): Promise<Page | null> {
    const res = await this.client.get<ApiCollectionResponse<Page>>(`/pages?filter[pathname]=${pathname}`);
    if (!res.data || res.data.length === 0) {
      return null;
    }
    return res.data[0];
  }
}
