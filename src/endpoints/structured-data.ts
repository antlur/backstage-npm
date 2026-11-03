import type { StructuredDataDocument } from "../types/index.js";
import { BaseService } from "./base.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStructuredDataDocument = (value: unknown): value is StructuredDataDocument => {
  if (!isRecord(value) || value["@context"] !== "https://schema.org") {
    return false;
  }

  if (typeof value["@type"] === "string" && value["@type"].length > 0) {
    return true;
  }

  return Array.isArray(value["@graph"]) && value["@graph"].every(isRecord);
};

export class StructuredDataService extends BaseService {
  /**
   * Account website schema.org JSON-LD.
   * The body is returned as-is. Accounts without a website respond 404.
   */
  async get(options?: RequestInit): Promise<StructuredDataDocument> {
    const response = await this.client.get<unknown>("/structured-data", options);

    if (!isStructuredDataDocument(response)) {
      throw new Error("Backstage returned an invalid structured data document.");
    }

    return response;
  }
}
