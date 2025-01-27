import { BlockSchema, LayoutSchema, Field } from "./types";

export type SchemaFields = Record<string, Field>;

export function defineBlockSchema<T extends SchemaFields>(schema: BlockSchema<T>) {
  return schema;
}

export function defineLayoutSchema<T extends SchemaFields>(schema: LayoutSchema<T>) {
  return schema;
}
