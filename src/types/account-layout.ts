export interface AccountLayout {
  id: string;
  name: string;
  slug: string;
  schema: {
    fields: Array<{
      slug: string;
      name: string;
      type: string;
      [key: string]: any;
    }>;
  };
  data: Record<string, any>;
}
