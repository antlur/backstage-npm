import { MediaItem } from "../../types";

type Nullable<T> = T | null;

export type FieldTypeToValue = {
  boolean: Nullable<boolean>;
  event_select: Nullable<string>;
  form_select: Nullable<string>;
  image: Nullable<MediaItem>;
  image_list: Nullable<MediaItem[]>;
  list_array: Nullable<string[]>;
  media: Nullable<MediaItem>;
  menu_select: Nullable<string>;
  number: Nullable<number>;
  press_select: Nullable<string>;
  repeater: Nullable<any[]>;
  rich_text: Nullable<string>;
  separator: never;
  spacer: never;
  text: Nullable<string>;
  textarea: Nullable<string>;
  url: Nullable<string>;
  navigation_select: Nullable<string>;
};
export type FieldType = keyof FieldTypeToValue;

export type BaseField = {
  name: string;
  slug: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
};

export type Field = {
  [K in FieldType]: BaseField & {
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
