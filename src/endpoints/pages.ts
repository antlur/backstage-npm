import { ApiCollectionResponse, Page } from "../types";
import { BaseService } from "./base";

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
}
