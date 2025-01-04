import { MediaItem } from "./media-item";

export interface Event {
  id: number;
  title: string;
  short_description: string;
  description: string;
  start_time: string; // or Date if the date is being converted before being used in TypeScript
  end_time: string; // or Date if the date is being converted before being used in TypeScript
  timezone: string;
  cover_media_id: number;
  cover_media: MediaItem; // Replace 'any' with the actual type of the cover_media
  account_id: number;
}
