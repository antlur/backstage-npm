export interface MenuItem {
  id: string;
  account_id: string;
  title: string;
  post_title: string | null;
  subtitle: string | null;
  description: string | null;
  price: number | null;
  price2: number | null;
  image_id: string | null;
  type: string | null;
  overrides: string | null;
  created_at: string;
  updated_at: string;
}
