export interface Location {
  id: string;
  account_id: string;
  google_my_business_id: string | null;
  name: string;
  slug: string | null;
  description: string | null;
  featured_media_id: number;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  map_link: string | null;
  map_embed: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  email: string;
  timezone: string | null;
  hours: {
    day: string;
    openTime: string;
    closeTime: string;
    open24Hours: boolean;
    closed24Hours: boolean;
    notes: string;
  }[];
  special_hours: {
    id: string;
    date: string;
    openTime: string;
    closeTime: string;
    open24Hours: boolean;
    closed24Hours: boolean;
    notes: string;
  }[];
  ordering_links: {
    service: string;
    url: string;
  }[];
  delivery_links: {
    service: string;
    url: string;
  }[];
  reservation_links: {
    service: string;
    url: string;
  }[];
  waitlist_links: {
    service: string;
    url: string;
  }[];
  loyalty_url: string | null;
  created_at: string;
  updated_at: string;
  featured_media: {
    id: number;
    file_name: string;
    url: string;
    transform_url: string;
    path: string;
    width: number;
    height: number;
    alt: string;
  };
  status: string;
  status_text: string;
}
