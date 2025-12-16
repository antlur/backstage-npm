import type { Route } from "../types/index";
import { BaseService } from "./base.js";

export class RouteService extends BaseService {
  async resolve<T = Route>(path: string, options?: RequestInit): Promise<T> {
    const query = new URLSearchParams({ path }).toString();
    return this.client.get<T>(`/routes/resolve?${query}`, options);
  }
}
