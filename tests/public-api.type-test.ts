import { BackstageClient, defineConfig } from "@antlur/backstage";
import { PageService } from "@antlur/backstage/endpoints/pages";
import type { BackstageUserConfig } from "@antlur/backstage/config";
import type { AccountBlock, HeadlessPageBlock, LayoutConfigDefinition, PageBlocksWriteInput, StructuredDataDocument } from "@antlur/backstage";
import type { ResolvedRoute } from "@antlur/backstage/types";

const config: BackstageUserConfig = defineConfig({
  accountId: "account-id",
  baseURL: "https://example.com/api",
  token: "api-token",
  blockManifestDirectory: "src/blocks",
});
const client = new BackstageClient(config);
const pages = new PageService(client);
type AccountBlockId = AccountBlock["id"];
type ResolvedRoutePath = ResolvedRoute["meta"]["path"];

const structuredData: Promise<StructuredDataDocument> = client.structuredData.get();
void structuredData;
void pages.getPages();
void pages.createPage({ title: "About", slug: "/about", website_id: "website-id", parent_id: null });
void pages.updatePage("page-id", { website_id: "website-id", parent_id: null });
const pageBlocks: PageBlocksWriteInput = {
  blocks: [{
    id: "block-id",
    type: "hero",
    variant: "default",
    data: { heading: "Welcome", actions: [{ label: "About", href: "/about" }] },
  }],
};
void pages.createPage({ title: "About", slug: "about", website_id: "website-id", blocks: pageBlocks });
void pages.updatePage("page-id", { blocks: pageBlocks });
const headlessResponseBlock: HeadlessPageBlock = { id: "block-id", type: "hero", variant: null, fields: {} };
// @ts-expect-error Headless response blocks use transformed fields, not raw write data.
const invalidWriteBlocks: PageBlocksWriteInput = { blocks: [headlessResponseBlock] };
void invalidWriteBlocks;
void (null as unknown as AccountBlockId);
void (null as unknown as ResolvedRoutePath);
const pageLayout: LayoutConfigDefinition = {
  manifest_version: 1,
  type: "layout",
  name: "Standard Page",
  slug: "standard-page",
  schema: { fields: [] },
};
void defineConfig({ layouts: [pageLayout] });
void defineConfig({ layouts: [{ name: "Legacy Inline", slug: "legacy-inline", schema: { fields: [] } }] });
void defineConfig({ layouts: [{ name: "Extended Inline", slug: "extended-inline", schema: { fields: [] }, description: "Existing config metadata" }] });

import type { ColorThemeToken, ThemeTokensUpdate, WebsiteThemeTokens } from "@antlur/backstage";
const colorToken: ColorThemeToken = { label: "Action", type: "color", cssVariable: "--theme-color-action", default: "#294C3D" };
const tokenUpdate: ThemeTokensUpdate = { tokens: { action: colorToken }, values: { action: "palette:primary" } };
void client.website.updateWebsite("website-id", { theme_tokens: tokenUpdate });
void defineConfig({ themeTokens: { action: colorToken } });
void (null as unknown as WebsiteThemeTokens);
// @ts-expect-error Theme tokens only support the deployed color type.
const fontToken: ColorThemeToken = { label: "Font", type: "font", cssVariable: "--theme-font-body", default: "#fff" };
void fontToken;
// @ts-expect-error Invalid literal override formats are rejected by the typed update surface.
void client.website.updateWebsite("website-id", { theme_tokens: { values: { action: "red" } } });
