import type { ApiCollectionResponse, ApiSingleResponse, Event } from "../types/index";
import { BaseService } from "./base.js";

export interface EventSeoParams {
  title?: string;
  description?: string;
}

export interface CreateEventParams {
  title: string;
  start_time: string;
  end_time?: string | null;
  timezone?: string | null;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  is_featured?: boolean;
  cover_media_id?: number | null;
  ticket_uri?: string | null;
  custom_fields?: Record<string, any> | null;
  seo?: EventSeoParams;
}

export interface UpdateEventParams {
  title: string;
  start_time: string;
  end_time?: string | null;
  timezone?: string | null;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  is_featured?: boolean;
  cover_media_id?: number | null;
  ticket_uri?: string | null;
  custom_fields?: Record<string, any> | null;
  seo?: EventSeoParams;
}

export class EventService extends BaseService {
  async getEvents(options?: RequestInit): Promise<Event[]> {
    const { data } = await this.client.get<ApiCollectionResponse<Event>>("/events", options);
    return data;
  }

  async getEvent(id: string, options?: RequestInit): Promise<Event | null> {
    try {
      const { data } = await this.client.get<ApiSingleResponse<Event>>(`/events/${id}`, options);
      return data;
    } catch (error) {
      return null;
    }
  }

  async getEventBySlug(slug: string, options?: RequestInit): Promise<Event | null> {
    const { data } = await this.client.get<ApiCollectionResponse<Event>>(`/events?filter[slug]=${slug}`, options);
    if (!data || data.length === 0) {
      return null;
    }
    return data[0];
  }

  async createEvent(params: CreateEventParams, options?: RequestInit): Promise<Event> {
    const { data } = await this.client.post<ApiSingleResponse<Event>>("/events", params, options);
    return data;
  }

  async updateEvent(id: string, params: UpdateEventParams, options?: RequestInit): Promise<Event> {
    const { data } = await this.client.put<ApiSingleResponse<Event>>(`/events/${id}`, params, options);
    return data;
  }

  async deleteEvent(id: string, options?: RequestInit): Promise<void> {
    await this.client.delete(`/events/${id}`, options);
  }
}
