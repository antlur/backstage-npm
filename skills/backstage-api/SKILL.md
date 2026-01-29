---
name: backstage-api
description: Comprehensive guide for using the @antlur/backstage SDK to manage all aspects of a Backstage account, including CRUD operations on entries, blocks, layouts, blueprints, pages, locations, menus, media, events, press, websites, routes, forms, and more. Use this skill when working with Backstage CMS API, managing account resources, defining custom components, or syncing content.
metadata:
  short-description: Expert guidance for complete Backstage account management using the @antlur/backstage SDK
---

# Backstage Account Management Skill

This skill provides comprehensive guidance for using the @antlur/backstage TypeScript SDK to interact with Backstage CMS and manage all aspects of a Backstage account. It covers authentication, client usage, full CRUD operations for all resources, custom block/layout/blueprint definitions, and CLI operations.

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

### Authentication & Token Management

```typescript
// Login
const response = await client.auth.login({
  email: "user@example.com",
  password: "password"
});

// Get current user
const user = await client.auth.getUser();

// Create API token (requires full access)
const token = await client.auth.createToken({
  name: "Integration Token",
  abilities: ["*"] // or specific abilities
});

// List API tokens
const tokens = await client.auth.getTokens();

// Revoke API token
await client.auth.revokeToken(tokenId);

// Logout
await client.auth.logout();
```

### Pages

```typescript
// Get all pages
const pages = await client.pages.getPages();

// Get specific page by ID
const page = await client.pages.getPage(pageId);

// Get page by slug
const page = await client.pages.getPageBySlug("about");

// Create page
const newPage = await client.pages.createPage({
  title: "New Page",
  slug: "new-page",
  layout_id: "layout-id",
  blocks: [
    {
      type: "text",
      data: { content: "Page content..." }
    }
  ],
  seo_title: "SEO Title",
  seo_description: "SEO Description",
  is_published: false
});

// Update page
await client.pages.updatePage(pageId, {
  title: "Updated Title",
  blocks: [...]
});

// Delete page
await client.pages.deletePage(pageId);
```

### Entries (Content Items)

```typescript
// Get all entries
const entries = await client.entries.getEntries();

// Get specific entry by ID
const entry = await client.entries.getEntry(entryId);

// Get entries by collection/blueprint slug
const articles = await client.entries.getCollection("article");

// Create entry
const newEntry = await client.entries.createEntry({
  blueprint_id: "article-blueprint-id",
  data: {
    title: "My Article",
    content: "Article content...",
    author: "John Doe",
    published_at: "2024-01-15"
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

### Blueprints (Content Types)

```typescript
// Get all blueprints
const blueprints = await client.blueprints.getBlueprints();

// Get specific blueprint by ID
const blueprint = await client.blueprints.getBlueprint(blueprintId);

// Get blueprint by slug
const articleBlueprint = await client.blueprints.getBlueprintBySlug("article");

// Create blueprint
const newBlueprint = await client.blueprints.createBlueprint({
  name: "Article",
  slug: "article",
  description: "Blog article content type",
  fields: [
    {
      name: "Title",
      slug: "title",
      type: "text",
      required: true
    },
    {
      name: "Content",
      slug: "content",
      type: "richtext",
      required: true
    },
    {
      name: "Author",
      slug: "author",
      type: "text"
    },
    {
      name: "Published Date",
      slug: "published_date",
      type: "date"
    }
  ]
});

// Update blueprint
await client.blueprints.updateBlueprint(blueprintId, {
  name: "Updated Name",
  fields: [...]
});

// Delete blueprint
await client.blueprints.deleteBlueprint(blueprintId);
```

### Locations (Restaurant/Hospitality Venues)

Use locations to represent restaurant, bar, and hospitality venues. Locations support rich operational details like hours, special hours, and ordering/reservation links.

```typescript
// Get all locations
const locations = await client.locations.getLocations();

// Get specific location by ID
const location = await client.locations.getLocation(locationId);

// Get location by slug
const downtownLocation = await client.locations.getLocationBySlug("downtown-cafe");

// Create location
const newLocation = await client.locations.createLocation({
  name: "Downtown Cafe",
  address: "123 Main St",
  city: "Anytown",
  state: "CA",
  zip: "12345",
  slug: "downtown-cafe",
  phone: "+1-555-0100",
  timezone: "America/Los_Angeles",
  hours: [
    { day: "monday", open: "09:00", close: "22:00" },
    { day: "tuesday", open: "09:00", close: "22:00" }
  ],
  special_hours: [
    { date: "2026-12-25", closed: true, label: "Christmas" }
  ],
  reservation_links: [
    { label: "OpenTable", url: "https://opentable.example.com" }
  ],
  ordering_links: [
    { label: "Online Ordering", url: "https://order.example.com" }
  ],
  latitude: 40.7128,
  longitude: -74.0060,
  custom_fields: { neighborhood: "Downtown" }
});

// Update location
await client.locations.updateLocation(locationId, {
  name: "Updated Cafe Name",
  phone: "+1-555-0101",
  description: "Cozy neighborhood cafe",
  map_link: "https://maps.google.com/?q=123+Main+St"
});

// Delete location
await client.locations.deleteLocation(locationId);
```

### Events

```typescript
// Get all events
const events = await client.events.getEvents();

// Get event by ID
const event = await client.events.getEvent(eventId);

// Get event by slug
const eventBySlug = await client.events.getEventBySlug("summer-festival");

// Create event
const newEvent = await client.events.createEvent({
  title: "Summer Festival",
  slug: "summer-festival",
  start_time: "2024-07-01T10:00:00Z",
  end_time: "2024-07-01T18:00:00Z",
  timezone: "America/New_York",
  short_description: "Annual summer festival",
  description: "Full event description...",
  location_id: "location-id",
  is_featured: true
});

// Update event
await client.events.updateEvent(eventId, {
  title: "Updated Event Title",
  description: "Updated description"
});

// Delete event
await client.events.deleteEvent(eventId);
```

### Menus (Restaurant/Food Menus)

Menus represent restaurant, bar, or hospitality menus. Fetching a menu by ID or slug includes categories and items.

```typescript
// Get all menus
const menus = await client.menus.getMenus();

// Get menu by ID (includes categories and items)
const menu = await client.menus.getMenu(menuId);

// Get menu by slug (includes categories and items)
const diningMenu = await client.menus.getMenuBySlug("dinner-menu");

// Create menu (e.g., breakfast, lunch, dinner, drinks, desserts)
const newMenu = await client.menus.createMenu({
  title: "Dinner Menu",
  slug: "dinner-menu",
  subtitle: "Evening dining",
  is_default: false
});

// Update menu
await client.menus.updateMenu(menuId, {
  title: "Updated Menu Name",
  subtitle: "Seasonal favorites"
});

// Delete menu
await client.menus.deleteMenu(menuId);
```

### Menu Items (Food/Drink Items)

Menu items represent individual dishes, drinks, or menu entries for restaurants and bars.

```typescript
// List all menu items
const menuItems = await client.menuItems.list();

// Get menu item by ID
const menuItem = await client.menuItems.get(menuItemId);

// Create menu item (e.g., dish or drink)
const newMenuItem = await client.menuItems.create({
  title: "Grilled Salmon",
  subtitle: "Seasonal vegetables",
  description: "Fresh Atlantic salmon with lemon butter sauce",
  price: "24.99",
  price_type: "usd",
  has_multiple_prices: false,
  has_hidden_price: false,
  dietary_tags: ["gluten-free"],
  image_id: 123
});

// Create menu item with multiple prices
const multiPriceItem = await client.menuItems.create({
  title: "House Wine",
  prices: [
    { label: "Glass", price: "9" },
    { label: "Bottle", price: "32" }
  ],
  has_multiple_prices: true
});

// Update menu item
await client.menuItems.update(menuItemId, {
  title: "Pan-Seared Salmon",
  price: "26.99",
  description: "Updated preparation method"
});

// Delete menu item
await client.menuItems.delete(menuItemId);
```

### Blocks (Reusable Components)

```typescript
// Get all custom blocks
const blocks = await client.blocks.getBlocks();

// Get block by ID
const block = await client.blocks.getBlock(blockId);

// Create custom block
const newBlock = await client.blocks.createBlock({
  name: "Hero Section",
  slug: "hero-section",
  type: "custom",
  description: "Large hero banner block",
  schema: {
    title: { type: "string", required: true },
    subtitle: { type: "string" },
    image: { type: "image", required: true },
    cta_text: { type: "string" },
    cta_url: { type: "url" }
  }
});

// Update block
await client.blocks.updateBlock(blockId, {
  name: "Updated Block Name",
  schema: {...}
});

// Delete block
await client.blocks.deleteBlock(blockId);
```

### Layouts (Page Templates)

```typescript
// Get all layouts
const layouts = await client.layouts.getLayouts();

// Get layout by ID
const layout = await client.layouts.getLayout(layoutId);

// Create layout
const newLayout = await client.layouts.createLayout({
  name: "Blog Post Layout",
  slug: "blog-post",
  description: "Standard blog post layout",
  sections: [
    {
      name: "Header",
      slug: "header",
      type: "block",
      allowed_blocks: ["header", "hero"]
    },
    {
      name: "Content",
      slug: "content",
      type: "blocks",
      allowed_blocks: ["text", "image", "quote"]
    },
    {
      name: "Sidebar",
      slug: "sidebar",
      type: "blocks",
      allowed_blocks: ["related-posts", "newsletter"]
    },
    {
      name: "Footer",
      slug: "footer",
      type: "block",
      allowed_blocks: ["footer"]
    }
  ]
});

// Update layout
await client.layouts.updateLayout(layoutId, {
  name: "Updated Layout Name",
  sections: [...]
});

// Delete layout
await client.layouts.deleteLayout(layoutId);
```

### Media Management

```typescript
// Get all media files
const media = await client.media.getMedia();

// Get specific media by ID
const mediaItem = await client.media.getMedia(mediaId);

// Upload media file
const uploadedMedia = await client.media.upload(file, {
  name: "image.jpg",
  alt: "Alt text",
  title: "Image title"
});

// Upload media to /media/upload endpoint
const uploadedMedia = await client.media.upload(file);

// Create media from URL
const mediaFromUrl = await client.media.createFromUrl("https://example.com/image.jpg", {
  name: "Remote Image",
  alt: "Alt text"
});

// Update media metadata
await client.media.updateMedia(mediaId, {
  name: "Updated Name",
  alt: "Updated alt text",
  title: "Updated title"
});

// Delete media
await client.media.deleteMedia(mediaId);
```

### Instagram Integration

```typescript
// Get latest Instagram posts
const posts = await client.instagram.getLatestPosts();

// Get Instagram posts with limit
const posts = await client.instagram.getLatestPosts({ limit: 10 });
```

### Press Releases

```typescript
// Get all press items
const pressItems = await client.press.getPress();

// Get specific press item by ID
const pressItem = await client.press.getPress(pressId);

// Create press item
const newPress = await client.press.createPress({
  title: "Press Release Title",
  slug: "press-release-title",
  source: "News Outlet",
  published_at: "2024-01-01T00:00:00Z",
  url: "https://example.com/press-release",
  excerpt: "Press excerpt...",
  content: "Full press content...",
  is_featured: false
});

// Update press item
await client.press.updatePress(pressId, {
  title: "Updated Title",
  content: "Updated content"
});

// Delete press item
await client.press.deletePress(pressId);
```

### Websites

```typescript
// Get all websites for account
const websites = await client.websites.getWebsites();

// Get specific website by ID
const website = await client.websites.getWebsite(websiteId);

// Create website
const newWebsite = await client.websites.createWebsite({
  app_name: "My App",
  domain: "example.com",
  description: "Website description"
});

// Update website
await client.websites.updateWebsite(websiteId, {
  app_name: "Updated App Name",
  domain: "newdomain.com"
});

// Get website routes/pages
const routes = await client.websites.getRoutes(websiteId);
```

### Navigations

```typescript
// List navigations (shallow)
const navigations = await client.navigations.list();

// Get navigation by ID (raw)
const navigation = await client.navigations.getById(navigationId);

// Get navigation with tree-structured items
const navigationTree = await client.navigations.getNavigation(navigationId);

// Create navigation
const newNavigation = await client.navigations.createNavigation({
  name: "Main Navigation",
  items: [
    { title: "Home", url: "/", parent_id: null },
    { title: "Menu", url: "/menu", parent_id: null },
    { title: "Dinner", url: "/menu/dinner", parent_id: null }
  ]
});

// Update navigation
const updatedNavigation = await client.navigations.updateNavigation(navigationId, {
  name: "Primary Navigation",
  items: [
    { title: "Reservations", url: "/reservations", parent_id: null }
  ]
});

// Get all navigations with full items
const fullNavigations = await client.navigations.getNavigations();

// Get default navigation (first in list)
const defaultNavigation = await client.navigations.getDefaultNavigation();
```

### Routes & URL Resolution

```typescript
// Resolve a route/path
const route = await client.routes.resolve("/about");

// Returns route information including:
// - page_id, entry_id
// - type (page, entry)
// - slug
// - seo data
```

### Redirects

```typescript
// Get all redirects
const redirects = await client.redirects.getRedirects();
```

### Alerts

```typescript
// Get all account alerts
const alerts = await client.alerts.getAlerts();
```

### Forms & Submissions

```typescript
// Submit form (public endpoint, no auth required)
const response = await client.forms.submitForm("form-id", {
  name: "John Doe",
  email: "john@example.com",
  message: "Form submission",
  phone: "+1-555-0100"
});

// Form is submitted to: POST /wa/forms/{form}
```

## Account Management Patterns

### Complete Account Setup

```typescript
// 1. Initialize client
const client = new BackstageClient({
  token: process.env.BACKSTAGE_API_KEY,
  accountId: process.env.BACKSTAGE_ACCOUNT_ID,
  baseURL: process.env.BACKSTAGE_API_URL,
});

// 2. Get current user and account info
const user = await client.auth.getUser();
const websites = await client.websites.getWebsites();

// 3. Create content blueprints
const articleBlueprintId = (await client.blueprints.createBlueprint({
  name: "Article",
  slug: "article",
  fields: [...]
})).id;

// 4. Create layout templates
const blogLayout = await client.layouts.createLayout({
  name: "Blog Post",
  slug: "blog-post",
  sections: [...]
});

// 5. Create custom blocks
const heroBlock = await client.blocks.createBlock({
  name: "Hero",
  slug: "hero",
  schema: {...}
});

// 6. Set up navigation
const mainMenu = await client.menus.createMenu({
  title: "Main Menu",
  slug: "main-menu",
  is_default: true
});

await client.menuItems.createMenuItem({
  menu_id: mainMenu.id,
  label: "Home",
  url: "/",
  order: 1
});

// 7. Create initial pages
const homePage = await client.pages.createPage({
  title: "Home",
  slug: "/",
  layout_id: blogLayout.id
});

// 8. Create restaurant/venue locations
const location = await client.locations.createLocation({
  name: "Downtown Location",
  address: "123 Main St",
  city: "Anytown",
  state: "CA",
  zip: "12345",
  phone: "+1-555-0100",
  hours: "11AM-10PM",
  is_default: true
});

// 9. Create restaurant menus
const dinnerMenu = await client.menus.createMenu({
  title: "Dinner Menu",
  slug: "dinner-menu",
  is_default: true
});

// 10. Add menu items (dishes/drinks)
await client.menuItems.createMenuItem({
  menu_id: dinnerMenu.id,
  label: "House Special",
  price: 16.99,
  order: 1
});
```

### Media Management Workflow

```typescript
// Upload multiple media files
async function uploadMediaLibrary(files: File[]) {
  const uploaded = [];
  for (const file of files) {
    const media = await client.media.upload(file, {
      name: file.name,
      alt: file.name
    });
    uploaded.push(media);
  }
  return uploaded;
}

// Create content with featured media
async function createArticleWithFeaturedImage(
  title: string,
  content: string,
  imageFile: File
) {
  const image = await client.media.upload(imageFile);
  
  const article = await client.entries.createEntry({
    blueprint_id: "article-blueprint-id",
    data: {
      title,
      content,
      featured_image: image.id
    }
  });
  
  return article;
}
```

### Content Hierarchy Management

```typescript
// Organize entries by collection
async function getAllArticles() {
  return client.entries.getCollection("article");
}

async function getAllEvents() {
  return client.entries.getCollection("event");
}

async function getAllPressReleases() {
  return client.entries.getCollection("press");
}

// Navigate page hierarchy
async function getNavigationStructure(menuSlug: string) {
  const menu = await client.menus.getMenuBySlug(menuSlug);
  const items = await client.menuItems.getMenuItems();
  
  // Build tree structure for navigation
  const buildTree = (items, parentId = null) => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id)
      }));
  };
  
  return buildTree(items);
}
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

Blueprints define content types and their available fields:

```typescript
import { defineBlueprint, defineField } from "@antlur/backstage/studio";

// Article Blueprint
const articleBlueprint = defineBlueprint({
  name: "Article",
  slug: "article",
  description: "Blog article content type",
  fields: [
    defineField({
      name: "Title",
      slug: "title",
      type: "text",
      required: true
    }),
    defineField({
      name: "Slug",
      slug: "slug",
      type: "slug",
      source_field: "title",
      required: true
    }),
    defineField({
      name: "Content",
      slug: "content",
      type: "richtext",
      required: true
    }),
    defineField({
      name: "Excerpt",
      slug: "excerpt",
      type: "textarea"
    }),
    defineField({
      name: "Featured Image",
      slug: "featured_image",
      type: "image",
      required: true
    }),
    defineField({
      name: "Author",
      slug: "author",
      type: "text"
    }),
    defineField({
      name: "Publish Date",
      slug: "publish_date",
      type: "date",
      required: true
    }),
    defineField({
      name: "Categories",
      slug: "categories",
      type: "select",
      options: ["Technology", "Business", "Lifestyle"]
    }),
    defineField({
      name: "Tags",
      slug: "tags",
      type: "text"
    }),
    defineField({
      name: "SEO Title",
      slug: "seo_title",
      type: "text"
    }),
    defineField({
      name: "SEO Description",
      slug: "seo_description",
      type: "textarea"
    })
  ]
});

// Event Blueprint
const eventBlueprint = defineBlueprint({
  name: "Event",
  slug: "event",
  fields: [
    defineField({
      name: "Title",
      slug: "title",
      type: "text",
      required: true
    }),
    defineField({
      name: "Description",
      slug: "description",
      type: "richtext",
      required: true
    }),
    defineField({
      name: "Start Date/Time",
      slug: "start_time",
      type: "datetime",
      required: true
    }),
    defineField({
      name: "End Date/Time",
      slug: "end_time",
      type: "datetime",
      required: true
    }),
    defineField({
      name: "Location",
      slug: "location",
      type: "relation",
      target_blueprint: "location"
    }),
    defineField({
      name: "Image",
      slug: "image",
      type: "image"
    })
  ]
});

// Product Blueprint
const productBlueprint = defineBlueprint({
  name: "Product",
  slug: "product",
  fields: [
    defineField({
      name: "Name",
      slug: "name",
      type: "text",
      required: true
    }),
    defineField({
      name: "Description",
      slug: "description",
      type: "richtext",
      required: true
    }),
    defineField({
      name: "Price",
      slug: "price",
      type: "number",
      required: true
    }),
    defineField({
      name: "Images",
      slug: "images",
      type: "gallery"
    }),
    defineField({
      name: "Category",
      slug: "category",
      type: "select",
      options: ["Electronics", "Clothing", "Food", "Other"]
    }),
    defineField({
      name: "In Stock",
      slug: "in_stock",
      type: "boolean",
      default: true
    })
  ]
});
```

## Supported Field Types

| Type | Description | Use Case |
|------|-------------|----------|
| `text` | Single-line text input | Titles, names, headings |
| `textarea` | Multi-line text | Excerpts, descriptions |
| `richtext` | WYSIWYG editor | Articles, detailed content |
| `slug` | URL-friendly identifier | Page slugs, entry identifiers |
| `image` | Single image upload | Featured image, thumbnail |
| `gallery` | Multiple images | Photo galleries, portfolios |
| `date` | Date picker | Event dates, publish dates |
| `datetime` | Date and time picker | Event start/end times |
| `time` | Time picker | Opening hours, event times |
| `number` | Numeric input | Prices, quantities, counts |
| `boolean` | Yes/no toggle | Published status, featured flag |
| `select` | Dropdown selection | Categories, statuses |
| `multiselect` | Multiple select | Tags, skills |
| `relation` | Link to other entries | Related articles, events |
| `url` | URL input with validation | External links, CTAs |
| `email` | Email input | Contact email |
| `color` | Color picker | Brand colors, themes |
| `json` | JSON editor | Structured data, custom data |

## CLI Operations

The Backstage CLI provides commands for syncing definitions to the API:

```bash
# Authenticate with Backstage
npx backstage login

# Sync specific resources
npx backstage sync blocks        # Sync block definitions
npx backstage sync layouts       # Sync layout templates
npx backstage sync blueprints    # Sync content type blueprints
npx backstage sync all           # Sync all definitions

# Sync from specific file
npx backstage sync blocks --file src/blocks/custom-block.ts

# Generate TypeScript types
npx backstage generate types     # Generate SDK types from your definitions

# Pull remote definitions locally
npx backstage pull blocks        # Pull blocks from account
npx backstage pull layouts       # Pull layouts from account
npx backstage pull blueprints    # Pull blueprints from account

# Watch mode for development
npx backstage sync --watch       # Auto-sync on file changes
```

## Configuration

Create `backstage.config.ts` in your project root:

```typescript
import { defineConfig } from "@antlur/backstage";

export default defineConfig({
  accountId: process.env.BACKSTAGE_ACCOUNT_ID!,
  token: process.env.BACKSTAGE_API_KEY!,
  apiUrl: process.env.BACKSTAGE_API_URL || "https://bckstg.app/api",
  
  // Define your blocks
  blocks: [
    {
      name: "Hero",
      slug: "hero",
      path: "./src/blocks/hero.ts"
    },
    {
      name: "Text",
      slug: "text",
      path: "./src/blocks/text.ts"
    }
  ],
  
  // Define your layouts
  layouts: [
    {
      name: "Default",
      slug: "default",
      path: "./src/layouts/default.ts"
    },
    {
      name: "Blog",
      slug: "blog",
      path: "./src/layouts/blog.ts"
    }
  ],
  
  // Define your blueprints
  blueprints: [
    {
      name: "Article",
      slug: "article",
      path: "./src/blueprints/article.ts"
    },
    {
      name: "Event",
      slug: "event",
      path: "./src/blueprints/event.ts"
    }
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

## Permission Abilities

The API uses ability-based permission middleware. Common abilities:

| Ability | Purpose |
|---------|---------|
| `read` | Read access to resources |
| `create` | Create new resources |
| `update` | Update existing resources |
| `delete` | Delete resources |
| `*` | Full access (all abilities) |

Token management requires `*` (full access).

## Common Patterns

### Fetching with Pagination

```typescript
async function getAllPages(perPage = 50) {
  const allPages = [];
  let page = 1;
  
  while (true) {
    const response = await client.pages.getPages({
      page,
      limit: perPage
    });
    
    if (!response || response.length === 0) break;
    
    allPages.push(...response);
    
    if (response.length < perPage) break;
    page++;
  }
  
  return allPages;
}

async function getAllEntries(perPage = 50) {
  const allEntries = [];
  let page = 1;
  
  while (true) {
    const response = await client.entries.getEntries({
      page,
      limit: perPage
    });
    
    if (!response || response.length === 0) break;
    
    allEntries.push(...response);
    
    if (response.length < perPage) break;
    page++;
  }
  
  return allEntries;
}
```

### Creating Related Content

```typescript
// Create an article with featured image and location
async function createFullArticle(
  title: string,
  content: string,
  imageFile: File,
  locationId: string
) {
  // 1. Upload featured image
  const image = await client.media.upload(imageFile, {
    name: `Featured: ${title}`,
    alt: title
  });
  
  // 2. Create the article entry
  const article = await client.entries.createEntry({
    blueprint_id: "article-blueprint-id",
    data: {
      title,
      content,
      featured_image: image.id,
      location_id: locationId,
      status: "published"
    },
    seo: {
      title: title,
      description: content.substring(0, 160)
    }
  });
  
  return article;
}

// Create event with location and media gallery
async function createEventWithGallery(
  title: string,
  startTime: string,
  endTime: string,
  locationId: string,
  galleryFiles: File[]
) {
  // Upload all gallery images
  const gallery = await Promise.all(
    galleryFiles.map(file =>
      client.media.upload(file, {
        name: file.name,
        alt: `${title} - ${file.name}`
      })
    )
  );
  
  // Create event
  const event = await client.events.createEvent({
    title,
    slug: title.toLowerCase().replace(/\s+/g, "-"),
    start_time: startTime,
    end_time: endTime,
    location_id: locationId,
    gallery_ids: gallery.map(g => g.id)
  });
  
  return event;
}
```

### Managing Restaurant Menus

```typescript
// Create complete restaurant menu structure
async function createRestaurantMenus() {
  // Create breakfast menu
  const breakfastMenu = await client.menus.createMenu({
    title: "Breakfast",
    slug: "breakfast",
    is_default: false
  });
  
  // Add breakfast items
  await client.menuItems.createMenuItem({
    menu_id: breakfastMenu.id,
    label: "Pancakes",
    price: 12.99,
    order: 1
  });
  
  // Create lunch menu
  const lunchMenu = await client.menus.createMenu({
    title: "Lunch",
    slug: "lunch",
    is_default: true
  });
  
  // Create dinner menu
  const dinnerMenu = await client.menus.createMenu({
    title: "Dinner",
    slug: "dinner",
    is_default: false
  });
  
  // Add categories as parent items
  const appetizerSection = await client.menuItems.createMenuItem({
    menu_id: dinnerMenu.id,
    label: "Appetizers",
    order: 1,
    parent_id: null
  });
  
  // Add items under category
  const wings = await client.menuItems.createMenuItem({
    menu_id: dinnerMenu.id,
    label: "Buffalo Wings",
    price: 8.99,
    order: 1,
    parent_id: appetizerSection.id
  });
  
  return { breakfastMenu, lunchMenu, dinnerMenu };
}

// Update menu prices in bulk
async function updateMenuPrices(menuId: string, priceMultiplier: number) {
  const items = await client.menuItems.getMenuItems();
  const menuItems = items.filter(item => item.menu_id === menuId);
  
  const results = await Promise.allSettled(
    menuItems.map(item =>
      client.menuItems.updateMenuItem(item.id, {
        price: (item.price || 0) * priceMultiplier
      })
    )
  );
  
  return results;
}

// Get menu for display on website
async function getMenuForDisplay(menuSlug: string) {
  const menu = await client.menus.getMenuBySlug(menuSlug);
  const allItems = await client.menuItems.getMenuItems();
  
  // Organize items by category
  const organizeItems = (items, parentId = null) => {
    return items
      .filter(item => item.menu_id === menu.id && item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: organizeItems(items, item.id)
      }));
  };
  
  return {
    menu,
    items: organizeItems(allItems)
  };
}
```

### Content Syndication

```typescript
// Publish article to multiple locations
async function publishToMultipleLocations(
  articleId: string,
  locationIds: string[]
) {
  const article = await client.entries.getEntry(articleId);
  
  for (const locationId of locationIds) {
    // Create variation per location
    const articleEntry = await client.entries.createEntry({
      blueprint_id: article.blueprint_id,
      data: {
        ...article.data,
        location_id: locationId
      },
      status: article.status
    });
  }
}

// Clone article with new slug
async function cloneArticle(sourceArticleId: string, newSlug: string) {
  const source = await client.entries.getEntry(sourceArticleId);
  
  const cloned = await client.entries.createEntry({
    blueprint_id: source.blueprint_id,
    data: {
      ...source.data,
      slug: newSlug
    },
    status: "draft"
  });
  
  return cloned;
}
```

### Batch Operations

```typescript
// Delete all entries of a specific blueprint
async function deleteAllEntriesOfType(blueprintSlug: string) {
  const entries = await client.entries.getCollection(blueprintSlug);
  
  const results = await Promise.allSettled(
    entries.map(entry => client.entries.deleteEntry(entry.id))
  );
  
  const successful = results.filter(r => r.status === "fulfilled").length;
  const failed = results.filter(r => r.status === "rejected").length;
  
  console.log(`Deleted ${successful}, Failed ${failed}`);
}

// Update multiple pages at once
async function updatePagesMetadata(pageIds: string[], newSeo: any) {
  const results = await Promise.allSettled(
    pageIds.map(id =>
      client.pages.updatePage(id, {
        seo_title: newSeo.title,
        seo_description: newSeo.description
      })
    )
  );
  
  return results;
}

// Publish all draft entries
async function publishAllDraftEntries() {
  const entries = await client.entries.getEntries();
  const drafts = entries.filter(e => e.status === "draft");
  
  const results = await Promise.allSettled(
    drafts.map(entry =>
      client.entries.updateEntry(entry.id, {
        status: "published"
      })
    )
  );
  
  return results;
}
```

### Import/Export

```typescript
// Export all content as JSON
async function exportAccount() {
  const [pages, entries, locations, menus, media, events] = await Promise.all([
    client.pages.getPages(),
    client.entries.getEntries(),
    client.locations.getLocations(),
    client.menus.getMenus(),
    client.media.getMedia(),
    client.events.getEvents()
  ]);
  
  return {
    exportDate: new Date().toISOString(),
    pages,
    entries,
    locations,
    menus,
    media,
    events
  };
}

// Write export to file
import { writeFileSync } from "fs";

async function backupAccount() {
  const data = await exportAccount();
  writeFileSync(
    `backup-${Date.now()}.json`,
    JSON.stringify(data, null, 2)
  );
}
```

## Complete Account Resource Reference

### All Available Resources

| Resource | Endpoint | CRUD Operations | Description |
|----------|----------|-----------------|-------------|
| **Pages** | `/pages` | ✅ Create, Read, Update, Delete | Website pages with layouts and blocks |
| **Entries** | `/entries` | ✅ Create, Read, Update, Delete | Content items based on blueprints |
| **Blueprints** | `/blueprints` | ✅ Create, Read, Update, Delete | Content type definitions |
| **Locations** | `/locations` | ✅ Create, Read, Update, Delete | Physical restaurant, bar, and hospitality venues |
| **Menus** | `/menus` | ✅ Create, Read, Update, Delete | Restaurant/hospitality food and drink menus |
| **Menu Items** | `/menu-items` | ✅ Create, Read, Update, Delete | Food and drink items within menus |
| **Events** | `/events` | ✅ Create, Read, Update, Delete | Event listings |
| **Blocks** | `/blocks` | ✅ Create, Read, Update, Delete | Custom reusable block components |
| **Layouts** | `/layouts` | ✅ Create, Read, Update, Delete | Page template structures |
| **Media** | `/media` | ✅ Create, Read, Update, Delete | Images and file uploads |
| **Press** | `/press` | ✅ Create, Read, Update, Delete | Press releases and news |
| **Websites** | `/websites` | ✅ Create, Read, Update | Website configurations |
| **Navigations** | `/navigations` | ✅ Read | Navigation structures |
| **Routes** | `/routes` | ✅ Resolve | URL path resolution |
| **Redirects** | `/redirects` | ✅ Read | URL redirects |
| **Alerts** | `/alerts` | ✅ Read | Account notifications |
| **Forms** | `/wa/forms/{form}` | ✅ Submit | Public form submissions |
| **Instagram** | `/instagram-posts` | ✅ Read | Instagram media feed |
| **Auth** | `/login`, `/logout`, `/user`, `/tokens` | ✅ Full | Authentication and token management |

### Collection/Group Operations

```typescript
// Get entries by collection/blueprint
const articles = await client.entries.getCollection("article");
const events = await client.entries.getCollection("event");
const products = await client.entries.getCollection("product");

// Get website-specific routes
const routes = await client.websites.getRoutes(websiteId);
```

## Troubleshooting & Best Practices

### Error Handling

```typescript
try {
  const pages = await client.pages.getPages();
} catch (error) {
  if (error.status === 401) {
    console.error("Authentication failed - check API key");
  } else if (error.status === 403) {
    console.error("Permission denied - check token abilities");
  } else if (error.status === 404) {
    console.error("Resource not found");
  } else {
    console.error("API error:", error.message);
  }
}
```

### Rate Limiting

Backstage API may implement rate limiting. Handle it gracefully:

```typescript
async function withRetry(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        // Rate limited, wait and retry
        const delay = Math.pow(2, i) * 1000; // exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Usage
const pages = await withRetry(() => client.pages.getPages());
```

## Best Practices

1. **Always use TypeScript** for full type safety and IDE autocomplete
2. **Validate data before sending** to catch issues early
3. **Handle errors gracefully** with try-catch blocks
4. **Use environment variables** for sensitive data (API keys, tokens)
5. **Sync definitions regularly** during development with CLI
6. **Test with mock data** before deploying to production
7. **Use proper field types** for better CMS editor experience
8. **Implement pagination** for large data sets
9. **Cache frequently accessed data** to reduce API calls
10. **Monitor API quota** when doing batch operations
11. **Use meaningful slugs** for SEO and URL structure
12. **Version your blueprints** to handle schema changes
13. **Document custom blueprints** and field purposes
14. **Test all abilities** when creating tokens for integrations
15. **Back up content regularly** using export functionality

## Response Structure

Most API endpoints return paginated responses:

```typescript
interface ApiResponse<T> {
  data: T[];
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  meta?: {
    timestamp: string;
    version: string;
  };
}
```

## Field Validation Examples

```typescript
// Valid text field
{ type: "text", value: "Hello World", required: true }

// Valid relation field
{ type: "relation", value: "entry-id-123" }

// Valid date field
{ type: "date", value: "2024-01-15" }

// Valid richtext field
{ type: "richtext", value: "<p>HTML content</p>" }

// Valid gallery field (array of media IDs)
{ type: "gallery", value: ["media-1", "media-2", "media-3"] }
```

This skill now covers all functionality of the @antlur/backstage SDK for complete Backstage account management including content, media, configuration, and automation across all available API endpoints.
