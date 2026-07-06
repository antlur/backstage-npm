export type FrontstageContractVersion = "2026-05-frontstage-v1";

export interface FrontstageImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface FrontstageNavItem {
  label: string;
  href: string;
  variant?: "link" | "button";
}

export type FrontstageThemePreset = "classic-restaurant" | "premium-hospitality" | "fast-casual" | (string & {});
export type FrontstageAlertType = "banner" | "popup";
export type FrontstageAlertPosition = "top" | "bottom" | "center" | "bottom-right";

export interface FrontstageHourRow {
  label: string;
  value: string;
}

export interface FrontstageSpecialHour {
  id?: string;
  date: string;
  label: string;
  title?: string;
  value?: string;
  notes?: string;
}

export interface FrontstageAlert {
  id: string;
  title: string;
  type: FrontstageAlertType;
  position?: FrontstageAlertPosition;
  dismissible: boolean;
  content?: string;
  media?: FrontstageImage;
  cta?: {
    label: string;
    href: string;
  };
  analytics?: {
    name?: string;
    category?: string;
    label?: string;
  };
}

export interface FrontstageBlock<TProps = Record<string, unknown>> {
  id: string;
  type: FrontstageStandardBlockType | string;
  variant?: string;
  props: TProps;
}

export type FrontstageLabelValue = string | { label: string };

export interface FrontstageMenuSectionItem {
  name: string;
  subtitle?: string;
  postTitle?: string;
  description?: string;
  price?: string;
  serves?: string;
  image?: FrontstageImage;
  dietaryTags?: FrontstageLabelValue[];
  prices?: Array<{
    label?: string;
    value: string;
  }>;
}

export interface FrontstageMenuSectionCategory {
  title: string;
  subtitle?: string;
  description?: string;
  afterDescription?: string;
  serves?: string;
  columnCount?: number | string;
  pricingColumns?: FrontstageLabelValue[];
  items?: FrontstageMenuSectionItem[];
}

export interface FrontstageMenuSectionBlockProps {
  eyebrow?: string;
  heading: string;
  body?: string;
  menus?: Array<{
    label: string;
    href: string;
    current?: boolean | string;
  }>;
  pdfUrl?: string;
  pdfLabel?: string;
  items?: FrontstageMenuSectionItem[];
  categories?: FrontstageMenuSectionCategory[];
}

export type FrontstageKnownBlock = FrontstageBlock<FrontstageMenuSectionBlockProps> & { type: "menu-section" };

export type FrontstageStandardBlockType =
  | "hero"
  | "content"
  | "feature-grid"
  | "gallery"
  | "media-feature"
  | "menu-preview"
  | "menu-section"
  | "locations"
  | "hours"
  | "ordering"
  | "cta"
  | "events"
  | "event-spotlight"
  | "private-events"
  | "contact-form"
  | "testimonials"
  | "press"
  | "awards"
  | "reviews"
  | "newsletter"
  | "faq"
  | "html-embed";

export type FrontstageStandardBlockVariant =
  | "default"
  | "full-bleed-image"
  | "background-video"
  | "image-collage"
  | "masonry"
  | "carousel"
  | "editorial-strip"
  | "mixed-media"
  | "full-width"
  | "inline";

export interface FrontstageTheme {
  preset?: FrontstageThemePreset;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    secondary?: string;
    secondaryForeground?: string;
    accent?: string;
    accentForeground?: string;
    topbar?: string;
    topbarForeground?: string;
    header?: string;
    headerForeground?: string;
    footer?: string;
    footerForeground?: string;
    footerLocation?: string;
    footerLocationForeground?: string;
    menuBackground?: string;
    menuForeground?: string;
    menuBorder?: string;
    menuAccent?: string;
    menuAccentForeground?: string;
    menuSelector?: string;
    menuSelectorForeground?: string;
  };
  fonts: {
    heading: FrontstageFont;
    body: FrontstageFont;
  };
  radius: string;
  layout: {
    container: "narrow" | "default" | "wide" | "full";
    header: "default" | "centered-logo" | "split-nav" | "minimal";
    footer: "simple" | "multi-column" | "location-heavy";
  };
}

export interface FrontstageFont {
  source: "system" | "google" | "custom";
  name: string;
  family: string;
}

export interface FrontstageSiteResponse {
  contractVersion: FrontstageContractVersion;
  site: {
    id: string;
    accountId: string;
    name: string;
    baseUrl: string;
    locale: string;
    timezone: string;
    description?: string | null;
    status: "draft" | "published" | "archived";
  };
  brand: {
    logo?: FrontstageImage;
    favicon?: { url: string };
    social?: Record<string, string>;
  };
  contact?: {
    address?: string;
    mapUrl?: string;
    phone?: string;
    email?: string;
    neighborhood?: string;
    hours?: FrontstageHourRow[];
    specialHours?: FrontstageSpecialHour[];
  };
  theme: FrontstageTheme;
  navigation: {
    primary: FrontstageNavItem[];
    footer: FrontstageNavItem[];
  };
  alerts?: FrontstageAlert[];
  integrations?: {
    analytics?: { gtmId?: string };
    ordering?: { provider?: string; url?: string };
    reservations?: { provider?: string; url?: string };
  };
}

export interface FrontstageResolvedLayout {
  id: string | null;
  name: string | null;
  slug: string | null;
  source?: "page" | "site" | "fallback" | "preview" | "override" | null;
  theme?: Partial<FrontstageTheme["layout"]>;
  navigation?: {
    primary?: FrontstageNavItem[];
    footer?: FrontstageNavItem[];
  };
  regions?: {
    beforeHeader?: FrontstageBlock[];
    afterHeader?: FrontstageBlock[];
    beforeMain?: FrontstageBlock[];
    afterMain?: FrontstageBlock[];
    beforeFooter?: FrontstageBlock[];
    footer?: FrontstageBlock[];
    afterFooter?: FrontstageBlock[];
  };
}

export interface FrontstageSeo {
  title: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  image?: FrontstageImage;
}

export interface FrontstagePageResponse {
  contractVersion: FrontstageContractVersion;
  page: {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "published" | "archived";
    seo: FrontstageSeo;
    blocks: FrontstageBlock[];
    layout?: FrontstageResolvedLayout;
    alerts?: FrontstageAlert[];
  };
}

export interface FrontstageRoute {
  id?: string | null;
  path: string;
  slug?: string;
  type?: string | null;
  model?: string | null;
  modelId?: string | null;
  title?: string | null;
  lastModified?: string | null;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export interface FrontstageRoutesResponse {
  routes: FrontstageRoute[];
}

export interface FrontstageBlockDefinition {
  id: string;
  name: string;
  type: FrontstageStandardBlockType | string;
  category: string;
  description: string;
  variants: FrontstageStandardBlockVariant[] | string[];
  fields: unknown[];
  frontstage?: {
    enabled: boolean;
    type: FrontstageStandardBlockType | string;
    defaultVariant?: FrontstageStandardBlockVariant | string;
    variants: FrontstageStandardBlockVariant[] | string[];
    category: string;
  };
}

export interface FrontstageBlocksResponse {
  blocks: FrontstageBlockDefinition[];
}

export interface FrontstagePreviewParams {
  preview?: boolean;
  previewId?: string;
}
