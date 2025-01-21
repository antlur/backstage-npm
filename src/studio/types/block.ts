import { FieldValues } from "../define-block";
import { Field } from "./field";

export interface BlockSchema<TFields extends Record<string, Field<any>>> {
  fields: TFields;
  properties?: BlockProperties;
}

export interface BlockDefinition<TFields extends Record<string, Field<any>>> {
  name: string;
  slug: string;
  schema: BlockSchema<TFields>;
  component: React.ComponentType<BlockComponentProps<FieldValues<TFields>>>;
}

export interface BuilderBlock<TFields extends Record<string, Field<any>>> {
  id: string;
  type: string;
  fields: TFields;
  properties?: BlockProperties;
}

export interface BlockProperties {
  customClassName?: string;
}

export interface BlockComponentProps<TFieldValues extends Record<string, any>> {
  block: BuilderBlock<TFieldValues>;
  onFieldChange: (blockId: string, fieldName: keyof TFieldValues, value: any) => void;
}
