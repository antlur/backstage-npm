# Changelog

## 1.21.0 — 2026-11-16

### Added

- Add `client.structuredData.get()` and the exported `StructuredDataDocument` type for reading the account website's schema.org JSON-LD document. Responses are validated before returning. ([#28](https://github.com/antlur/backstage-npm/pull/28))

### Fixed

- Make block blueprint-reference synchronization idempotent so repeated syncs preserve existing references without unnecessary writes. ([#27](https://github.com/antlur/backstage-npm/pull/27))
