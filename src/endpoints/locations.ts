import { ApiCollectionResponse, Location } from "../types/index.js";
import { BaseService } from "./base.js";

export class LocationService extends BaseService {
  async getLocations(): Promise<Location[]> {
    const res = await this.client.get<ApiCollectionResponse<Location>>("/locations");
    let locations = res.data;
    locations = locations.sort((a: any, b: any) => {
      if (a.name < b.name) {
        return -1;
      }
      return 1;
    });
    return locations;
  }

  async getLocationBySlug(slug: string) {
    const res = await this.client.get<ApiCollectionResponse<Location>>(`/locations?filter[slug]=${slug}`);
    const data = res.data;

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    return data;
  }
}
