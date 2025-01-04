import { client } from "../client";
import { ApiCollectionResponse, Press } from "../types";

export async function getPress(): Promise<Press[]> {
  const { data } = await client().get<ApiCollectionResponse<Press>>("/press");
  return data;
}
