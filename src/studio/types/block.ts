import { Field, FieldType, FieldTypeToValue } from "./field";

type FieldValues<T extends Record<string, Field>> = {
  [K in keyof T]: T[K] extends { type: infer Type } ? (Type extends FieldType ? FieldTypeToValue[Type] : never) : never;
};

export interface BlockSchema<TFields extends Record<string, Field>> {
  fields: TFields;
  properties?: BlockProperties;
}

export interface BlockDefinition<TFields extends Record<string, Field>> {
  name: string;
  slug: string;
  schema: BlockSchema<TFields>;
  component: React.ComponentType<BlockComponentProps<any>>;
}

export interface BlockProperties {
  customClassName?: string;
}

export interface BuilderBlock<TSchema extends BlockSchema<Record<string, Field>>> {
  id: string;
  type: string;
  fields: FieldValues<TSchema["fields"]>;
  properties?: BlockProperties;
}

export interface BlockComponentProps<TSchema extends BlockSchema<Record<string, Field>>> {
  block: BuilderBlock<TSchema>;
  onFieldChange: (blockId: string, fieldName: keyof TSchema["fields"], value: any) => void;
}
