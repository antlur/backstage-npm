import type { ApiCollectionResponse, Location } from "../types/index";
import { BaseService } from "./base.js";

export class LocationService extends BaseService {
  async getLocations(): Promise<Location[]> {
    const res = await this.client.get<ApiCollectionResponse<Location>>("/locations");
    let locations = res.data;
    locations = locations.sort((a, b) => a.name.localeCompare(b.name));
    return locations;
  }

  async getLocationBySlug(slug: string): Promise<Location | null> {
    const res = await this.client.get<ApiCollectionResponse<Location>>(`/locations?filter[slug]=${slug}`);
    const data = res.data;

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  }
}
