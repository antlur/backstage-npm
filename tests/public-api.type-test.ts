import { BackstageClient, defineConfig } from "@antlur/backstage";
import { PageService } from "@antlur/backstage/endpoints/pages";
import type { BackstageUserConfig } from "@antlur/backstage/config";
import type { AccountBlock } from "@antlur/backstage/types";

const config: BackstageUserConfig = defineConfig({
  accountId: "account-id",
  baseURL: "https://example.com/api",
  token: "api-token",
});
const client = new BackstageClient(config);
const pages = new PageService(client);
type AccountBlockId = AccountBlock["id"];

void pages.getPages();
void (null as unknown as AccountBlockId);
