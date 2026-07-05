export interface Review {
  id: number;
  account_id: string;
  location_id: string | null;
  external_id: string;
  source: string;
  author_name: string;
  author_avatar: string | null;
  rating: number;
  text: string | null;
  url: string | null;
  responded_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
