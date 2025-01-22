import { BlockSchema, Field } from "./types";

export type SchemaFields = Record<string, Field>;

export function defineSchema<T extends SchemaFields>(schema: BlockSchema<T>) {
  return schema;
}
