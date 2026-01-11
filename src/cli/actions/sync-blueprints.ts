import type { BackstageUserConfig } from "../../config.js";
import { BackstageClient } from "../../client.js";

export async function syncBlueprints(config: BackstageUserConfig) {
  const client = new BackstageClient(config);

  if (!config.blueprints || !config.blueprints.length) {
    console.log("No blueprints found in config");
    return;
  }

  const syncPromises = config.blueprints.map(async (blueprint) => {
    const blueprintData = {
      name: blueprint.name,
      slug: blueprint.slug,
      slug_single: blueprint.slug_single,
      description: blueprint.description,
      is_routable: blueprint.is_routable,
      has_location: blueprint.has_location,
      has_route_index: blueprint.has_route_index,
      fields: blueprint.fields,
    };

    try {
      await client.blueprints.create(blueprintData);
      console.log(`✓ Blueprint ${blueprint.slug} created`);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        const id = err.response.data;
        console.log(`⚠ Blueprint ${blueprint.slug} already exists with id ${id}. Updating...`);
        try {
          await client.blueprints.update(id, blueprintData);
          console.log(`✓ Blueprint ${blueprint.slug} updated`);
        } catch (updateErr: any) {
          console.error(`✗ Failed to update blueprint ${blueprint.slug}:`, updateErr?.message || updateErr);
        }
      } else {
        console.error(`✗ Failed to create blueprint ${blueprint.slug}:`, err?.message || err);
      }
    }
  });

  await Promise.all(syncPromises);
  console.log(`\nSync complete: ${config.blueprints.length} blueprint(s) processed`);
}