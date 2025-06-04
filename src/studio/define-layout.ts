import { LayoutSchema, LayoutDefinition, LayoutComponentProps, Field } from "./types";

export function defineLayout<T extends readonly Field[]>(options: {
  name: string;
  slug: string;
  schema: LayoutSchema<T>;
  component: React.ComponentType<LayoutComponentProps<LayoutSchema<T>>>;
}): LayoutDefinition<T> {
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
