export interface Block {
  id: string;
  block: string;
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
  blocks: Block[];
  settings: Settings;
  meta: Meta;
  is_home: boolean;
}
