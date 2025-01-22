import { Field } from "./types";

export function defineField<T extends Field>(field: T): T {
  return field;
}
