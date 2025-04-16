import { ApiSingleResponse } from "../types/index.js";
import { BaseService } from "./base.js";

interface BlockParams {
  name: string;
  slug: string;
  schema: any;
}

export class BlocksService extends BaseService {
  async all() {}

  async create({ name, slug, schema }: BlockParams) {
    const res = await this.client.post<ApiSingleResponse<BlockParams>>("/blocks", { name, slug, schema });
    return res.data;
  }

  async update(id: string, { name, slug, schema }: BlockParams) {
    const res = await this.client.put<ApiSingleResponse<BlockParams>>(`/blocks/${id}`, { name, slug, schema });
    return res.data;
  }
}
