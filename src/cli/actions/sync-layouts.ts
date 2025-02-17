import type { BackstageUserConfig } from "../../config.js";
import { BackstageClient } from "../../client.js";

export async function syncLayouts(config: BackstageUserConfig) {
  const client = new BackstageClient(config);

  if (!config.layouts || !config.layouts.length) {
    console.log("No layouts found in config");
    return;
  }

  config.layouts.forEach(async (layout) => {
    const layoutData = {
      name: layout.name,
      slug: layout.slug,
      schema: layout.schema,
    };

    try {
      await client.layouts.create(layoutData);
      console.log(`Layout ${layout.slug} created`);
    } catch (err: any) {
      if (err.response.status === 409) {
        const id = err.response.data;
        console.log(`Layout ${layout.slug} already exists with id ${id}. Updating...`);
        try {
          const res = await client.layouts.update(id, layoutData);
          console.log(`Layout ${layout.slug} updated`, res);
        } catch (err) {
          console.error(`Error updating layout ${layout.slug}:`, err);
        }
        return;
      }
    }
  });
}
