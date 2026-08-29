import { MediaItem } from "./media-item";

export type AlertTargetMode = "all" | "selected";
export type AlertTargetType = "destination" | "path";

export interface AlertPage {
  id: string;
  slug: string;
  path: string;
}

export interface AlertTarget {
  type: AlertTargetType;
  value: string;
  label: string;
  path: string | null;
  resolved: boolean;
}

export interface Alert {
  id: string;
  title: string;
  type: string;
  is_global: boolean;
  published: boolean;
  pages: AlertPage[];
  /** Present on Backstage versions with route-aware alert targeting. */
  target_mode?: AlertTargetMode;
  /** Resolved CMS destinations, generated routes, and exact paths. */
  targets?: AlertTarget[];
  start_at: string | null;
  end_at: string | null;
  media: MediaItem | null;
  content: string | null;
  cta_label: string | null;
  cta_url: string | null;
  analytics_name: string | null;
  analytics_category: string | null;
  analytics_label: string | null;
  position: string | null;
}
