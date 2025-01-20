import { Field } from "./types";

export function defineField<TValue>(field: Field<TValue>): Field<TValue> {
  return field;
}
