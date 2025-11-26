export interface Route<T = unknown> {
  path: string;
  routeable_type?: string;
  routeable_id?: string | number;
  routeable?: T;
  redirect_path?: string | null;
  [key: string]: unknown;
}
