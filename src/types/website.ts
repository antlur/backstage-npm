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
  primary?: string;
  primaryForeground: string;
  secondary?: string;
  secondaryForeground: string;
  tertiary?: string;
  tertiaryForeground: string;
  topbar?: string;
  topbarForeground: string;
  header?: string;
  headerForeground: string;
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
  has_accessibility_widget: boolean;
}
