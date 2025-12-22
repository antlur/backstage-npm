import type { ApiCollectionResponse, ApiSingleResponse, Page } from "../types/index";
import { BaseService } from "./base.js";

export interface CreatePageParams {
  title: string;
  slug: string;
  blocks?: any[];
  settings?: any;
  is_home?: boolean;
  layout_id?: string;
  seo_title?: string;
  seo_description?: string;
}

export interface UpdatePageParams {
  title?: string;
  slug?: string;
  blocks?: any[];
  settings?: any;
  is_home?: boolean;
  layout_id?: string;
  seo_title?: string;
  seo_description?: string;
}

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

  async createPage(params: CreatePageParams, options?: RequestInit): Promise<Page> {
    const { data } = await this.client.post<ApiSingleResponse<Page>>("/pages", params, options);
    return data;
  }

  async updatePage(id: string, params: UpdatePageParams, options?: RequestInit): Promise<Page> {
    const { data } = await this.client.put<ApiSingleResponse<Page>>(`/pages/${id}`, params, options);
    return data;
  }

  async deletePage(id: string, options?: RequestInit): Promise<void> {
    await this.client.delete(`/pages/${id}`, options);
  }
}
