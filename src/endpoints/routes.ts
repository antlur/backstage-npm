import type { ResolvedRoute } from "../types/index";
import { BaseService } from "./base.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isResolvedRoute = (value: unknown): value is ResolvedRoute =>
  isRecord(value)
  && typeof value.type === "string"
  && "data" in value
  && isRecord(value.meta)
  && (typeof value.meta.id === "string" || typeof value.meta.id === "number" || value.meta.id === null)
  && typeof value.meta.type === "string"
  && typeof value.meta.path === "string";

export class RouteService extends BaseService {
  async resolve<T = ResolvedRoute>(path: string, options?: RequestInit): Promise<T> {
    const query = new URLSearchParams({ path }).toString();
    const response = await this.client.get<unknown>(`/routes/resolve?${query}`, options);

    if (!isResolvedRoute(response)) {
      throw new Error("Backstage returned an invalid route resolution response.");
    }

    return response as T;
  }
}
