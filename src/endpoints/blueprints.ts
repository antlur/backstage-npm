import type { ApiCollectionResponse, ApiSingleResponse } from "../types/index";
import type { Blueprint } from "../types/blueprint";
import { BaseService } from "./base.js";

export interface CreateBlueprintParams {
  name: string;
  slug: string;
  slug_single?: string;
  description?: string;
  is_routable?: boolean;
  has_location?: boolean;
  has_route_index?: boolean;
  fields: Array<{
    name: string;
    slug: string;
    type: string;
    type_id?: string | null;
    is_primary?: boolean;
    is_multiple?: boolean;
    show_in_list?: boolean;
    order: number;
    allowed_references?: string[];
    options?: Array<{ label: string; value: any }>;
    placeholder?: string;
  }>;
}

export interface UpdateBlueprintParams extends Partial<CreateBlueprintParams> {}

export class BlueprintsService extends BaseService {
  async list(options?: RequestInit): Promise<Blueprint[]> {
    const { data } = await this.client.get<ApiCollectionResponse<Blueprint>>("/blueprints", options);
    return data;
  }

  async get(id: string, options?: RequestInit): Promise<Blueprint | null> {
    try {
      const { data } = await this.client.get<ApiSingleResponse<Blueprint>>(`/blueprints/${id}`, options);
      return data;
    } catch (error) {
      return null;
    }
  }

  async create(params: CreateBlueprintParams, options?: RequestInit): Promise<Blueprint> {
    const { data } = await this.client.post<ApiSingleResponse<Blueprint>>("/blueprints", params, options);
    return data;
  }

  async update(id: string, params: UpdateBlueprintParams, options?: RequestInit): Promise<Blueprint> {
    const { data } = await this.client.put<ApiSingleResponse<Blueprint>>(`/blueprints/${id}`, params, options);
    return data;
  }

  async delete(id: string, options?: RequestInit): Promise<void> {
    await this.client.delete(`/blueprints/${id}`, options);
  }
}