import { MediaItem } from "./media-item";

export interface MenuItem {
  id: string;
  account_id: string;
  title: string;
  nickname: string | null;
  post_title: string | null;
  subtitle: string | null;
  description: string | null;
  price: string | null;
  price2: string | null;
  prices: Array<{ label?: string; price?: string | number }> | null;
  has_multiple_prices: boolean;
  has_hidden_price: boolean;
  price_type: string | null;
  image_id: number | null;
  dietary_tags: string[] | null;
  image?: MediaItem | null;
  created_at: string;
  updated_at: string;
}
