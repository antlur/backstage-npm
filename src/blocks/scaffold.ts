import type { BlockManifest } from "./manifest.js";

export function astroRendererFileName(slug: string): string {
  const componentName = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");

  return componentName + ".astro";
}

export function createAstroRendererScaffold(manifest: Pick<BlockManifest, "name" | "slug">): string {
  const componentName = astroRendererFileName(manifest.slug).replace(/\.astro$/, "");

  return [
    "---",
    "type " + componentName + "Block = {",
    "  type?: string;",
    "  fields: Record<string, unknown>;",
    "};",
    "",
    "const { block } = Astro.props as { block: " + componentName + "Block };",
    "---",
    "",
    "<section class=\"block block--" + manifest.slug + "\" data-block={block.type ?? \"" + manifest.slug + "\"}>",
    "  <!-- Render " + manifest.name + " using its fields; sanitize rich text before rendering HTML. -->",
    "</section>",
    "",
  ].join("\n");
}
