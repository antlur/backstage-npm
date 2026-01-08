import { Field, FieldType, FieldTypeToValue } from "./field";
import { Entry } from "../../types/entry";

type Nullable<T> = T | null;

// Type for field values from array-based fields
type FieldValues<T extends readonly Field[]> = {
  [K in T[number]["slug"]]: Extract<T[number], { slug: K }> extends infer FieldDef
    ? FieldDef extends { type: 'reference'; is_multiple: true }
      ? Nullable<Entry[]>
      : FieldDef extends { type: 'reference' }
        ? Nullable<Entry>
        : FieldDef extends { type: infer Type }
          ? Type extends FieldType
            ? FieldTypeToValue[Type]
            : never
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
