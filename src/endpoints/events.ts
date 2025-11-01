import type { ApiCollectionResponse, Event } from "../types/index";
import { BaseService } from "./base.js";

export class EventService extends BaseService {
  async getEvents(): Promise<Event[]> {
    const { data } = await this.client.get<ApiCollectionResponse<Event>>("/events");
    return data;
  }

  async getEvent(id: string): Promise<Event | null> {
    const { data } = await this.client.get<ApiCollectionResponse<Event>>(`/events?filter[id]=${id}`);
    if (!data || data.length === 0) {
      return null;
    }
    return data[0];
  }

  async getEventBySlug(slug: string): Promise<Event | null> {
    const { data } = await this.client.get<ApiCollectionResponse<Event>>(`/events?filter[slug]=${slug}`);
    if (!data || data.length === 0) {
      return null;
    }
    return data[0];
  }
}
