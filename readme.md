# @antlur/backstage

A TypeScript client library for [Backstage CMS](https://bckstg.app) with type-safe block and layout definitions.

## Features

- 🔐 Type-safe API client for Backstage CMS
- 🧱 Define custom blocks with full TypeScript support
- 📐 Define custom layouts with schema validation
- 🔄 CLI tools for syncing blocks and layouts
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

// Fetch locations
const locations = await client.locations.getLocations();
const location = await client.locations.getLocationBySlug("downtown");

// Fetch events
const events = await client.events.getEvents();
const event = await client.events.getEventBySlug("summer-festival");

// Fetch menus
const menu = await client.menus.getMenu("main-menu");
```

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
  }),
  defineField({
    name: "Subtitle",
    slug: "subtitle",
    type: "text",
  }),
  defineField({
    name: "Background Image",
    slug: "backgroundImage",
    type: "image",
    required: true,
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
  component: Hero,
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

## CLI Commands

Sync your blocks and layouts to Backstage CMS:

```bash
# Sync blocks only
npx backstage sync blocks

# Sync layouts only
npx backstage sync layouts

# Sync everything
npx backstage sync all
```

Add this to your `backstage.config.ts`:

```typescript
import { defineConfig } from "@antlur/backstage";
import { heroBlock } from "./blocks/hero";

export default defineConfig({
  accountId: process.env.BACKSTAGE_ACCOUNT_ID,
  token: process.env.BACKSTAGE_API_KEY,
  blocks: [heroBlock],
});
```

## Available Services

The client provides the following services:

- `client.pages` - Page management
- `client.blocks` - Block management
- `client.layouts` - Layout management
- `client.locations` - Location management
- `client.events` - Event management
- `client.menus` - Menu management
- `client.navigation` - Navigation management
- `client.media` - Media management
- `client.alerts` - Alert management
- `client.press` - Press release management
- `client.website` - Website settings
- `client.instagram` - Instagram integration

## Field Types

Supported field types for blocks and layouts:

- `text` - Single-line text input
- `textarea` - Multi-line text input
- `rich_text` - Rich text editor
- `number` - Numeric input
- `boolean` - Checkbox
- `select` - Select from predefined options
- `reference` - Reference to entries from specific blueprints (supports `is_multiple` for multiple selections)
- `url` - URL input
- `image` - Single image picker
- `image_list` - Multiple image picker
- `media` - Media item picker
- `list_array` - Array of strings
- `repeater` - Repeatable field group
- `event_select` - Event selector
- `menu_select` - Menu selector
- `form_select` - Form selector
- `press_select` - Press release selector
- `navigation_select` - Navigation selector

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
