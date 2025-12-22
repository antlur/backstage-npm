import type { ApiCollectionResponse, ApiSingleResponse, Entry } from "../types/index";
import { BaseService } from "./base.js";

export interface CreateEntryParams {
  blueprint_id: string;
  location_id?: string;
  slug?: string;
  data: Record<string, any>;
  seo?: {
    title?: string;
    description?: string;
  };
  status?: string;
}

export interface UpdateEntryParams {
  slug?: string;
  data?: Record<string, any>;
  seo?: {
    title?: string;
    description?: string;
  };
  status?: string;
}

export class EntryService extends BaseService {
  async getEntries(options?: RequestInit): Promise<Entry[]> {
    const { data } = await this.client.get<ApiCollectionResponse<Entry>>("/entries", options);
    return data;
  }

  async getEntry(id: string, options?: RequestInit): Promise<Entry | null> {
    try {
      const { data } = await this.client.get<ApiSingleResponse<Entry>>(`/entries/${id}`, options);
      return data;
    } catch (error) {
      return null;
    }
  }

  async getCollection(blueprintSlug: string, options?: RequestInit): Promise<Entry[]> {
    const { data } = await this.client.get<ApiCollectionResponse<Entry>>(
      `/collections/${blueprintSlug}`,
      options
    );
    return data;
  }

  async createEntry(params: CreateEntryParams, options?: RequestInit): Promise<Entry> {
    const { data } = await this.client.post<ApiSingleResponse<Entry>>("/entries", params, options);
    return data;
  }

  async updateEntry(id: string, params: UpdateEntryParams, options?: RequestInit): Promise<Entry> {
    const { data } = await this.client.put<ApiSingleResponse<Entry>>(`/entries/${id}`, params, options);
    return data;
  }

  async deleteEntry(id: string, options?: RequestInit): Promise<void> {
    await this.client.delete(`/entries/${id}`, options);
  }
}
