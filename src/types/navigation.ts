export interface NavigationItem {
  id: string;
  text: string;
  url: string;
  html: string;
  new_window: boolean;
  type: string;
  style: string;
  parent_id: string;
  children: NavigationItem[];
}

export interface Navigation {
  id: string;
  name: string;
  items: NavigationItem[];
}
