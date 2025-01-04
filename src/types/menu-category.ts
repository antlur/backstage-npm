import { MenuCategoryItem } from "./menu-category-item";

export interface MenuCategory {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  after_description: string | null;
  column_count: number | null;
  menu_id: string;
  order: number;
  created_at: string;
  updated_at: string;
  items: MenuCategoryItem[];
}
