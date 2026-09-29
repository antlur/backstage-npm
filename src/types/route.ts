export interface Route<T = unknown> {
  path: string;
  routeable_type?: string;
  routeable_id?: string | number;
  routeable?: T;
  redirect_path?: string | null;
  [key: string]: unknown;
}

export interface ResolvedRoute<TData = unknown> {
  type: string;
  data: TData;
  meta: {
    id: string | number | null;
    type: string;
    path: string;
    seo?: {
      title?: string | null;
      description?: string | null;
    };
    [key: string]: unknown;
  };
}
