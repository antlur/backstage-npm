import { client } from "../client";
import { ApiCollectionResponse, Website } from "../types";

export async function getWebsite(): Promise<Website> {
  const res = await client().get<ApiCollectionResponse<Website>>("/websites");
  return res.data[0];
}
