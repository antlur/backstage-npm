import { client } from "../client";
import { ApiCollectionResponse, Menu } from "../types";

export async function getMenus(): Promise<Menu[]> {
  const res = await client().get<ApiCollectionResponse<Menu>>("/menus");
  const menus = res.data;
  return menus;
}

export async function getMenu(id: string) {
  const res = await client().get<ApiCollectionResponse<Menu>>(`/menus?filter[id]=${id}&include=categories.items`);
  const data = res.data;

  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }

  return data;
}

export async function getMenuBySlug(slug: string) {
  const res = await client().get<ApiCollectionResponse<Menu>>(`/menus?filter[slug]=${slug}&include=categories.items`);
  const data = res.data;

  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }

  return data;
}
