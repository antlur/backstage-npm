import { BlockSchema, BlockDefinition, BlockComponent } from "./types";

export function defineBlock(options: {
  name: string;
  slug: string;
  schema: BlockSchema<any>;
  component: BlockComponent<typeof options.schema>;
}): BlockDefinition<typeof options.schema.fields> {
  // Runtime validation
  if (!options.name || typeof options.name !== "string") {
    throw new Error("Block name is required and must be a string");
  }

  if (!options.slug || typeof options.slug !== "string") {
    throw new Error("Block slug is required and must be a string");
  }

  if (!options.schema || typeof options.schema !== "object") {
    throw new Error("Block schema is required and must be an object");
  }

  if (!options.component) {
    throw new Error("Block component is required");
  }

  return options;
}
