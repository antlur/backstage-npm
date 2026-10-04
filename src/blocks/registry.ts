import type { Field } from "../studio/types/field.js";
import type { BlockManifest } from "./manifest.js";
import { parseBlockIdentity, parseBlockManifest } from "./manifest.js";
import { callToAction } from "./registry/call-to-action.js";
import { cardGrid } from "./registry/card-grid.js";
import { contactForm } from "./registry/contact-form.js";
import { starterHero } from "./registry/hero.js";
import { image } from "./registry/image.js";
import { imageGallery } from "./registry/image-gallery.js";
import { imageLinkGrid } from "./registry/image-link-grid.js";
import { instagramFeed } from "./registry/instagram-feed.js";
import { mediaWithText } from "./registry/media-with-text.js";
import { menu } from "./registry/menu.js";
import { richText } from "./registry/rich-text.js";
import { upcomingEvents } from "./registry/upcoming-events.js";

const heroManifest = {
  manifest_version: 1,
  type: "block",
  registry_identity: "backstage:hero@1",
  name: "Hero",
  slug: "hero",
  description: "A page introduction with optional text, image, and primary action.",
  schema: {
    fields: [
      { name: "Eyebrow", slug: "eyebrow", type: "text", order: 0 },
      { name: "Heading", slug: "heading", type: "text", order: 1 },
      { name: "Body", slug: "body", type: "textarea", order: 2 },
      { name: "Image", slug: "image", type: "image", order: 3 },
      { name: "Primary action label", slug: "primary_action_label", type: "text", order: 4 },
      { name: "Primary action URL", slug: "primary_action_url", type: "url", order: 5 },
    ],
  },
} satisfies BlockManifest;

const registry: readonly BlockManifest[] = [
  heroManifest,
  starterHero,
  richText,
  image,
  imageGallery,
  imageLinkGrid,
  mediaWithText,
  cardGrid,
  callToAction,
  menu,
  upcomingEvents,
  instagramFeed,
  contactForm,
];

function cloneManifest(manifest: BlockManifest): BlockManifest {
  return JSON.parse(JSON.stringify(manifest)) as BlockManifest;
}

function semanticDefinition(manifest: BlockManifest) {
  return manifest.schema.fields.map(semanticField).sort((left, right) => String(left.slug).localeCompare(String(right.slug)));
}

function semanticField(field: Field): Record<string, unknown> {
  const presentationKeys = new Set(["name", "description", "placeholder", "order", "show_in_list", "is_primary", "value"]);
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(field)) {
    if (presentationKeys.has(key)) continue;

    if (key === "fields" && Array.isArray(value)) {
      result[key] = value.map(semanticField).sort((left, right) => String(left.slug).localeCompare(String(right.slug)));
    } else if (key === "allowed_references" && Array.isArray(value)) {
      result[key] = [...value].sort();
    } else if (key === "options" && Array.isArray(value)) {
      result[key] = value
        .map((option) => (typeof option === "object" && option !== null && "value" in option ? option.value : option))
        .sort((left, right) =>
          (JSON.stringify(stableValue(left)) ?? "").localeCompare(JSON.stringify(stableValue(right)) ?? ""),
        );
    } else {
      result[key] = value;
    }
  }

  return result;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (typeof value !== "object" || value === null) return value;

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, stableValue(child)]),
  );
}

function sameSemanticDefinition(left: BlockManifest, right: BlockManifest): boolean {
  return JSON.stringify(stableValue(semanticDefinition(left))) === JSON.stringify(stableValue(semanticDefinition(right)));
}

export function listRegistryBlocks(): BlockManifest[] {
  return registry.map(cloneManifest);
}

export function searchRegistryBlocks(query: string): BlockManifest[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return listRegistryBlocks();
  }

  return registry
    .filter((manifest) =>
      [manifest.registry_identity, manifest.name, manifest.description ?? ""].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    )
    .map(cloneManifest);
}

export function getRegistryBlock(identity: string): BlockManifest {
  const parsedIdentity = parseBlockIdentity(identity);
  const exactMatch = registry.find((manifest) => manifest.registry_identity === identity);

  if (exactMatch) {
    return cloneManifest(exactMatch);
  }

  const knownBlock = registry.find((manifest) => {
    const knownIdentity = parseBlockIdentity(manifest.registry_identity);
    return knownIdentity.namespace === parsedIdentity.namespace && knownIdentity.key === parsedIdentity.key;
  });

  if (knownBlock) {
    throw new Error(`Unsupported version "${identity}". The registry supports ${knownBlock.registry_identity}.`);
  }

  throw new Error(`Block "${identity}" is not available in the SDK registry.`);
}

export function validateBlockManifest(value: unknown): BlockManifest {
  const manifest = parseBlockManifest(value);
  const registered = registry.find((item) => item.registry_identity === manifest.registry_identity);
  const identityParts = parseBlockIdentity(manifest.registry_identity);
  const knownIdentity = registry.find((item) => {
    const knownParts = parseBlockIdentity(item.registry_identity);
    return knownParts.namespace === identityParts.namespace && knownParts.key === identityParts.key;
  });

  if (knownIdentity && !registered) {
    throw new Error(`Unsupported registry identity "${manifest.registry_identity}". The SDK supports ${knownIdentity.registry_identity}.`);
  }

  if (registered && manifest.derived_from !== registered.derived_from) {
    throw new Error(manifest.registry_identity + " is registry-owned and its derived_from value cannot be changed. Fork it to a site namespace instead.");
  }

  if (registered && !sameSemanticDefinition(manifest, registered)) {
    throw new Error(
      `Manifest ${manifest.registry_identity} differs from the registry contract. Fork it to a site namespace and preserve derived_from before changing its schema.`,
    );
  }

  return manifest;
}
