---
changelogVersion: 1
plugin: "visduo_endpoint-restriction"
version: "1.0.1"
locale: "en"
translations:
  zh-CN: CHANGELOG.zh-CN.md
---
# Changelog

## [1.0.1]

### Changed

- Standardized the plugin name.

## [1.0.0]

### Added

- Restrict a model to selected endpoint types with exact-name, keyword, or regular-expression matching.
- Configure ordered rules with optional rule IDs and a custom rejection message.
- Apply rules at the `ingress` stage, before a request is priced.
- Check ordinary API requests and task submissions.

### Fixed

- Match Claude Messages by the protocol name `claude`, so the Anthropic Messages option applies to `/v1/messages` requests.
