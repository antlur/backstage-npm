import type { ApiCollectionResponse, ApiSingleResponse, Media } from "../types/index";
import { BaseService } from "./base.js";

export class MediaService extends BaseService {
  async all(options?: RequestInit): Promise<Media[]> {
    const res = await this.client.get<ApiCollectionResponse<Media>>("/media", options);
    return res.data;
  }

  async get(id: string, options?: RequestInit): Promise<Media | null> {
    try {
      const { data } = await this.client.get<ApiSingleResponse<Media>>(`/media/${id}`, options);
      return data;
    } catch (error) {
      return null;
    }
  }

  async createFromUrl(source_url: string, options?: RequestInit & { name?: string; alt?: string }): Promise<Media> {
    const { data } = await this.client.post<ApiSingleResponse<Media>>(
      "/media",
      { source_url, name: options?.name, alt: options?.alt },
      options
    );
    return data;
  }

  async upload(file: Blob, options?: { name?: string; alt?: string; request?: RequestInit }): Promise<Media> {
    const formData = new FormData();
    formData.append("file", file);

    if (options?.name) {
      formData.append("name", options.name);
    }

    if (options?.alt) {
      formData.append("alt", options.alt);
    }

    const { data } = await this.client.post<ApiSingleResponse<Media>>("/media", formData, options?.request);
    return data;
  }

  async update(id: string, params: { name?: string; alt?: string }, options?: RequestInit): Promise<Media> {
    const { data } = await this.client.put<ApiSingleResponse<Media>>(`/media/${id}`, params, options);
    return data;
  }

  async delete(id: string, options?: RequestInit): Promise<void> {
    await this.client.delete(`/media/${id}`, options);
  }
}
