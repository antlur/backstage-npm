import { client } from "../client";
import { ApiCollectionResponse, Alert } from "../types";

export async function getAlerts() {
  const { data } = await client().get<ApiCollectionResponse<Alert>>("/alerts");
  return data;
}
