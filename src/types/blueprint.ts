export interface BlueprintField {
  id: string;
  blueprint_id: string;
  name: string;
  slug: string;
  type: string;
  type_id: string | null;
  is_primary: boolean;
  is_multiple: boolean;
  show_in_list: boolean;
  order: number;
  allowed_references: string[] | null;
  options: Array<{ label: string; value: any }> | null;
  placeholder: string | null;
  created_at: string;
  updated_at: string;
}

export interface Blueprint {
  id: string;
  account_id: string;
  name: string;
  slug: string;
  slug_single: string;
  description: string | null;
  is_routable: boolean;
  has_location: boolean;
  has_route_index: boolean;
  fields: BlueprintField[];
  created_at: string;
  updated_at: string;
}
