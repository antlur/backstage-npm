import { Field, FieldType, FieldTypeToValue } from "./field";

// Type for field values from array-based fields
type FieldValues<T extends readonly Field[]> = {
  [K in T[number]["slug"]]: Extract<T[number], { slug: K }> extends { type: infer Type }
    ? Type extends FieldType
      ? FieldTypeToValue[Type]
      : never
    : never;
};

export interface LayoutSchema<TFields extends readonly Field[]> {
  fields: TFields;
}

export interface LayoutDefinition<TFields extends readonly Field[]> {
  name: string;
  slug: string;
  schema: LayoutSchema<TFields>;
  component: React.ComponentType<LayoutComponentProps<LayoutSchema<TFields>>>;
}

export interface LayoutComponentProps<TSchema extends LayoutSchema<readonly Field[]>> {
  fields: FieldValues<TSchema["fields"]>;
  children?: React.ReactNode;
  onFieldChange: (layoutId: string, fieldName: TSchema["fields"][number]["slug"], value: any) => void;
}
