import { MenuCategory } from "./menu-category";

export interface Menu {
  id: string;
  slug: string;
  is_default: boolean;
  title: string;
  subtitle: string | null;
  account_id: string;
  pdf_url: string | null;
  categories: MenuCategory[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Pivot fields when attached to a location
  order?: number;
}
