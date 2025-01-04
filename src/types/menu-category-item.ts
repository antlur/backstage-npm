import { MenuItem } from "./menu-item";

export interface MenuCategoryItem {
  id: string;
  menu_category_id: string;
  menu_item_id: string;
  title: string;
  post_title: string | null;
  subtitle: string | null;
  description: string | null;
  price: number | null;
  order: number;
  price2: number | null;
  image_id: string | null;
  created_at: string;
  updated_at: string;
  menu_item: MenuItem;
}
