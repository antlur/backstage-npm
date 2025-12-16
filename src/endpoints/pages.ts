import type { ApiCollectionResponse, Page } from "../types/index";
import { BaseService } from "./base.js";

export class PageService extends BaseService {
  async getPages(options?: RequestInit): Promise<Page[]> {
    const res = await this.client.get<ApiCollectionResponse<Page>>("/pages", options);
    return res.data;
  }

  async getPage(id: string, options?: RequestInit): Promise<Page | null> {
    const res = await this.client.get<ApiCollectionResponse<Page>>(`/pages/${id}`, options);
    if (!res.data || res.data.length === 0) {
      return null;
    }
    return res.data[0];
  }

  async getPageBySlug(slug: string, options?: RequestInit): Promise<Page | null> {
    const res = await this.client.get<ApiCollectionResponse<Page>>(`/pages?filter[slug]=${slug}`, options);
    if (!res.data || res.data.length === 0) {
      return null;
    }
    return res.data[0];
  }

  async getHomePage(options?: RequestInit): Promise<Page | null> {
    const res = await this.client.get<ApiCollectionResponse<Page>>("/pages?filter[slug]=/", options);
    if (!res.data || res.data.length === 0) {
      return null;
    }
    return res.data[0];
  }

  async getPageByPathname(pathname: string, options?: RequestInit): Promise<Page | null> {
    const res = await this.client.get<ApiCollectionResponse<Page>>(`/pages?filter[pathname]=${pathname}`, options);
    if (!res.data || res.data.length === 0) {
      return null;
    }
    return res.data[0];
  }
}
