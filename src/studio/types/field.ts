export type FieldType =
  | "boolean"
  | "event_select"
  | "form_select"
  | "image"
  | "image_list"
  | "list_array"
  | "media"
  | "menu_select"
  | "number"
  | "press_select"
  | "repeater"
  | "rich_text"
  | "separator"
  | "spacer"
  | "text"
  | "textarea"
  | "url";

export interface Field<TValue = any> {
  name: string;
  slug: string;
  type: FieldType;
  value?: TValue;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
}
