import type { BackstageUserConfig } from "../../config.js";
import { BackstageClient } from "../../client.js";

export async function syncBlocks(config: BackstageUserConfig) {
  const client = new BackstageClient(config);

  if (!config.blocks || !config.blocks.length) {
    console.log("No blocks found in config");
    return;
  }

  config.blocks.forEach(async (block) => {
    const blockData = {
      name: block.name,
      slug: block.slug,
      description: block?.description ?? null,
      schema: block.schema,
    };

    try {
      await client.blocks.create(blockData);
      console.log(`Block ${block.slug} created`);
    } catch (err: any) {
      if (err.response.status === 409) {
        const id = err.response.data;
        console.log(`Block ${block.slug} already exists with id ${id}. Updating...`);
        await client.blocks.update(id, blockData);
        console.log(`Block ${block.slug} updated`);
        return;
      }
    }
  });
}
