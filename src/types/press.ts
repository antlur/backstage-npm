import { MediaItem } from "./media-item";

export interface Press {
  id: string;
  slug: string;
  title: string;
  source: string;
  url: string | null;
  published_at: string;
  featured_media?: MediaItem;
  excerpt: string | null;
  content: string | null;
  is_featured: boolean;
  locations: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}
