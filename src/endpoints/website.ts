import type { ApiCollectionResponse, ApiSingleResponse, Website } from "../types/index";
import { BaseService } from "./base.js";

export interface CreateWebsiteParams {
  app_name: string;
  domain: string;
  [key: string]: any;
}

export interface UpdateWebsiteParams {
  app_name?: string;
  domain?: string;
  [key: string]: any;
}

export class WebsiteService extends BaseService {
  async getWebsites(options?: RequestInit): Promise<Website[]> {
    const { data } = await this.client.get<ApiCollectionResponse<Website>>("/websites", options);
    return data;
  }

  async getWebsiteById(id: string, options?: RequestInit): Promise<Website | null> {
    try {
      const { data } = await this.client.get<ApiSingleResponse<Website>>(`/websites/${id}`, options);
      return data;
    } catch (error) {
      return null;
    }
  }

  async getWebsite(options?: RequestInit): Promise<Website> {
    // Handle case where id might be an object (e.g., RequestInit passed as first param)
    // if (id && typeof id === "string") {
    //   const { data } = await this.client.get<ApiSingleResponse<Website>>(`/websites/${id}`, options);
    //   return data;
    // }
    const res = await this.client.get<ApiCollectionResponse<Website>>("/websites", options);
    return res.data[0];
  }

  async createWebsite(params: CreateWebsiteParams, options?: RequestInit): Promise<Website> {
    const { data } = await this.client.post<ApiSingleResponse<Website>>("/websites", params, options);
    return data;
  }

  async updateWebsite(id: string, params: UpdateWebsiteParams, options?: RequestInit): Promise<Website> {
    const { data } = await this.client.put<ApiSingleResponse<Website>>(`/websites/${id}`, params, options);
    return data;
  }

  async getWebsiteRoutes(websiteId: string, options?: RequestInit): Promise<string[]> {
    return this.client.get<string[]>(`/websites/${websiteId}/routes`, options);
  }

  async routes(options?: RequestInit): Promise<string[]> {
    const website = await this.getWebsite(options);
    return this.getWebsiteRoutes(website.id, options);
  }
}
