import { MediaItem } from "../../types";

export type FieldTypeToValue = {
  boolean: boolean;
  event_select: string;
  form_select: string;
  image: MediaItem;
  image_list: MediaItem[];
  list_array: string[];
  media: MediaItem;
  menu_select: string;
  number: number;
  press_select: string;
  repeater: any[];
  rich_text: string;
  separator: never;
  spacer: never;
  text: string;
  textarea: string;
  url: string;
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
