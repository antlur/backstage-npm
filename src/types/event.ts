import { MediaItem } from "./media-item";

export interface Event {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  is_featured: boolean;
  start_time: string;
  end_time: string | null;
  timezone: string | null;
  cover_media_id: number | null;
  cover_media: MediaItem | null;
  account_id: string;
  ticket_uri: string | null;
}
