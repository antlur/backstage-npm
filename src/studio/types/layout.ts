import { Field, FieldType, FieldTypeToValue } from "./field";

type FieldValues<T extends Record<string, Field>> = {
  [K in keyof T]: T[K] extends { type: infer Type } ? (Type extends FieldType ? FieldTypeToValue[Type] : never) : never;
};

export interface LayoutSchema<TFields extends Record<string, Field>> {
  fields: TFields;
}

export interface LayoutDefinition<TFields extends Record<string, Field>> {
  name: string;
  slug: string;
  schema: LayoutSchema<TFields>;
  component: React.ComponentType<LayoutComponentProps<any>>;
}

export interface LayoutComponentProps<TSchema extends LayoutSchema<Record<string, Field>>> {
  fields: FieldValues<TSchema["fields"]>;
  children?: React.ReactNode;
  onFieldChange: (layoutId: string, fieldName: keyof TSchema["fields"], value: any) => void;
}
