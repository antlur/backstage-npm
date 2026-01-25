import type { ApiCollectionResponse, ApiSingleResponse, Location } from "../types/index";
import { BaseService } from "./base.js";

export interface CreateLocationParams {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  slug?: string | null;
  description?: string | null;
  status?: string | null;
  featured_media_id?: number | null;
  address2?: string | null;
  phone?: string | null;
  email?: string | null;
  timezone?: string | null;
  map_link?: string | null;
  map_embed?: string | null;
  map_embed_query?: string | null;
  map_embed_zoom?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  hours?: any[];
  special_hours?: any[];
  ordering_links?: any[];
  delivery_links?: any[];
  reservation_links?: any[];
  waitlist_links?: any[];
  loyalty_url?: string | null;
  custom_fields?: Record<string, any> | null;
}

export interface UpdateLocationParams extends Partial<CreateLocationParams> {}

export class LocationService extends BaseService {
  async getLocations(options?: RequestInit): Promise<Location[]> {
    const res = await this.client.get<ApiCollectionResponse<Location>>("/locations", options);
    let locations = res.data;
    locations = locations.sort((a, b) => a.name.localeCompare(b.name));
    return locations;
  }

  async getLocationBySlug(slug: string, options?: RequestInit): Promise<Location | null> {
    const res = await this.client.get<ApiCollectionResponse<Location>>(`/locations?filter[slug]=${slug}`, options);
    const data = res.data;

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  }

  async getLocation(id: string, options?: RequestInit): Promise<Location | null> {
    try {
      const { data } = await this.client.get<ApiSingleResponse<Location>>(`/locations/${id}`, options);
      return data;
    } catch (error) {
      return null;
    }
  }

  async createLocation(params: CreateLocationParams, options?: RequestInit): Promise<Location> {
    const { data } = await this.client.post<ApiSingleResponse<Location>>("/locations", params, options);
    return data;
  }

  async updateLocation(id: string, params: UpdateLocationParams, options?: RequestInit): Promise<Location> {
    const { data } = await this.client.put<ApiSingleResponse<Location>>(`/locations/${id}`, params, options);
    return data;
  }

  async deleteLocation(id: string, options?: RequestInit): Promise<void> {
    await this.client.delete(`/locations/${id}`, options);
  }
}
