export interface Alert {
  id: string;
  title: string;
  type: string;
  is_global: boolean;
  published: boolean;
  pages: {
    id: string;
    slug: string;
  }[];
}
