import type { Field } from "../studio/types/field.js";
import { validateManifestFields } from "../manifest/fields.js";

export interface LayoutManifestSchema {
  fields: Field[];
  [key: string]: unknown;
}

export interface InlineLayoutDefinition {
  name: string;
  slug: string;
  schema: LayoutManifestSchema;
  [key: string]: unknown;
}

export interface LayoutManifest extends InlineLayoutDefinition {
  manifest_version: 1;
  type: "layout";
}

export type LayoutConfigDefinition = InlineLayoutDefinition | LayoutManifest;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${path} must be a non-empty string`);
  }

  return value;
}

function validateSchema(value: unknown, strict: boolean): LayoutManifestSchema {
  if (!isRecord(value)) {
    throw new Error("schema must be an object");
  }

  validateManifestFields(value.fields);

  if (strict) {
    const unknownKey = Object.keys(value).find((key) => key !== "fields");
    if (unknownKey) throw new Error(`Unknown layout schema field "${unknownKey}"`);
  }

  return value as unknown as LayoutManifestSchema;
}

function validateBaseDefinition(value: unknown, strict: boolean): InlineLayoutDefinition {
  if (!isRecord(value)) {
    throw new Error("Layout definition must be an object");
  }

  const name = requiredString(value.name, "name");
  const slug = requiredString(value.slug, "slug");
  const schema = validateSchema(value.schema, strict);

  if (strict) {
    const supportedKeys = new Set(["manifest_version", "type", "name", "slug", "schema"]);
    const unknownKey = Object.keys(value).find((key) => !supportedKeys.has(key));
    if (unknownKey) throw new Error(`Unknown layout manifest field "${unknownKey}"`);
  }

  return { name, slug, schema };
}

export function parseLayoutManifest(value: unknown): LayoutManifest {
  if (!isRecord(value)) {
    throw new Error("Layout manifest must be a JSON object");
  }

  if (value.manifest_version !== 1) {
    throw new Error(`Unsupported manifest_version "${String(value.manifest_version)}". This SDK supports version 1.`);
  }

  if (value.type !== "layout") {
    throw new Error('Manifest type must be "layout"');
  }

  return {
    manifest_version: 1,
    type: "layout",
    ...validateBaseDefinition(value, true),
  };
}

export function validateLayoutDefinition(value: unknown): InlineLayoutDefinition {
  if (!isRecord(value)) {
    throw new Error("Layout definition must be an object");
  }

  if ("manifest_version" in value || value.type === "layout") {
    return parseLayoutManifest(value);
  }

  return validateBaseDefinition(value, false);
}

export function validateLayoutDefinitions(value: unknown): InlineLayoutDefinition[] {
  if (!Array.isArray(value)) {
    throw new Error("layouts must be an array");
  }

  const layouts = value.map(validateLayoutDefinition);
  const seenSlugs = new Set<string>();

  for (const layout of layouts) {
    if (seenSlugs.has(layout.slug)) {
      throw new Error(`Multiple local layouts use slug "${layout.slug}".`);
    }
    seenSlugs.add(layout.slug);
  }

  return layouts;
}
