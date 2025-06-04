import { Field, FieldType, BaseField } from "./types";

// More precise typing for defineField
export function defineField<
  TSlug extends string,
  TType extends FieldType,
  TField extends BaseField & { slug: TSlug; type: TType }
>(field: TField): TField {
  return field;
}
