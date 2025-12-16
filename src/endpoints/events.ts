import type { ApiCollectionResponse, Event } from "../types/index";
import { BaseService } from "./base.js";

export class EventService extends BaseService {
  async getEvents(options?: RequestInit): Promise<Event[]> {
    const { data } = await this.client.get<ApiCollectionResponse<Event>>("/events", options);
    return data;
  }

  async getEvent(id: string, options?: RequestInit): Promise<Event | null> {
    const { data } = await this.client.get<ApiCollectionResponse<Event>>(`/events?filter[id]=${id}`, options);
    if (!data || data.length === 0) {
      return null;
    }
    return data[0];
  }

  async getEventBySlug(slug: string, options?: RequestInit): Promise<Event | null> {
    const { data } = await this.client.get<ApiCollectionResponse<Event>>(`/events?filter[slug]=${slug}`, options);
    if (!data || data.length === 0) {
      return null;
    }
    return data[0];
  }
}
