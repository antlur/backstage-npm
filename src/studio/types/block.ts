import { Field, FieldType, FieldTypeToValue } from "./field";

// Type for field values from array-based fields
type FieldValues<T extends readonly Field[]> = {
  [K in T[number]["slug"]]: Extract<T[number], { slug: K }> extends { type: infer Type }
    ? Type extends FieldType
      ? FieldTypeToValue[Type]
      : never
    : never;
};

export interface BlockSchema<TFields extends readonly Field[]> {
  fields: TFields;
  properties?: BlockProperties;
}

export interface BlockDefinition<TFields extends readonly Field[]> {
  name: string;
  slug: string;
  description?: string;
  schema: BlockSchema<TFields>;
  component: BlockComponent<BlockSchema<TFields>>;
}

export interface BlockProperties {
  customClassName?: string;
}

export interface BuilderBlock<TSchema extends BlockSchema<readonly Field[]>> {
  id: string;
  type: string;
  fields: FieldValues<TSchema["fields"]>;
  properties?: BlockProperties;
}

export interface BlockComponentProps<TSchema extends BlockSchema<readonly Field[]>> {
  block: BuilderBlock<TSchema>;
  onFieldChange: (blockId: string, fieldName: TSchema["fields"][number]["slug"], value: any) => void;
}

export type BlockComponent<TSchema extends BlockSchema<readonly Field[]>> = React.ComponentType<
  BlockComponentProps<TSchema>
>;
