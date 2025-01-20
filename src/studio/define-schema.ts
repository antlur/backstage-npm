import { BlockSchema, Field } from "./types";

export function defineSchema<TFields extends Record<string, Field<any>>>(schema: BlockSchema<TFields>) {
  return schema;
}
