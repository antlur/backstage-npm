export type AccountModuleKey =
  | "core.modules"
  | "core.media"
  | "core.change_management"
  | "core.deployments"
  | "cms.site_builder"
  | "cms.custom_blocks"
  | "cms.custom_layouts"
  | "restaurant.menus"
  | "engagement.events"
  | "engagement.press"
  | (string & {});

export interface AccountModule {
  key: AccountModuleKey;
  label: string;
  category: string;
  description: string;
  default_enabled: boolean;
  dependencies: AccountModuleKey[];
  plan_entitlement: string | null;
  active: boolean;
  entitled: boolean;
  enabled: boolean;
}

export const AccountModules = {
  CoreModules: "core.modules",
  CoreMedia: "core.media",
  CoreChangeManagement: "core.change_management",
  CoreDeployments: "core.deployments",
  CmsSiteBuilder: "cms.site_builder",
  CmsCustomBlocks: "cms.custom_blocks",
  CmsCustomLayouts: "cms.custom_layouts",
  RestaurantMenus: "restaurant.menus",
  EngagementEvents: "engagement.events",
  EngagementPress: "engagement.press",
} as const satisfies Record<string, AccountModuleKey>;
