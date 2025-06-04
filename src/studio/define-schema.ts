import { BlockSchema, LayoutSchema, Field } from "./types";

export function defineBlockSchema<T extends readonly Field[]>(schema: BlockSchema<T>): BlockSchema<T> {
  return schema;
}

export function defineLayoutSchema<T extends readonly Field[]>(schema: LayoutSchema<T>): LayoutSchema<T> {
  return schema;
}
