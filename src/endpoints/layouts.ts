import type { ApiSingleResponse } from "../types/index";
import { BaseService } from "./base.js";

interface LayoutParams {
  name: string;
  slug: string;
  schema: any;
}

export class LayoutService extends BaseService {
  async all(options?: RequestInit) {}

  async create({ name, slug, schema }: LayoutParams, options?: RequestInit) {
    const res = await this.client.post<ApiSingleResponse<LayoutParams>>("/layouts", { name, slug, schema }, options);
    return res.data;
  }

  async update(id: string, { name, slug, schema }: LayoutParams, options?: RequestInit) {
    const res = await this.client.put<ApiSingleResponse<LayoutParams>>(
      `/layouts/${id}`,
      { name, slug, schema },
      options
    );
    return res.data;
  }
}
