import type { Graph, Thing, WithContext } from "schema-dts";

/**
 * schema.org JSON-LD document from GET /structured-data.
 * The response body is the document itself, not an envelope with `data`.
 */
export type StructuredDataDocument = WithContext<Thing> | Graph;
