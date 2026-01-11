import { MediaItem } from "../../types";
import { Entry } from "../../types/entry";

type Nullable<T> = T | null;

export type FieldTypeToValue = {
  boolean: Nullable<boolean>;
  date: Nullable<string>;
  datetime: Nullable<string>;
  email: Nullable<string>;
  event_select: Nullable<string>;
  fieldset: never;
  form_select: Nullable<string>;
  image: Nullable<MediaItem>;
  image_list: Nullable<MediaItem[]>;
  json: Nullable<any>;
  list_array: Nullable<string[]>;
  location: Nullable<string>;
  markdown: Nullable<string>;
  media: Nullable<MediaItem>;
  menu_select: Nullable<string>;
  number: Nullable<number>;
  press_select: Nullable<string>;
  reference: Nullable<Entry | Entry[]>;
  repeater: Nullable<any[]>;
  rich_text: Nullable<string>;
  select: Nullable<string>;
  separator: never;
  slug: Nullable<string>;
  spacer: never;
  text: Nullable<string>;
  textarea: Nullable<string>;
  time: Nullable<string>;
  url: Nullable<string>;
  navigation_select: Nullable<string>;
  page_select: Nullable<string>;
};
export type FieldType = keyof FieldTypeToValue;

export type BaseField = {
  name: string;
  slug: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
  allowed_references?: string[];
  is_multiple?: boolean;
  is_primary?: boolean;
  show_in_list?: boolean;
  order?: number;
  type_id?: string | null;
  fields?: Field[];
};

export type Field = {
  [K in FieldType]: K extends 'reference'
    ? BaseField & {
        type: K;
        value?: FieldTypeToValue[K];
        is_multiple?: boolean;
      }
    : BaseField & {
        type: K;
        value?: FieldTypeToValue[K];
      };
}[FieldType];

// export interface Field<T extends FieldType = FieldType> {
//   name: string;
//   slug: string;
//   type: FieldType;
//   value?: FieldTypeToValue[T];
//   placeholder?: string;
//   required?: boolean;
//   options?: Array<{ label: string; value: any }>;
// }
