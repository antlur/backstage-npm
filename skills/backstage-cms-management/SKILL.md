---
name: backstage-cms-data-management
description: Guide for using the @antlur/backstage SDK to manage data in Backstage CMS, including CRUD operations on entries, blocks, layouts, blueprints, and more. Use this skill when working with Backstage CMS API, defining custom components, or syncing content.
metadata:
  short-description: Expert guidance for Backstage CMS data management using the @antlur/backstage SDK
---

# Backstage CMS Data Management Skill

This skill provides comprehensive guidance for using the @antlur/backstage TypeScript SDK to interact with Backstage CMS. It covers authentication, client usage, content management, custom block/layout/blueprint definitions, and CLI operations.

## Prerequisites

- Install the SDK: `npm install @antlur/backstage`
- Set up environment variables:
  - `BACKSTAGE_API_KEY`: Your API key
  - `BACKSTAGE_ACCOUNT_ID`: Your account ID
  - `BACKSTAGE_API_URL`: API URL (optional, defaults to <https://bckstg.app/api>)

## Client Initialization

Always start by creating a configured client:

```typescript
import { BackstageClient } from "@antlur/backstage";

const client = new BackstageClient({
  token: process.env.BACKSTAGE_API_KEY,
  accountId: process.env.BACKSTAGE_ACCOUNT_ID,
  baseURL: process.env.BACKSTAGE_API_URL,
});
```

## Content Management Operations

### Pages

```typescript
// Get all pages
const pages = await client.pages.getPages();

// Get home page
const homePage = await client.pages.getHomePage();

// Get page by slug
const page = await client.pages.getPageBySlug("about");

// Create/update page
const newPage = await client.pages.createPage({
  title: "New Page",
  slug: "new-page",
  blocks: [
    {
      type: "text",
      data: { content: "Page content..." }
    }
  ],
  seo_title: "SEO Title",
  seo_description: "SEO Description"
});

// Update existing page
await client.pages.updatePage(pageId, {
  title: "Updated Title",
  blocks: [...]
});

// Delete page
await client.pages.deletePage(pageId);
```

### Entries (Content)

```typescript
// Get all entries
const entries = await client.entries.getEntries();

// Get specific entry
const entry = await client.entries.getEntry(entryId);

// Get entries by blueprint (collection)
const articles = await client.entries.getCollection("article");

// Create entry
const newEntry = await client.entries.createEntry({
  blueprint_id: "article-blueprint-id",
  data: {
    title: "My Article",
    content: "Article content...",
    author: "John Doe"
  },
  seo: {
    title: "SEO Title",
    description: "SEO Description"
  },
  status: "published"
});

// Update entry
await client.entries.updateEntry(entryId, {
  data: {
    title: "Updated Title",
    content: "Updated content"
  },
  status: "draft"
});

// Delete entry
await client.entries.deleteEntry(entryId);
```

### Locations

```typescript
// Get all locations
const locations = await client.locations.getLocations();

// Get location by slug
const location = await client.locations.getLocationBySlug("downtown");

// Create location
const newLocation = await client.locations.createLocation({
  name: "New Store",
  address: "123 Main St",
  city: "Anytown",
  state: "CA",
  zip: "12345",
  slug: "new-store"
});

// Update location
await client.locations.updateLocation(locationId, {
  name: "Updated Store Name"
});

// Delete location
await client.locations.deleteLocation(locationId);
```

### Events

```typescript
// Get events
const events = await client.events.getEvents();

// Get event by ID
const event = await client.events.getEvent(eventId);

// Get event by slug
const eventBySlug = await client.events.getEventBySlug("summer-festival");

// Create event
const newEvent = await client.events.createEvent({
  title: "Summer Festival",
  start_time: "2024-07-01T10:00:00Z",
  end_time: "2024-07-01T18:00:00Z",
  timezone: "America/New_York",
  short_description: "Annual summer festival",
  description: "Full event description..."
});

// Update event
await client.events.updateEvent(eventId, {
  title: "Updated Event Title"
});

// Delete event
await client.events.deleteEvent(eventId);
```

### Menus

```typescript
// Get all menus
const menus = await client.menus.getMenus();

// Get menu by ID
const menu = await client.menus.getMenu("menu-id");

// Get menu by slug
const mainMenu = await client.menus.getMenuBySlug("main-menu");

// Create menu
const newMenu = await client.menus.createMenu({
  title: "New Menu",
  slug: "new-menu",
  subtitle: "Menu subtitle",
  is_default: false
});

// Update menu
await client.menus.updateMenu(menuId, {
  title: "Updated Menu Title"
});

// Delete menu
await client.menus.deleteMenu(menuId);
```

### Media

```typescript
// Get all media files
const media = await client.media.all();

// Get specific media
const mediaItem = await client.media.get(mediaId);

// Upload media file
const uploadedMedia = await client.media.upload(file, {
  name: "image.jpg",
  alt: "Alt text"
});

// Create media from URL
const mediaFromUrl = await client.media.createFromUrl("https://example.com/image.jpg", {
  name: "Remote Image",
  alt: "Alt text"
});

// Update media metadata
await client.media.update(mediaId, {
  name: "Updated Name",
  alt: "Updated alt text"
});

// Delete media
await client.media.delete(mediaId);
```

### Alerts

```typescript
// Get all alerts
const alerts = await client.alerts.getAlerts();
```

### Forms

```typescript
// Submit form data
const response = await client.forms.submitForm("form-id", {
  name: "John Doe",
  email: "john@example.com",
  message: "Form submission"
});
```

### Instagram

```typescript
// Get latest Instagram posts
const posts = await client.instagram.latest();
```

### Press

```typescript
// Get all press items
const pressItems = await client.press.getPress();

// Get specific press item
const pressItem = await client.press.getPressItem(pressId);

// Create press item
const newPress = await client.press.createPress({
  title: "Press Release Title",
  source: "News Outlet",
  published_at: "2024-01-01T00:00:00Z",
  url: "https://example.com/press-release",
  excerpt: "Press excerpt...",
  content: "Full press content..."
});

// Update press item
await client.press.updatePress(pressId, {
  title: "Updated Title"
});

// Delete press item
await client.press.deletePress(pressId);
```

### Redirects

```typescript
// Get all redirects
const redirects = await client.redirects.getRedirects();
```

### Routes

```typescript
// Resolve route for a path
const route = await client.routes.resolve("/about");
```

### Website

```typescript
// Get all websites
const websites = await client.website.getWebsites();

// Get current website
const website = await client.website.getWebsite();

// Create website
const newWebsite = await client.website.createWebsite({
  app_name: "My App",
  domain: "example.com"
});

// Update website
await client.website.updateWebsite(websiteId, {
  app_name: "Updated App Name"
});

// Get website routes
const routes = await client.website.routes();
```

## Defining Custom Blocks

Blocks are reusable components with type-safe schemas:

```typescript
// Define schema
import { defineBlockSchema, defineField } from "@antlur/backstage/studio";

const fields = [
  defineField({
    name: "Title",
    slug: "title",
    type: "text",
    required: true
  }),
  defineField({
    name: "Image",
    slug: "image",
    type: "image",
    required: true
  }),
  defineField({
    name: "Link",
    slug: "link",
    type: "url"
  })
] as const;

export const schema = defineBlockSchema({
  fields
});

// Component
import type { BlockComponentProps } from "@antlur/backstage/studio";

export default function CustomBlock({ block }: BlockComponentProps<typeof schema>) {
  const { title, image, link } = block.fields;
  
  return (
    <div>
      <img src={image.url} alt={image.alt} />
      <h2>{title}</h2>
      {link && <a href={link}>Learn More</a>}
    </div>
  );
}
```

## Defining Custom Layouts

Layouts define page structures:

```typescript
import { defineLayoutSchema, defineLayoutField } from "@antlur/backstage/studio";

const layoutFields = [
  defineLayoutField({
    name: "Header",
    slug: "header",
    type: "block",
    allowed_blocks: ["hero", "navigation"]
  }),
  defineLayoutField({
    name: "Content",
    slug: "content",
    type: "blocks",
    allowed_blocks: ["text", "image", "gallery"]
  }),
  defineLayoutField({
    name: "Footer",
    slug: "footer",
    type: "block",
    allowed_blocks: ["footer"]
  })
] as const;

export const layoutSchema = defineLayoutSchema({
  fields: layoutFields
});
```

## Defining Blueprints

Blueprints define content types:

```typescript
import { defineBlueprint, defineField } from "@antlur/backstage/studio";

const articleBlueprint = defineBlueprint({
  name: "Article",
  slug: "article",
  fields: [
    defineField({
      name: "Title",
      slug: "title",
      type: "text",
      required: true
    }),
    defineField({
      name: "Content",
      slug: "content",
      type: "richtext",
      required: true
    }),
    defineField({
      name: "Author",
      slug: "author",
      type: "text"
    }),
    defineField({
      name: "Publish Date",
      slug: "publishDate",
      type: "date"
    })
  ]
});
```

## CLI Operations

Use the CLI for syncing definitions:

```bash
# Sync blocks to Backstage
npx backstage sync blocks

# Sync layouts
npx backstage sync layouts

# Sync blueprints
npx backstage sync blueprints

# Sync all
npx backstage sync all
```

## Configuration

Create `backstage.config.ts`:

```typescript
import { defineConfig } from "@antlur/backstage";

export default defineConfig({
  accountId: process.env.BACKSTAGE_ACCOUNT_ID!,
  token: process.env.BACKSTAGE_API_KEY!,
  blocks: [
    // Import your block definitions
    import("./blocks/hero"),
    import("./blocks/text")
  ],
  layouts: [
    import("./layouts/default"),
    import("./layouts/blog")
  ],
  blueprints: [
    import("./blueprints/article"),
    import("./blueprints/event")
  ]
});
```

## React Components

Use provided React components for SEO and structured data:

```tsx
import { PageMeta, JsonLd } from "@antlur/backstage/components";

export default function Page({ page }) {
  return (
    <>
      <PageMeta page={page} />
      <JsonLd type="article" data={page} />
      {/* Page content */}
    </>
  );
}
```

## Error Handling

Always wrap API calls in try-catch:

```typescript
try {
  const pages = await client.pages.getPages();
} catch (error) {
  console.error("Failed to fetch pages:", error);
  // Handle error appropriately
}
```

## Best Practices

1. Use TypeScript for full type safety
2. Validate data before sending to API
3. Handle errors gracefully
4. Use environment variables for sensitive data
5. Sync definitions regularly during development
6. Test components with mock data
7. Use proper field types for better CMS experience

## Common Patterns

### Fetching with Pagination

```typescript
async function getAllPages() {
  const allPages = [];
  let page = 1;
  const perPage = 50;
  
  while (true) {
    const response = await client.pages.getPages({
      page,
      limit: perPage
    });
    
    allPages.push(...response.data);
    
    if (response.data.length < perPage) break;
    page++;
  }
  
  return allPages;
}
```

### Creating Related Content

```typescript
async function createArticleWithMedia(title: string, content: string, imageFile: File) {
  // Upload image first
  const media = await client.media.uploadMedia(imageFile);
  
  // Create article referencing the media
  const article = await client.entries.createEntry({
    blueprint_slug: "article",
    title,
    fields: {
      content,
      featuredImage: media.id
    }
  });
  
  return article;
}
```

This skill covers the core functionality of the @antlur/backstage SDK for comprehensive Backstage CMS data management.
