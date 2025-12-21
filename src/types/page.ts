import { AccountLayout } from "./account-layout";

export interface Block {
  id: string;
  slug: string;
  data: any;
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
