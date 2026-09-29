import type { Field } from "../studio/types/field.js";

export type BlockIdentity = `${string}:${string}@${number}`;

export interface BlockManifest {
  manifest_version: 1;
  type: "block";
  registry_identity: BlockIdentity;
  name: string;
  slug: string;
  description?: string;
  schema: { fields: Field[] };
  derived_from?: BlockIdentity | null;
}

const BLOCK_IDENTITY_PATTERN = /^([a-z][a-z0-9-]*):([a-z][a-z0-9-]*)@([1-9][0-9]*)$/;
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

export interface BlockIdentityParts {
  namespace: string;
  key: string;
  version: number;
}

export function parseBlockIdentity(value: unknown): BlockIdentityParts {
  if (typeof value !== "string" || value.length > 255) {
    throw new Error("registry_identity must be a valid namespace:key@version string");
  }

  const match = BLOCK_IDENTITY_PATTERN.exec(value);

  if (!match) {
    throw new Error(`Invalid block identity "${value}". Expected namespace:key@version, such as backstage:hero@1.`);
  }

  return { namespace: match[1], key: match[2], version: Number(match[3]) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${path} must be a non-empty string`);
  }

  return value;
}

function validateFields(value: unknown, path: string): asserts value is Field[] {
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
      validateFields(field.fields, `${fieldPath}.fields`);
    }

    if (field.required !== undefined && typeof field.required !== "boolean") {
      throw new Error(`${fieldPath}.required must be a boolean`);
    }
  });
}

export function parseBlockManifest(value: unknown): BlockManifest {
  if (!isRecord(value)) {
    throw new Error("Block manifest must be a JSON object");
  }

  if (value.manifest_version !== 1) {
    throw new Error(`Unsupported manifest_version "${String(value.manifest_version)}". This SDK supports version 1.`);
  }

  if (value.type !== "block") {
    throw new Error('Manifest type must be "block"');
  }

  const identity = requiredString(value.registry_identity, "registry_identity");
  parseBlockIdentity(identity);

  const name = requiredString(value.name, "name");
  const slug = requiredString(value.slug, "slug");

  if (!isRecord(value.schema)) {
    throw new Error("schema must be an object");
  }

  validateFields(value.schema.fields, "schema.fields");

  if (value.description !== undefined && typeof value.description !== "string") {
    throw new Error("description must be a string when provided");
  }

  if (value.derived_from !== undefined && value.derived_from !== null) {
    parseBlockIdentity(value.derived_from);

    if (value.derived_from === identity) {
      throw new Error("derived_from cannot match registry_identity");
    }
  }

  for (const rendererKey of ["component", "renderer", "framework", "styles", "css", "tailwind", "frontstage"]) {
    if (rendererKey in value) {
      throw new Error(`Manifest field "${rendererKey}" is renderer-specific and is not part of the portable block contract`);
    }
  }

  const supportedManifestKeys = new Set([
    "manifest_version",
    "type",
    "registry_identity",
    "name",
    "slug",
    "description",
    "schema",
    "derived_from",
  ]);
  const unknownManifestKey = Object.keys(value).find((key) => !supportedManifestKeys.has(key));

  if (unknownManifestKey) {
    throw new Error(`Unknown block manifest field "${unknownManifestKey}"`);
  }

  const unknownSchemaKey = Object.keys(value.schema).find((key) => key !== "fields");

  if (unknownSchemaKey) {
    throw new Error(`Unknown block schema field "${unknownSchemaKey}"`);
  }

  return value as unknown as BlockManifest;
}
