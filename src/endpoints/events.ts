import { client } from "../client";
import { ApiCollectionResponse, Event } from "../types";

export async function getEvents(): Promise<Event[]> {
  const res = await client().get<ApiCollectionResponse<Event>>("/events");
  const pages = res.data;
  return pages;
}

export async function getEvent(id: string): Promise<Event> {
  const res = await client().get<ApiCollectionResponse<Event>>("/events" + "?filter[id]=" + id);
  const pages = res.data?.[0];
  return pages;
}

export async function getEventBySlug(slug: string): Promise<Event> {
  const res = await client().get<ApiCollectionResponse<Event>>("/events" + "?filter[slug]=" + slug);
  const pages = res.data?.[0];
  return pages;
}
