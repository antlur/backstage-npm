import type { Field } from "../studio/types/field.js";

const FIELD_SLUG_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

const FIELD_TYPES = new Set([
  "boolean",
  "date",
  "datetime",
  "email",
  "event_select",
  "fieldset",
  "form_select",
  "image",
  "image_list",
  "json",
  "list_array",
  "location",
  "markdown",
  "media",
  "menu_select",
  "number",
  "press_select",
  "reference",
  "repeater",
  "rich_text",
  "select",
  "separator",
  "slug",
  "spacer",
  "text",
  "textarea",
  "time",
  "url",
  "navigation_select",
  "page_select",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${path} must be a non-empty string`);
  }

  return value;
}

export function validateManifestFields(value: unknown, path = "schema.fields"): asserts value is Field[] {
  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array`);
  }

  const seenSlugs = new Set<string>();

  value.forEach((field, index) => {
    const fieldPath = `${path}.${index}`;

    if (!isRecord(field)) {
      throw new Error(`${fieldPath} must be an object`);
    }

    requiredString(field.name, `${fieldPath}.name`);
    const slug = requiredString(field.slug, `${fieldPath}.slug`);

    if (!FIELD_SLUG_PATTERN.test(slug)) {
      throw new Error(`${fieldPath}.slug must contain only letters, numbers, underscores, or hyphens and start with a letter`);
    }

    if (seenSlugs.has(slug)) {
      throw new Error(`${fieldPath}.slug duplicates "${slug}" in ${path}`);
    }
    seenSlugs.add(slug);

    if (typeof field.type !== "string" || !FIELD_TYPES.has(field.type)) {
      throw new Error(`${fieldPath}.type is not a supported Backstage field type`);
    }

    if (field.fields !== undefined) {
      validateManifestFields(field.fields, `${fieldPath}.fields`);
    }

    if (field.required !== undefined && typeof field.required !== "boolean") {
      throw new Error(`${fieldPath}.required must be a boolean`);
    }
  });
}
