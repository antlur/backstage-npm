import { MediaItem } from "./media-item";

export interface Alert {
  id: string;
  title: string;
  type: string;
  is_global: boolean;
  published: boolean;
  pages: {
    id: string;
    slug: string;
    path: string;
  }[];
  start_at: string;
  end_at: string;
  media: MediaItem;
  content: string | null;
  cta_label: string | null;
  cta_url: string | null;
}
