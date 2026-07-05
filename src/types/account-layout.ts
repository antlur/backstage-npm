import type { Field } from "../studio/types/field";
import type { FrontstageBlock, FrontstageNavItem, FrontstageTheme } from "./frontstage";

export interface AccountLayoutSchema {
  fields: Field[];
  [key: string]: unknown;
}

export interface AccountLayoutValues {
  theme?: Partial<FrontstageTheme["layout"]>;
  navigation?: {
    primary?: FrontstageNavItem[];
    footer?: FrontstageNavItem[];
  };
  regions?: {
    beforeHeader?: FrontstageBlock[];
    afterHeader?: FrontstageBlock[];
    beforeMain?: FrontstageBlock[];
    afterMain?: FrontstageBlock[];
    beforeFooter?: FrontstageBlock[];
    footer?: FrontstageBlock[];
    afterFooter?: FrontstageBlock[];
  };
  [key: string]: unknown;
}

export interface AccountLayout {
  id: string;
  account_id?: string;
  name: string;
  slug: string;
  schema: AccountLayoutSchema;
  values?: AccountLayoutValues;
  data?: AccountLayoutValues;
  created_at?: string;
  updated_at?: string;
}
