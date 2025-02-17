import { ApiCollectionResponse, Event } from "../types";
import { BaseService } from "./base.js";

export class EventService extends BaseService {
  async getEvents(): Promise<Event[]> {
    const { data } = await this.client.get<ApiCollectionResponse<Event>>("/events");
    return data;
  }

  async getEvent(id: string): Promise<Event> {
    const { data } = await this.client.get<ApiCollectionResponse<Event>>("/events" + "?filter[id]=" + id);
    return data?.[0];
  }

  async getEventBySlug(slug: string): Promise<Event> {
    const { data } = await this.client.get<ApiCollectionResponse<Event>>("/events" + "?filter[slug]=" + slug);
    return data?.[0];
  }
}
