export interface Blueprint {
  id: string;
  account_id: string;
  name: string;
  slug: string;
  description: string | null;
  schema: any;
  created_at: string;
  updated_at: string;
}
