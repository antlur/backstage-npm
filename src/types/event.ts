import { MediaItem } from "./media-item";

export interface Event {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  is_featured: boolean;
  start_time: string;
  end_time: string;
  timezone: string;
  cover_media_id: number;
  cover_media: MediaItem;
  account_id: number;
  ticket_uri: string | null;
}
