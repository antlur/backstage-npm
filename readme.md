# @antlur/backstage

A TypeScript client library for [Backstage CMS](https://bckstg.app) with type-safe block and layout definitions.

## Publishing

Use the explicit release command so the package is rebuilt and tested even when
npm lifecycle scripts are disabled on the publishing machine:

```bash
npm run publish:release
```

Use `npm run pack:release` to inspect the exact tarball without publishing it.
Do not run `npm publish` directly because it can package a stale `dist` directory
when npm is configured with `ignore-scripts=true`.

## Features

- 🔐 Type-safe API client for Backstage CMS
- 🧱 Define custom blocks with full TypeScript support
- 📐 Define custom layouts with schema validation
- � Define custom blueprints (content types) with field schemas
- 🧩 Inspect account modules such as Site Builder, Custom Blocks, Events, and Press
- 🔄 CLI tools for syncing blocks, blueprints, and layouts
- ⚛️ React components for page metadata and structured data
- 🎨 Framework-agnostic design (works with Next.js, React, etc.)

## Installation

```bash
npm install @antlur/backstage
# or
yarn add @antlur/backstage
# or
pnpm add @antlur/backstage
```

## Quick Start

### 1. Environment Setup

Create a `.env` file in your project root:

```bash
# Required
BACKSTAGE_API_KEY=your_api_key_here
BACKSTAGE_ACCOUNT_ID=your_account_id_here

# Optional (defaults to https://bckstg.app/api)
BACKSTAGE_API_URL=https://bckstg.app/api
```

### 2. Configure Backstage

Create a `backstage.config.ts` file:

```typescript
import { defineConfig } from "@antlur/backstage";

export default defineConfig({
  accountId: process.env.BACKSTAGE_ACCOUNT_ID,
  token: process.env.BACKSTAGE_API_KEY,
  // Optional: define your blocks and layouts here
  blocks: [],
  layouts: [],
});
```

### 3. Use the Client

```typescript
import { BackstageClient } from "@antlur/backstage";

const client = new BackstageClient();

// Fetch pages
const pages = await client.pages.getPages();
const homePage = await client.pages.getHomePage();
const page = await client.pages.getPageBySlug("about");

// Read renderer-ready Headless page blocks and a public form definition
const headlessPages = await client.pages.getHeadlessPages();
const form = await client.forms.getFormDefinition("contact-form-id");

// Fetch locations
const locations = await client.locations.getLocations();
const location = await client.locations.getLocationBySlug("downtown");

// Fetch events
const events = await client.events.getEvents();
const event = await client.events.getEventBySlug("summer-festival");

// Fetch menus
const menu = await client.menus.getMenu("main-menu");

// Check account modules before using premium authoring APIs
const customBlocksEnabled = await client.modules.isEnabled("cms.custom_blocks");
```

## Project-Owned Block Manifests

The project owns each portable block manifest and its renderer. The SDK validates the manifest format and syncs the project definition to the account editor. The [Astro Starter](https://github.com/antlur/starter-astro) ships its own block catalog and syncs it with `npm run sync:blocks`.

SDK 2.0 removes the bundled catalog, its list/search/install/fork CLI commands, and the three registry discovery exports. Keep existing project manifests and their identities; no account or page migration is required. To create a site-specific derivative, copy the source manifest and assign a new identity and slug, optionally recording the original identity in `derived_from`.

## Defining Custom Blocks

Create type-safe blocks for your CMS:

```typescript
// blocks/hero/schema.ts
import { defineBlockSchema, defineField } from "@antlur/backstage/studio";

const heroFields = [
  defineField({
    name: "Title",
    slug: "title",
    type: "text",
    required: true,
    placeholder: "Enter hero title...",
  }),
  defineField({
    name: "Subtitle",
    slug: "subtitle",
    type: "textarea",
    description: "Optional subtitle text",
  }),
  defineField({
    name: "Background Image",
    slug: "backgroundImage",
    type: "image",
    required: true,
  }),
  defineField({
    name: "Display Style",
    slug: "displayStyle",
    type: "select",
    options: [
      { label: "Full Width", value: "full" },
      { label: "Centered", value: "centered" },
      { label: "Left Aligned", value: "left" },
    ],
    required: true,
  }),
  defineField({
    name: "Featured Products",
    slug: "featuredProducts",
    type: "reference",
    allowed_references: ["products"],
    is_multiple: true,
    description: "Select products to feature",
  }),
] as const;

export const schema = defineBlockSchema({
  fields: heroFields,
});

export default schema;
```

```typescript
// blocks/hero/component.tsx
import type { BlockComponentProps } from "@antlur/backstage/studio";
import schema from "./schema";

export default function Hero({ block }: BlockComponentProps<typeof schema>) {
  const { title, subtitle, backgroundImage } = block.fields;

  return (
    <div className="hero" style={{ backgroundImage: `url(${backgroundImage.url})` }}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
```

```typescript
// blocks/hero/index.ts
import { defineBlock } from "@antlur/backstage/studio";
import schema from "./schema";
import Hero from "./component";

export const heroBlock = defineBlock({
  name: "Hero",
  slug: "hero",
  description: "A hero section with title, subtitle, and background image",
  schema,
  // Optional: map this custom block onto a Frontstage renderer.
  // Requires the account's Custom Blocks module in Backstage.
  frontstage: {
    enabled: true,
    type: "hero",
    defaultVariant: "full-bleed-image",
    variants: ["full-bleed-image"],
  },
  component: Hero,
});
```

Custom block and custom layout authoring are advanced Backstage modules. The SDK can sync them when the account has `cms.custom_blocks` or `cms.custom_layouts` enabled; standard templated Frontstage sites can still use system-defined blocks and layouts without those modules.

## Defining Custom Blueprints

Create content types (blueprints) with custom field schemas:

```typescript
// blueprints/customer.ts
import { defineBlueprint } from "@antlur/backstage/studio";

export const customerBlueprint = defineBlueprint({
  name: "Customer",
  slug: "customers",
  description: "Customer testimonials and information",
  fields: [
    {
      name: "Name",
      slug: "name",
      type: "text",
      is_primary: true, // Primary field for display
      required: true,
      placeholder: "Customer full name",
    },
    {
      name: "Email",
      slug: "email",
      type: "email",
      required: true,
      placeholder: "customer@example.com",
    },
    {
      name: "Company",
      slug: "company",
      type: "text",
      placeholder: "Company name",
    },
    {
      name: "Photo",
      slug: "photo",
      type: "image",
    },
    {
      name: "Testimonial",
      slug: "testimonial",
      type: "textarea",
      required: true,
      placeholder: "Customer testimonial...",
    },
    {
      name: "Rating",
      slug: "rating",
      type: "select",
      options: [
        { label: "5 Stars", value: 5 },
        { label: "4 Stars", value: 4 },
        { label: "3 Stars", value: 3 },
        { label: "2 Stars", value: 2 },
        { label: "1 Star", value: 1 },
      ],
      required: true,
    },
    {
      name: "Show in Testimonials",
      slug: "showInTestimonials",
      type: "boolean",
      show_in_list: true, // Show in admin list view
    },
  ],
});
```

Add blueprints to your config:

```typescript
import { defineConfig } from "@antlur/backstage";
import { customerBlueprint } from "./blueprints/customer";

export default defineConfig({
  accountId: process.env.BACKSTAGE_ACCOUNT_ID,
  token: process.env.BACKSTAGE_API_KEY,
  blueprints: [customerBlueprint],
});
```

## Using Reference Fields

Reference fields allow you to link to entries from specific blueprints. You can constrain which blueprints are allowed:

```typescript
// blocks/testimonials/schema.ts
import { defineBlockSchema, defineField } from "@antlur/backstage/studio";

const testimonialFields = [
  defineField({
    name: "Customers",
    slug: "customers",
    type: "reference",
    description: "Select customer entries",
    allowed_references: ["customers"], // Only allow entries from the "customers" blueprint
    is_multiple: true, // Allow multiple customer selections
    required: true,
  }),
  defineField({
    name: "Quote",
    slug: "quote",
    type: "textarea",
    description: "The testimonial quote",
    required: true,
  }),
];

export const schema = defineBlockSchema({
  fields: testimonialFields,
});
```

In your component, the reference field will contain the full entry data:

```typescript
// blocks/testimonials/component.tsx
import type { BlockComponentProps } from "@antlur/backstage/studio";
import schema from "./schema";

export default function Testimonials({ block }: BlockComponentProps<typeof schema>) {
  const { customers, quote } = block.fields;

  return (
    <div className="testimonial">
      <blockquote>"{quote}"</blockquote>
      <cite>
        - {customers.map(customer => customer.name).join(", ")}
      </cite> {/* Access entry properties */}
    </div>
  );
}
```

## Field Options

When defining fields for blocks and blueprints, you can set various options to customize their behavior:

### Common Field Options

- `name` (required): Display name for the field
- `slug` (required): Unique identifier for the field
- `type` (required): Field type (see supported types below)
- `description`: Help text shown to content editors
- `placeholder`: Placeholder text shown in input fields
- `required`: Whether the field is required
- `options`: For select fields, array of `{ label: string, value: any }` options
- `allowed_references`: For reference fields, array of blueprint slugs to reference
- `is_multiple`: For reference fields, allow multiple selections

### Blueprint-Specific Options

- `is_primary`: Mark as the primary field (used for display in lists)
- `show_in_list`: Show this field in admin list views
- `order`: Display order in forms (number)
- `type_id`: For fieldset references, the ID of the fieldset

## CLI Commands

Sync your blocks, blueprints, and layouts to Backstage CMS:

The CLI loads `backstage.config.ts` from the project root. Existing projects may keep using `backstage/config.ts`; the root file takes precedence when both exist. Set `blockManifestDirectory` to the directory containing per-block manifest folders when it is not the default `blocks/` directory. Sync, validate, install, and fork use this configured path.

Preview versioned block-manifest changes without writing with `npx backstage sync blocks --dry-run`. This validates local manifests and account slug/schema safety before reporting planned creates, updates, and unchanged blocks. Inline `blocks` in config are not previewable. If the Backstage API omits schema metadata such as a field's `required` flag, sync reports that limitation and avoids repeating writes for metadata the API does not return; the CMS editor may not enforce that setting.

Preview configured layouts with `npx backstage sync layouts --dry-run`. Layout preview reads account layouts, compares schemas, and reports creates, updates, and unchanged layouts without sending writes. Sync refuses to remove account-only schema fields and performs no writes if preflight finds an unsafe layout.

```bash
# Sync blocks only
npx backstage sync blocks

# Sync blueprints only
npx backstage sync blueprints

# Sync layouts only
npx backstage sync layouts

# Sync everything
npx backstage sync all
```

Portable block manifests are independent of React components and renderer styling:

```bash
npx backstage block validate
npx backstage sync blocks --dry-run
npx backstage sync blocks
```

`validate` checks all manifests under the configured directory, or one file/directory when a path is provided. `sync blocks` creates or updates AccountBlock definitions by registry identity only; it never modifies authored page content. It refuses to adopt a same-slug block with a different or missing identity. The project is responsible for keeping schema edits compatible with existing saved values; adding an optional field can retain the original identity and account block ID.

The legacy React `blocks` array remains supported in the config file, and can be synced alongside manifests, but do not define the same slug in both places.

Layouts may be declared with a versioned manifest envelope or the existing inline `{ name, slug, schema }` form. A manifest uses `manifest_version: 1`, `type: "layout"`, and `schema.fields`; the CLI validates every configured layout and rejects duplicate slugs before writing. Sync preflights account layouts by slug, skips unchanged layouts, and refuses updates that would remove account-only schema fields. A create conflict triggers a fresh lookup and the same safety checks. The Backstage API payload remains `{ name, slug, schema }`.

```typescript
import { defineConfig } from "@antlur/backstage";

export default defineConfig({
  layouts: [
    {
      manifest_version: 1,
      type: "layout",
      name: "Standard Page",
      slug: "standard-page",
      schema: { fields: [] },
    },
  ],
});
```

For a starter that keeps manifests next to renderer files, add this to `backstage.config.ts`:

```typescript
import { defineConfig } from "@antlur/backstage";

export default defineConfig({
  blockManifestDirectory: "src/blocks",
});
```

Inline React blocks remain supported when needed:

```typescript
import { defineConfig } from "@antlur/backstage";
import { heroBlock } from "./src/blocks/hero";

export default defineConfig({
  accountId: process.env.BACKSTAGE_ACCOUNT_ID,
  token: process.env.BACKSTAGE_API_KEY,
  blocks: [heroBlock],
});
```

## Available Services

The client provides the following services:

- `client.pages` - Page management
- `client.forms` - Form definitions and submissions
- `client.blocks` - Block management
- `client.blueprints` - Blueprint (content type) management
- `client.layouts` - Layout management
- `client.locations` - Location management
- `client.events` - Event management
- `client.menus` - Menu management
- `client.navigation` - Navigation management
- `client.media` - Media management
- `client.alerts` - Alert management
- `client.press` - Press release management
- `client.website` - Website settings
- `client.structuredData` - schema.org JSON-LD for the account website
- `client.instagram` - Instagram integration

## Field Types

Supported field types for blocks, blueprints, and layouts:

- `text` - Single-line text input
- `textarea` - Multi-line text input
- `rich_text` - Rich text editor
- `markdown` - Markdown editor
- `number` - Numeric input
- `boolean` - Checkbox
- `select` - Select from predefined options
- `reference` - Reference to entries from specific blueprints (supports `is_multiple` for multiple selections)
- `url` - URL input
- `email` - Email input
- `slug` - URL slug input
- `date` - Date picker
- `time` - Time picker
- `datetime` - Date and time picker
- `location` - Location picker
- `image` - Single image picker
- `image_list` - Multiple image picker
- `media` - Media item picker
- `list_array` - Array of strings
- `repeater` - Repeatable field group
- `fieldset` - Grouped fields
- `event_select` - Event selector
- `menu_select` - Menu selector
- `form_select` - Form selector
- `press_select` - Press release selector
- `navigation_select` - Navigation selector
- `page_select` - Page selector

## React Components

```typescript
import { PageMeta } from "@antlur/backstage";

export default function MyPage({ page }) {
  return (
    <>
      <PageMeta page={page} />
      {/* Your page content */}
    </>
  );
}
```

## TypeScript Support

This library is written in TypeScript and provides full type definitions. All API responses are typed, and block/layout definitions provide excellent autocompletion and type safety.

## License

MIT

## Contributing

Issues and pull requests are welcome! Please visit the [GitHub repository](https://github.com/antlur/backstage-npm).

## Support

For questions or support, please open an issue on GitHub or contact the Backstage CMS team.

## Headless theme token declarations

Theme declaration sync is available in SDK 2.0.0; radius declarations are available in SDK 2.1.0.

Design ownership is configured independently from content and API credentials. It
defaults to local when `designTokens` or `source` is omitted:

```ts
export default defineConfig({
  designTokens: { source: "local" }, // or "backstage" to opt in
});
```

Local mode uses committed CSS and skips theme declaration sync, including dry runs,
without making requests. Backstage mode opts into managed Brand and Theme values;
renderers read the existing website's `theme.colors.palette`, `font_families`, and
`theme_tokens` during their normal build. The SDK does not fetch/apply styles just
because `defineConfig` was called. `resolveDesignTokenSource(config)` validates and
resolves the setting for consumers; `DesignTokenSource` and `DesignTokensConfig` are
public types. Invalid sources fail rather than silently enabling managed design.

**Upgrading from 1.22:** theme sync previously ran whenever declarations existed.
Add `designTokens: { source: "backstage" }` to keep syncing. API credentials and
Backstage content alone do not opt a site into managed design. Builds remain
read-only; declaration registration is an explicit CLI action.

Register the color and radius roles a site supports with the deployed website theme-token API:

```ts
export default defineConfig({
  designTokens: { source: "backstage" },
  themeTokens: {
    action: {
      label: "Action color",
      type: "color",
      cssVariable: "--theme-color-action",
      default: "#294C3D",
    },
    "button-radius": {
      label: "Button radius",
      type: "radius",
      cssVariable: "--theme-radius-button",
      default: "pill",
    },
  },
});
```

```bash
backstage sync theme-tokens --dry-run
backstage sync theme-tokens
```

This selects the account's single website and sends only `theme_tokens.tokens` through
its existing update endpoint. Saved `theme_tokens.values` overrides are preserved,
including keys temporarily removed from the declarations. Repeating a sync skips
unchanged declarations. Omitting `themeTokens` leaves server declarations alone;
setting it to `{}` explicitly clears declarations while preserving saved values.
`backstage sync all` includes declarations when configured. Explicit sync needs a
Backstage account token with website write access; read-only build tokens still work
for reading values.

Color and radius tokens are supported. The API accepts a hex default and editor
overrides of `#RGB`, `#RRGGBB`, or `palette:<palette token or name>` for colors, and
`pill` or `0px` through `32px` for radii. Radius values are strings, remain canonical
lowercase on the wire, and renderers map `pill` to `9999px` only when emitting CSS.
SDK exports include `ColorThemeToken`, `RadiusThemeToken`, `RadiusThemeTokenValue`,
`ThemeTokenDeclarations`, `WebsiteThemeTokens`, `ThemeTokensUpdate`, and
`normalizeThemeRadius`; `Website.theme_tokens` is optional for older-server compatibility.
Renderers resolve palette overrides from `website.theme.colors.palette`, leave
local CSS defaults in control when an override is missing or no longer resolves,
and emit CSS variables during their normal site build. Declaration sync does not modify
local CSS or font assets. On older servers without `theme_tokens`, sync stops before
writing instead of treating the missing capability as an empty schema.
