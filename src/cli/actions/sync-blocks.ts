import type { BackstageUserConfig } from "../../config.js";
import { BackstageClient } from "../../client.js";
import { syncBlockManifests } from "../../blocks/sync.js";
import { loadBlockManifests } from "./block-manifests.js";

export async function syncBlocks(config: BackstageUserConfig) {
  const client = new BackstageClient(config);
  const manifests = await loadBlockManifests();

  if ((!config.blocks || !config.blocks.length) && manifests.length === 0) {
    console.log("No blocks found in config");
    return;
  }

  const configuredSlugs = new Set((config.blocks ?? []).map((block) => block.slug));
  const manifestSlugs = new Set(manifests.map((manifest) => manifest.slug));
  const conflictingSlug = [...configuredSlugs].find((slug) => manifestSlugs.has(slug));

  if (conflictingSlug) {
    throw new Error(`Both backstage/config.ts and a block manifest define slug "${conflictingSlug}". Keep one definition source per slug.`);
  }

  if (manifests.length > 0) {
    const result = await syncBlockManifests(client, manifests);
    console.log(`Manifest sync complete: ${result.created} created, ${result.updated} updated`);
  }

  if (!config.blocks || !config.blocks.length) return;

  const syncPromises = config.blocks.map(async (block) => {
    const blockData = {
      name: block.name,
      slug: block.slug,
      description: block?.description,
      schema: block.schema,
      frontstage: block.frontstage,
    };

    try {
      await client.blocks.create(blockData);
      console.log(`✓ Block ${block.slug} created`);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        const id = err.response.data;
        console.log(`⚠ Block ${block.slug} already exists with id ${id}. Updating...`);
        try {
          await client.blocks.update(id, blockData);
          console.log(`✓ Block ${block.slug} updated`);
        } catch (updateErr: any) {
          console.error(`✗ Failed to update block ${block.slug}:`, updateErr?.message || updateErr);
        }
      } else {
        console.error(`✗ Failed to create block ${block.slug}:`, err?.message || err);
      }
    }
  });

  await Promise.all(syncPromises);
  console.log(`\nSync complete: ${config.blocks.length} block(s) processed`);
}
