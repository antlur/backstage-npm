import { client } from "../client";
import { ApiCollectionResponse, Location } from "../types";

export async function getLocations(): Promise<Location[]> {
  const res = await client().get<ApiCollectionResponse<Location>>("/locations");
  let locations = res.data;
  locations = locations.sort((a: any, b: any) => {
    if (a.name < b.name) {
      return -1;
    }
    return 1;
  });
  return locations;
}

export async function getLocationBySlug(slug: string) {
  const res = await client().get<ApiCollectionResponse<Location>>(`/locations?filter[slug]=${slug}`);
  const data = res.data;

  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }

  return data;
}
