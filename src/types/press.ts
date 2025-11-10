import { MediaItem } from "./media-item";

export interface Press {
  id: string;
  slug: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  featured_media?: MediaItem;
  excerpt: string;
  content: string;
  is_featured: boolean;
  locations: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}
