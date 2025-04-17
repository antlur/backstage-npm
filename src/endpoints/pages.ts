import type { ApiCollectionResponse, Page } from "../types/index";
import { BaseService } from "./base.js";

export class PageService extends BaseService {
  async getPages(): Promise<Page[]> {
    const res = await this.client.get<ApiCollectionResponse<Page>>("/pages");
    return res.data;
  }

  async getPage(id: string): Promise<Page> {
    const res = await this.client.get<ApiCollectionResponse<Page>>(`/pages/${id}`);
    return res.data[0];
  }

  async getPageBySlug(slug: string): Promise<Page> {
    const res = await this.client.get<ApiCollectionResponse<Page>>(`/pages?filter[slug]=${slug}`);
    return res.data[0];
  }

  async getHomePage(): Promise<Page> {
    const res = await this.client.get<ApiCollectionResponse<Page>>("/pages?filter[slug]=/");
    return res.data[0];
  }

  async getPageByPathname(pathname: string): Promise<Page> {
    const res = await this.client.get<ApiCollectionResponse<Page>>(`/pages?filter[pathname]=${pathname}`);
    return res.data[0];
  }
}
