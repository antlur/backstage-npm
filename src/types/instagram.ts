export interface InstagramPost {
  id: number;
  account_id: string;
  location_id: string | null;
  instagram_id: string;
  username: string;
  caption: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string; // ISO date string
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
}
