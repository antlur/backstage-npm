import { LayoutSchema, LayoutDefinition, LayoutComponentProps } from "./types";

export function defineLayout(options: {
  name: string;
  slug: string;
  schema: LayoutSchema<any>;
  component: React.ComponentType<LayoutComponentProps<typeof options.schema>>;
}): LayoutDefinition<typeof options.schema.fields> {
  // Runtime validation
  if (!options.name || typeof options.name !== "string") {
    throw new Error("Layout name is required and must be a string");
  }

  if (!options.slug || typeof options.slug !== "string") {
    throw new Error("Layout slug is required and must be a string");
  }

  if (!options.schema || typeof options.schema !== "object") {
    throw new Error("Layout schema is required and must be an object");
  }

  if (!options.component) {
    throw new Error("Layout component is required");
  }

  return options;
}
