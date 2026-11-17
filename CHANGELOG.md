# Changelog

## 1.22.0 — Unreleased

### Added

- Add typed color-token declarations and website overrides for the deployed headless theme-token API.
- Add `backstage sync theme-tokens` with dry-run support, declaration validation, account-scoped website selection, and idempotent writes that preserve editor overrides. Configured declarations also participate in `backstage sync all`.

## 1.21.0 — 2026-11-16

### Added

- Add `client.structuredData.get()` and the exported `StructuredDataDocument` type for reading the account website's schema.org JSON-LD document. Responses are validated before returning. ([#28](https://github.com/antlur/backstage-npm/pull/28))

### Fixed

- Make block blueprint-reference synchronization idempotent so repeated syncs preserve existing references without unnecessary writes. ([#27](https://github.com/antlur/backstage-npm/pull/27))
