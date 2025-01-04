export interface Menu {
  id: string;
  slug: string;
  is_default: boolean;
  title: string;
  subtitle: string | null;
  account_id: string;
  pdf_url: string | null;
  categories: string[]; // You can replace this with the actual type for categories if needed
  created_at: string;
  updated_at: string;
}
