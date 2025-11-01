import type { BackstageUserConfig } from "../../config.js";
import { BackstageClient } from "../../client.js";

export async function syncLayouts(config: BackstageUserConfig) {
  const client = new BackstageClient(config);

  if (!config.layouts || !config.layouts.length) {
    console.log("No layouts found in config");
    return;
  }

  const syncPromises = config.layouts.map(async (layout) => {
    const layoutData = {
      name: layout.name,
      slug: layout.slug,
      schema: layout.schema,
    };

    try {
      await client.layouts.create(layoutData);
      console.log(`✓ Layout ${layout.slug} created`);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        const id = err.response.data;
        console.log(`⚠ Layout ${layout.slug} already exists with id ${id}. Updating...`);
        try {
          await client.layouts.update(id, layoutData);
          console.log(`✓ Layout ${layout.slug} updated`);
        } catch (updateErr: any) {
          console.error(`✗ Failed to update layout ${layout.slug}:`, updateErr?.message || updateErr);
        }
      } else {
        console.error(`✗ Failed to create layout ${layout.slug}:`, err?.message || err);
      }
    }
  });

  await Promise.all(syncPromises);
  console.log(`\nSync complete: ${config.layouts.length} layout(s) processed`);
}
