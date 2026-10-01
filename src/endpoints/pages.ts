import type { ApiCollectionResponse, ApiSingleResponse, HeadlessPage, Page, PageBlocksWriteInput } from "../types/index";
import type { AccountLayout } from "../types/account-layout.js";
import { BaseService } from "./base.js";

type HeadlessPageResponse = Omit<HeadlessPage, "blocks" | "layout"> & {
  blocks: Array<Omit<HeadlessPage["blocks"][number], "fields"> & { fields: unknown }>;
  layout: (Omit<AccountLayout, "data"> & { data: unknown }) | null;
};

function normalizeObject(value: unknown, context: string): Record<string, unknown> {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (Array.isArray(value) && value.length === 0) {
    return {};
  }

  throw new TypeError(`${context} must be object-shaped.`);
}

export interface CreatePageParams {
  title: string;
  slug: string;
  website_id: string;
  parent_id?: string | null;
  blocks?: PageBlocksWriteInput;
  settings?: any;
  is_home?: boolean;
  layout_id?: string;
  seo_title?: string;
  seo_description?: string;
}

export interface UpdatePageParams {
  title?: string;
  slug?: string;
  website_id?: string;
  parent_id?: string | null;
  blocks?: PageBlocksWriteInput;
  settings?: any;
  is_home?: boolean;
  layout_id?: string;
  seo_title?: string;
  seo_description?: string;
}

export class PageService extends BaseService {
  /** Reads pages in the account's Headless block shape. */
  async getHeadlessPages(options?: RequestInit): Promise<HeadlessPage[]> {
    const { data } = await this.client.get<ApiCollectionResponse<HeadlessPageResponse>>("/pages", options);

    return data.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => ({
        ...block,
        fields: normalizeObject(block.fields, `Headless page block ${block.id} fields`),
      })),
      layout: page.layout
        ? { ...page.layout, data: normalizeObject(page.layout.data, `Headless page ${page.id} layout data`) }
        : null,
    }));
  }

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
