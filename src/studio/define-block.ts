import { BlockSchema, BlockDefinition, BlockComponentProps, Field } from "./types";

export type FieldValues<TFields extends Record<string, Field<any>>> = {
  [K in keyof TFields]: TFields[K]["value"];
};

export function defineBlock<TFields extends Record<string, Field<any>>>(options: {
  name: string;
  slug: string;
  schema: BlockSchema<TFields>;
  component: React.ComponentType<BlockComponentProps<FieldValues<TFields>>>; // Correct typing here
}): BlockDefinition<TFields> {
  return options;
}
