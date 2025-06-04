import type { Field } from "./types";

/**
 * Helper type to extract field slugs from an array of fields for autocompletion
 */
export type ExtractFieldSlugs<T extends readonly Field[]> = T[number]["slug"];

/**
 * Helper type to convert array of fields to a record for easier access
 */
export type FieldArrayToRecord<T extends readonly Field[]> = {
  [K in T[number]["slug"]]: Extract<T[number], { slug: K }>;
};

/**
 * Helper function to create a typed field accessor with autocompletion
 */
export function createFieldAccessor<T extends readonly Field[]>(fields: T) {
  return {
    fields,
    slugs: fields.map((f) => f.slug) as ExtractFieldSlugs<T>[],
    getField: <S extends ExtractFieldSlugs<T>>(slug: S): Extract<T[number], { slug: S }> => {
      const field = fields.find((f) => f.slug === slug);
      if (!field) {
        throw new Error(`Field with slug "${slug}" not found`);
      }
      return field as Extract<T[number], { slug: S }>;
    },
  };
}
