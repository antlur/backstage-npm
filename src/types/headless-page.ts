import type { AccountLayout } from "./account-layout.js";

export interface HeadlessPageBlock {
  id: string;
  type: string;
  variant: string | null;
  fields: Record<string, unknown>;
}

export interface HeadlessPageMeta {
  title: string | null;
  description: string | null;
}

/** Page resource shape returned by the existing Pages API in Headless mode. */
export interface HeadlessPage {
  id: string;
  title: string;
  slug: string;
  pathname: string;
  blocks: HeadlessPageBlock[];
  settings: Record<string, unknown> | null;
  is_home: boolean;
  layout: AccountLayout | null;
  meta: HeadlessPageMeta;
}
