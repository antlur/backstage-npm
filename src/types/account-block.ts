import type { FrontstageBlockDefinition } from "./frontstage";
import type { Field } from "../studio/types/field";

export interface AccountBlockSchema {
  fields?: readonly Field[];
}

export interface AccountBlockFrontstageConfig {
  enabled?: boolean;
  type?: FrontstageBlockDefinition["frontstage"] extends infer T
    ? T extends { type: infer Type }
      ? Type
      : string
    : string;
  defaultVariant?: string;
  variants?: string[];
  category?: string;
}

export interface AccountBlock {
  id: string;
  account_id: string;
  slug: string;
  name: string;
  description?: string | null;
  schema: AccountBlockSchema;
  frontstage?: AccountBlockFrontstageConfig | null;
  created_at: string;
  updated_at: string;
}
