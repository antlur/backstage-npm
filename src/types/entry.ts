import { Location } from "./location";

export interface EntryField {
  id: string;
  name: string;
  slug: string;
  type: string;
  options: any;
  order: number;
}

export interface EntryValue {
  id: string;
  entry_id: string;
  field_id: string;
  value: any;
}

export interface Entry {
  id: string;
  account_id: string;
  blueprint_id: string;
  status: string;
  slug: string;
  location: Location | null;
  fields: EntryField[];
  data: Record<string, any>;
  unstable_data: Record<string, any>;
  seo: {
    title?: string;
    description?: string;
  } | null;
  primary_field_name: string | null;
  primary_field_accessor: string | null;
  primary_field_value: any;
  created_at: string;
  updated_at: string;
}
