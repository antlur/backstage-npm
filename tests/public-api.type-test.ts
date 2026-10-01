import { BackstageClient, defineConfig } from "@antlur/backstage";
import { PageService } from "@antlur/backstage/endpoints/pages";
import type { BackstageUserConfig } from "@antlur/backstage/config";
import type { AccountBlock, HeadlessPageBlock, PageBlocksWriteInput } from "@antlur/backstage";
import type { ResolvedRoute } from "@antlur/backstage/types";

const config: BackstageUserConfig = defineConfig({
  accountId: "account-id",
  baseURL: "https://example.com/api",
  token: "api-token",
});
const client = new BackstageClient(config);
const pages = new PageService(client);
type AccountBlockId = AccountBlock["id"];
type ResolvedRoutePath = ResolvedRoute["meta"]["path"];

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
