import type { AccountLayout } from "../../types/account-layout.js";
import type { Field } from "../../studio/types/field.js";
import type { BackstageUserConfig } from "../../config.js";
import { BackstageClient } from "../../client.js";
import { validateLayoutDefinitions, type InlineLayoutDefinition } from "../../layouts/manifest.js";

type LayoutSyncClient = Pick<BackstageClient, "layouts">;

export interface LayoutSyncOptions {
  dryRun?: boolean;
}

export interface LayoutSyncResult {
  created: number;
  updated: number;
  unchanged: number;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const response = (error as { response?: { status?: unknown } }).response;
  return typeof response?.status === "number" ? response.status : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertAccountFields(value: unknown, path: string): asserts value is Field[] {
  if (!Array.isArray(value)) {
    throw new Error(`${path} is missing or invalid; refusing to overwrite the account layout schema.`);
  }

  const seenSlugs = new Set<string>();

  value.forEach((field, index) => {
    const fieldPath = `${path}.${index}`;
    if (!isRecord(field) || typeof field.slug !== "string" || field.slug.trim() === "") {
      throw new Error(`${fieldPath} is invalid; refusing to overwrite the account layout schema.`);
    }
    if (seenSlugs.has(field.slug)) {
      throw new Error(`${fieldPath} duplicates "${field.slug}"; refusing to overwrite the account layout schema.`);
    }
    seenSlugs.add(field.slug);
    if (field.fields !== undefined) assertAccountFields(field.fields, `${fieldPath}.fields`);
  });
}

function accountSchema(existing: AccountLayout): Record<string, unknown> {
  const schema = (existing as { schema?: unknown }).schema;
  if (!isRecord(schema)) {
    throw new Error(`Backstage layout ${existing.slug} has an invalid schema; refusing to overwrite it.`);
  }
  assertAccountFields(schema.fields, `Backstage layout ${existing.slug} schema.fields`);
  return schema;
}

function accountOnlyFields(localFields: readonly Field[], accountFields: readonly Field[], parent = ""): string[] {
  const localBySlug = new Map(localFields.map((field) => [field.slug, field]));

  return accountFields.flatMap((accountField) => {
    const path = parent ? `${parent}.${accountField.slug}` : accountField.slug;
    const localField = localBySlug.get(accountField.slug);
    if (!localField) return [path];
    return accountOnlyFields(localField.fields ?? [], accountField.fields ?? [], path);
  });
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    const members = Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`);
    return `{${members.join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function normalizedFields(fields: readonly Field[]): Array<Record<string, unknown>> {
  return fields.map((field) => {
    const { type_id: _typeId, fields: nestedFields, ...portable } = field as Field & { type_id?: string | null };
    return {
      ...portable,
      description: field.description ?? null,
      placeholder: field.placeholder ?? null,
      required: Boolean(field.required),
      options: field.options ?? [],
      allowed_references: field.allowed_references ?? [],
      is_multiple: Boolean(field.is_multiple),
      is_primary: Boolean(field.is_primary),
      show_in_list: Boolean(field.show_in_list),
      order: field.order ?? null,
      value: field.value ?? null,
      fields: normalizedFields(nestedFields ?? []),
    };
  });
}

function comparableFields(
  accountFields: readonly Field[],
  localFields: readonly Field[],
  slug: string,
  warnings: Set<string>,
  parent = "",
): { account: Array<Record<string, unknown>>; local: Array<Record<string, unknown>> } {
  const account = normalizedFields(accountFields);
  const local = normalizedFields(localFields);
  const accountIndexes = new Map(accountFields.map((field, index) => [field.slug, index]));

  for (const [index, localField] of localFields.entries()) {
    const accountIndex = accountIndexes.get(localField.slug);
    if (accountIndex === undefined) continue;

    const accountField = accountFields[accountIndex];
    const path = parent ? `${parent}.${localField.slug}` : localField.slug;

    if (localField.required === true && !Object.hasOwn(accountField, "required")) {
      delete account[accountIndex].required;
      delete local[index].required;
      warnings.add(`Backstage did not return required metadata for layout ${slug}.${path}; the account editor may not enforce this field as required.`);
    }

    const nested = comparableFields(
      accountField.fields ?? [],
      localField.fields ?? [],
      slug,
      warnings,
      path,
    );
    account[accountIndex].fields = nested.account;
    local[index].fields = nested.local;
  }

  return { account, local };
}

function findSingleLayoutMatch(layouts: AccountLayout[], slug: string): AccountLayout | undefined {
  const matches = layouts.filter((layout) => layout.slug === slug);
  if (matches.length > 1) {
    throw new Error(`Backstage returned multiple layouts with slug "${slug}"; refusing to choose one.`);
  }
  return matches[0];
}

function planLayout(
  layout: InlineLayoutDefinition,
  existing: AccountLayout | undefined,
  warnings: Set<string>,
) {
  if (!existing) return { layout, action: "create" as const };

  const remoteSchema = accountSchema(existing);
  const accountFields = remoteSchema.fields as Field[];
  const extraFields = accountOnlyFields(layout.schema.fields, accountFields);
  if (extraFields.length > 0) {
    throw new Error(
      `Cannot sync layout ${layout.slug}: Backstage has schema fields not present in the local definition: ${extraFields.join(", ")}. Add or migrate those fields explicitly before syncing to avoid removing account fields.`,
    );
  }

  const extraSchemaKeys = Object.keys(remoteSchema).filter((key) => !Object.hasOwn(layout.schema, key));
  if (extraSchemaKeys.length > 0) {
    throw new Error(
      `Cannot sync layout ${layout.slug}: Backstage has schema properties not present in the local definition: ${extraSchemaKeys.join(", ")}. Preserve or migrate them explicitly before syncing.`,
    );
  }

  const fields = comparableFields(accountFields, layout.schema.fields, layout.slug, warnings);
  const accountComparable = { ...remoteSchema, fields: fields.account };
  const localComparable = { ...layout.schema, fields: fields.local };
  const unchanged = existing.name === layout.name
    && existing.slug === layout.slug
    && stableJson(accountComparable) === stableJson(localComparable);

  return { layout, existing, action: unchanged ? "unchanged" as const : "update" as const };
}

function failureAfterPartialSync(layout: InlineLayoutDefinition, result: LayoutSyncResult, error: unknown): Error {
  return new Error(
    `Layout sync stopped at ${layout.slug} after ${result.created} created, ${result.updated} updated, and ${result.unchanged} unchanged. ${errorMessage(error)}`,
    { cause: error },
  );
}

function layoutPayload(layout: InlineLayoutDefinition) {
  return {
    name: layout.name,
    slug: layout.slug,
    schema: layout.schema,
  };
}

async function preflightLayouts(client: LayoutSyncClient, slug?: string): Promise<AccountLayout[]> {
  try {
    const layouts = await client.layouts.list();
    if (!Array.isArray(layouts)) throw new Error("Backstage returned an invalid layout list.");
    return layouts;
  } catch (error) {
    const context = slug ? ` after a create conflict for ${slug}` : " before sync";
    throw new Error(`Failed to list account layouts${context}: ${errorMessage(error)}`, { cause: error });
  }
}

async function updateLayout(
  client: LayoutSyncClient,
  layout: InlineLayoutDefinition,
  existing: AccountLayout,
): Promise<void> {
  if (!existing.id) throw new Error(`Backstage did not return an id for layout ${layout.slug}; refusing to update it.`);
  try {
    await client.layouts.update(existing.id, layoutPayload(layout));
  } catch (error) {
    throw new Error(`Failed to update layout ${layout.slug}: ${errorMessage(error)}`, { cause: error });
  }
}

export async function syncLayouts(
  config: BackstageUserConfig,
  options: LayoutSyncOptions = {},
): Promise<LayoutSyncResult> {
  const layouts = validateLayoutDefinitions(config.layouts ?? []);
  const result: LayoutSyncResult = { created: 0, updated: 0, unchanged: 0 };

  if (layouts.length === 0) {
    console.log("No layouts found in config");
    return result;
  }

  const client = new BackstageClient(config);
  const accountLayouts = await preflightLayouts(client);
  const warnings = new Set<string>();
  const planned = layouts.map((layout) => planLayout(layout, findSingleLayoutMatch(accountLayouts, layout.slug), warnings));

  for (const operation of planned) {
    const { layout, action } = operation;

    if (action === "unchanged") {
      result.unchanged += 1;
      if (!options.dryRun) console.log(`✓ Layout ${layout.slug} unchanged`);
      continue;
    }

    if (options.dryRun) {
      if (action === "create") result.created += 1;
      else result.updated += 1;
      continue;
    }

    if (action === "update" && operation.existing) {
      try {
        await updateLayout(client, layout, operation.existing);
        result.updated += 1;
        console.log(`✓ Layout ${layout.slug} updated`);
      } catch (error) {
        throw failureAfterPartialSync(layout, result, error);
      }
      continue;
    }

    try {
      await client.layouts.create(layoutPayload(layout));
      result.created += 1;
      console.log(`✓ Layout ${layout.slug} created`);
    } catch (error) {
      if (statusOf(error) !== 409) {
        throw failureAfterPartialSync(layout, result, new Error(`Failed to create layout ${layout.slug}: ${errorMessage(error)}`, { cause: error }));
      }

      try {
        const refreshed = await preflightLayouts(client, layout.slug);
        const raced = planLayout(layout, findSingleLayoutMatch(refreshed, layout.slug), warnings);
        if (raced.action === "create") {
          throw new Error(`The create conflicted, but no matching Backstage layout was found for ${layout.slug}.`);
        }
        if (raced.action === "unchanged") {
          result.unchanged += 1;
          console.log(`✓ Layout ${layout.slug} unchanged after create conflict`);
          continue;
        }
        if (!raced.existing) {
          throw new Error(`Backstage did not return the matching layout for ${layout.slug}.`);
        }
        await updateLayout(client, layout, raced.existing);
        result.updated += 1;
        console.log(`✓ Layout ${layout.slug} updated`);
      } catch (raceError) {
        throw failureAfterPartialSync(layout, result, raceError);
      }
    }
  }

  const summary = `${result.created} to create, ${result.updated} to update, ${result.unchanged} unchanged`;
  console.log(options.dryRun ? `Layout sync preview: ${summary}` : `\nSync complete: ${layouts.length} layout(s) processed (${summary})`);
  for (const warning of warnings) console.warn(`Warning: ${warning}`);
  return result;
}
