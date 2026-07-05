import type {
  FrontstageBlocksResponse,
  FrontstagePageResponse,
  FrontstagePreviewParams,
  FrontstageRoutesResponse,
  FrontstageSiteResponse,
} from "../types/index.js";
import { BaseService } from "./base.js";

function frontstageQuery(params?: FrontstagePreviewParams): string {
  const query = new URLSearchParams();

  if (params?.preview) {
    query.set("preview", "true");
  }

  if (params?.previewId) {
    query.set("previewId", params.previewId);
  }

  const serialized = query.toString();

  return serialized ? `?${serialized}` : "";
}

function pagePath(slug?: string): string {
  if (!slug || slug === "/") {
    return "/frontstage/pages";
  }

  return `/frontstage/pages/${slug.replace(/^\/+/, "")}`;
}

export class FrontstageService extends BaseService {
  async site(options?: RequestInit): Promise<FrontstageSiteResponse> {
    return this.client.get<FrontstageSiteResponse>("/frontstage/site", options);
  }

  async page(slug?: string, params?: FrontstagePreviewParams, options?: RequestInit): Promise<FrontstagePageResponse> {
    return this.client.get<FrontstagePageResponse>(`${pagePath(slug)}${frontstageQuery(params)}`, options);
  }

  async routes(options?: RequestInit): Promise<FrontstageRoutesResponse> {
    return this.client.get<FrontstageRoutesResponse>("/frontstage/routes", options);
  }

  async blocks(options?: RequestInit): Promise<FrontstageBlocksResponse> {
    return this.client.get<FrontstageBlocksResponse>("/frontstage/blocks", options);
  }
}
