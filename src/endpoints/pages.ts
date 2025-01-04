import { client } from "../client";
import { Page } from "../types/page";
import { ApiCollectionResponse } from "../types/api";

export async function getPage(slug: string): Promise<Page> {
  const res = await client().get<ApiCollectionResponse<Page>>(`/pages/?filter[slug]=${slug}`);
  return res.data[0];
}

export async function getPages() {
  const { data } = await client().get<ApiCollectionResponse<Page>>("/pages");
  return data;
}

export async function getHomePage() {
  const res = await client().get<ApiCollectionResponse<Page>>("/pages?filter[slug]=/");
  return res.data[0];
}

export async function getPageBySlug(slug: string) {
  const res = await client().get<ApiCollectionResponse<Page>>("/pages?filter[slug]=" + slug);
  return res.data[0];
}
