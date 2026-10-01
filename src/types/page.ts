import { AccountLayout } from "./account-layout";

export interface Block {
  id: string;
  slug: string;
  data: any;
}

/** Raw block payload accepted by the Pages API when creating or updating a page. */
export interface PageBlockWriteInput {
  id: string;
  type: string;
  data: Record<string, unknown>;
  variant?: string | null;
}

/** Persisted page-block envelope accepted by the Pages API. */
export interface PageBlocksWriteInput {
  blocks: PageBlockWriteInput[];
}

export interface Settings {
  background_color: string;
}

export interface Meta {
  title: string;
  description: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  pathname: string;
  blocks: Block[];
  settings: Settings;
  meta: Meta;
  is_home: boolean;
  layout: AccountLayout | null;
}
