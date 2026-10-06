import type { BackstageClient } from "../client.js";
import type { AccountBlock } from "../types/account-block.js";
import type { Field } from "../studio/types/field.js";
import type { BlockManifest } from "./manifest.js";
import { validateBlockManifest } from "./registry.js";

type BlockSyncClient = Pick<BackstageClient, "blocks">;

export interface BlockManifestSyncResult {
  created: number;
  updated: number;
  unchanged: number;
  warnings?: string[];
}

export interface BlockManifestSyncOptions {
  dryRun?: boolean;
}

function apiPayload(manifest: BlockManifest) {
  return {
    name: manifest.name,
    slug: manifest.slug,
    description: manifest.description,
    schema: manifest.schema,
    registry_identity: manifest.registry_identity,
    ...(manifest.derived_from !== undefined ? { derived_from: manifest.derived_from } : {}),
  };
}

function findSingleIdentityMatch(blocks: AccountBlock[], identity: string): AccountBlock | undefined {
  const matches = blocks.filter((block) => block.registry_identity === identity);

  if (matches.length > 1) {
    throw new Error(`Backstage returned multiple blocks with identity ${identity}; refusing to choose one.`);
  }

  return matches[0];
}

function assertSlugAvailable(
  blocks: Awaited<ReturnType<BlockSyncClient["blocks"]["list"]>>,
  slug: string,
  identity: string,
  matchingId?: string,
): void {
  const collision = blocks.find((block) => block.slug === slug && block.id !== matchingId);

  if (collision) {
    throw new Error(
      `Cannot sync ${identity}: Backstage block slug "${slug}" is already owned by ${collision.registry_identity ?? `unregistered block ${collision.id}`}. Resolve the slug conflict explicitly.`,
    );
  }
}

function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const response = (error as { response?: { status?: unknown } }).response;
  return typeof response?.status === "number" ? response.status : undefined;
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

function normalizedFields(fields: readonly Field[]): unknown[] {
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
  manifestFields: readonly Field[],
  identity: string,
  warnings: Set<string>,
  parent = "",
): { account: unknown[]; manifest: unknown[] } {
  const account = normalizedFields(accountFields) as Array<Record<string, unknown>>;
  const manifest = normalizedFields(manifestFields) as Array<Record<string, unknown>>;
  const accountIndexes = new Map(accountFields.map((field, index) => [field.slug, index]));

  for (const [index, manifestField] of manifestFields.entries()) {
    const accountIndex = accountIndexes.get(manifestField.slug);
    if (accountIndex === undefined) continue;

    const accountField = accountFields[accountIndex];
    const path = parent ? `${parent}.${manifestField.slug}` : manifestField.slug;

    // Some Backstage API versions omit required metadata from AccountBlock fields.
    // Treat an omitted value as unsupported, but report that the editor may not enforce it.
    if (manifestField.required === true && !Object.hasOwn(accountField, "required")) {
      delete account[accountIndex].required;
      delete manifest[index].required;
      warnings.add(`Backstage did not return required metadata for ${identity}.${path}; the account editor may not enforce this field as required.`);
    }

    const nested = comparableFields(
      accountField.fields ?? [],
      manifestField.fields ?? [],
      identity,
      warnings,
      path,
    );
    account[accountIndex].fields = nested.account;
    manifest[index].fields = nested.manifest;
  }

  return { account, manifest };
}

function matchesManifest(existing: AccountBlock, manifest: BlockManifest, warnings: Set<string>): boolean {
  const fields = comparableFields(
    existing.schema?.fields ?? [],
    manifest.schema.fields,
    manifest.registry_identity,
    warnings,
  );

  return existing.name === manifest.name
    && existing.slug === manifest.slug
    && (manifest.description === undefined || (existing.description ?? null) === manifest.description)
    && (existing.registry_identity ?? null) === manifest.registry_identity
    && (manifest.derived_from === undefined || (existing.derived_from ?? null) === manifest.derived_from)
    && stableJson(fields.account) === stableJson(fields.manifest);
}

function planManifest(manifest: BlockManifest, blocks: AccountBlock[]) {
  const existing = findSingleIdentityMatch(blocks, manifest.registry_identity);
  assertSlugAvailable(blocks, manifest.slug, manifest.registry_identity, existing?.id);

  if (existing && existing.slug !== manifest.slug) {
    throw new Error(
      `Cannot change the slug for ${manifest.registry_identity} from "${existing.slug}" to "${manifest.slug}" during sync because authored pages may refer to it. Migrate slug references explicitly.`,
    );
  }

  const warnings = new Set<string>();

  if (existing) {
    const extraFields = accountOnlyFields(manifest.schema.fields, existing.schema?.fields ?? []);

    if (extraFields.length > 0) {
      throw new Error(
        `Cannot sync ${manifest.registry_identity}: Backstage block "${manifest.slug}" has fields not present in the local manifest: ${extraFields.join(", ")}. Update the manifest before syncing to avoid removing account fields.`,
      );
    }
  }

  if (!existing) return { manifest, action: "create" as const, warnings: [] };
  if (matchesManifest(existing, manifest, warnings)) {
    return { manifest, existing, action: "unchanged" as const, warnings: [...warnings] };
  }
  return { manifest, existing, action: "update" as const, warnings: [...warnings] };
}

function failureAfterPartialSync(manifest: BlockManifest, result: BlockManifestSyncResult, error: unknown): Error {
  const detail = error instanceof Error ? error.message : String(error);
  return new Error(
    `Block sync stopped at ${manifest.registry_identity} after ${result.created} created, ${result.updated} updated, and ${result.unchanged} unchanged. ${detail}`,
    { cause: error },
  );
}

export async function syncBlockManifests(
  client: BlockSyncClient,
  values: readonly unknown[],
  options: BlockManifestSyncOptions = {},
): Promise<BlockManifestSyncResult> {
  const manifests = values.map(validateBlockManifest);
  const identities = new Set<string>();
  const slugs = new Set<string>();

  for (const manifest of manifests) {
    if (identities.has(manifest.registry_identity)) {
      throw new Error(`Multiple local manifests use identity ${manifest.registry_identity}.`);
    }
    identities.add(manifest.registry_identity);

    if (slugs.has(manifest.slug)) {
      throw new Error(`Multiple local manifests use slug "${manifest.slug}".`);
    }
    slugs.add(manifest.slug);
  }

  const blocks = await client.blocks.list();
  const planned = manifests.map((manifest) => planManifest(manifest, blocks));
  const result = { created: 0, updated: 0, unchanged: 0 };
  const warnings = new Set(planned.flatMap((operation) => operation.warnings));

  for (const operation of planned) {
    const { manifest, existing, action } = operation;

    if (action === "unchanged") {
      result.unchanged += 1;
      continue;
    }

    if (options.dryRun) {
      if (action === "create") result.created += 1;
      else result.updated += 1;
      continue;
    }

    try {
      if (action === "update" && existing) {
        const updated = await client.blocks.update(existing.id, apiPayload(manifest));
        result.updated += 1;
        if (updated?.schema?.fields) {
          comparableFields(updated.schema.fields, manifest.schema.fields, manifest.registry_identity, warnings);
        }
        continue;
      }

      const created = await client.blocks.create(apiPayload(manifest));
      result.created += 1;
      if (created?.schema?.fields) {
        comparableFields(created.schema.fields, manifest.schema.fields, manifest.registry_identity, warnings);
      }
    } catch (error) {
      if (action !== "create" || statusOf(error) !== 409) {
        throw failureAfterPartialSync(manifest, result, error);
      }

      try {
        const refreshedBlocks = await client.blocks.list();
        const raced = planManifest(manifest, refreshedBlocks);
        raced.warnings.forEach((warning) => warnings.add(warning));

        if (raced.action === "create") {
          throw new Error(`The create conflicted, but no matching Backstage block was found for ${manifest.registry_identity}.`);
        }

        if (raced.action === "unchanged") {
          result.unchanged += 1;
          continue;
        }

        if (!raced.existing) {
          throw new Error(`Backstage did not return the matching block for ${manifest.registry_identity}.`);
        }

        const updated = await client.blocks.update(raced.existing.id, apiPayload(manifest));
        result.updated += 1;
        if (updated?.schema?.fields) {
          comparableFields(updated.schema.fields, manifest.schema.fields, manifest.registry_identity, warnings);
        }
      } catch (raceError) {
        throw failureAfterPartialSync(manifest, result, raceError);
      }
    }
  }

  return warnings.size > 0 ? { ...result, warnings: [...warnings] } : result;
}
