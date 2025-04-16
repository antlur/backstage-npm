import { ApiSingleResponse } from "../types/index.js";
import { BaseService } from "./base.js";

interface LayoutParams {
  name: string;
  slug: string;
  schema: any;
}

export class LayoutService extends BaseService {
  async all() {}

  async create({ name, slug, schema }: LayoutParams) {
    const res = await this.client.post<ApiSingleResponse<LayoutParams>>("/layouts", { name, slug, schema });
    return res.data;
  }

  async update(id: string, { name, slug, schema }: LayoutParams) {
    const res = await this.client.put<ApiSingleResponse<LayoutParams>>(`/layouts/${id}`, { name, slug, schema });
    return res.data;
  }
}
