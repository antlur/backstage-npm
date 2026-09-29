import type { BackstageClient } from "../client.js";
import type { BlockManifest } from "./manifest.js";
import { validateBlockManifest } from "./registry.js";

type BlockSyncClient = Pick<BackstageClient, "blocks">;

export interface BlockManifestSyncResult {
  created: number;
  updated: number;
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

function findSingleIdentityMatch(blocks: Awaited<ReturnType<BlockSyncClient["blocks"]["list"]>>, identity: string) {
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

export async function syncBlockManifests(
  client: BlockSyncClient,
  values: readonly unknown[],
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
  const result = { created: 0, updated: 0 };

  for (const manifest of manifests) {
    let existing = findSingleIdentityMatch(blocks, manifest.registry_identity);
    assertSlugAvailable(blocks, manifest.slug, manifest.registry_identity, existing?.id);

    if (existing) {
      if (existing.slug !== manifest.slug) {
        throw new Error(
          `Cannot change the slug for ${manifest.registry_identity} from "${existing.slug}" to "${manifest.slug}" during sync because authored pages may refer to it. Migrate slug references explicitly.`,
        );
      }
      await client.blocks.update(existing.id, apiPayload(manifest));
      result.updated += 1;
      continue;
    }

    try {
      existing = await client.blocks.create(apiPayload(manifest));
      blocks.push(existing);
      result.created += 1;
    } catch (error) {
      if (statusOf(error) !== 409) throw error;

      const refreshedBlocks = await client.blocks.list();
      const racedBlock = findSingleIdentityMatch(refreshedBlocks, manifest.registry_identity);

      if (!racedBlock) {
        throw new Error(
          `Cannot safely sync ${manifest.registry_identity}: the slug conflicted, but no Backstage block with that identity exists. No existing block was updated.`,
        );
      }

      assertSlugAvailable(refreshedBlocks, manifest.slug, manifest.registry_identity, racedBlock.id);
      if (racedBlock.slug !== manifest.slug) {
        throw new Error(
          `Cannot change the slug for ${manifest.registry_identity} from "${racedBlock.slug}" to "${manifest.slug}" during sync because authored pages may refer to it. Migrate slug references explicitly.`,
        );
      }
      await client.blocks.update(racedBlock.id, apiPayload(manifest));
      blocks.splice(0, blocks.length, ...refreshedBlocks);
      result.updated += 1;
    }
  }

  return result;
}
