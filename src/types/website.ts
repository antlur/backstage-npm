import { Navigation } from "./navigation";

export interface SocialLink {
  name: string;
  url: string | null;
}

export interface FontFamily {
  name: string;
  value: string;
}

export interface ThemeColors {
  palette?: Array<{ name: string; value: string }>;
  primary?: string;
  primaryForeground: string;
  secondary?: string;
  secondaryForeground: string;
  tertiary?: string;
  tertiaryForeground: string;
  background?: string;
  foreground: string;
  card?: string;
  cardForeground: string;
  popover?: string;
  popoverForeground: string;
  muted?: string;
  mutedForeground: string;
  accent?: string;
  accentForeground: string;
  destructive?: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  topbar?: string;
  topbarForeground: string;
  header?: string;
  headerForeground: string;
  sidebar?: string;
  sidebarForeground: string;
  sidebarPrimary?: string;
  sidebarPrimaryForeground: string;
  sidebarAccent?: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  footerLocation?: string;
  footerLocationForeground: string;
  footer?: string;
  footerForeground: string;
}

export interface Theme {
  name: string | null;
  colors: ThemeColors;
}

export interface WebsiteMeta {
  title: string | null;
  description: string | null;
}

export interface OpenGraph {
  title: string | null;
  description: string | null;
  image: string | null;
}

export interface Logo {
  url: string;
  width: number;
  height: number;
  thumb: string;
}

export interface Account {
  id: string;
  name: string;
}

export interface Website {
  id: string;
  app_name: string;
  domain: string;
  favicon_url: string | null;
  apple_icon_url: string | null;
  logo: Logo | null;
  account: Account;
  meta: WebsiteMeta;
  open_graph: OpenGraph;
  theme: Theme;
  google_analytics_id: string | null;
  facebook_pixel_id: string | null;
  font_urls: string[] | null;
  font_families: FontFamily[] | null;
  header_navigation_id: string | null;
  footer_navigation_id: string | null;
  header_navigation: Navigation | null;
  footer_navigation: Navigation | null;
  social_links: SocialLink[];
  home_cta_text: string | null;
  home_cta_url: string | null;
}
