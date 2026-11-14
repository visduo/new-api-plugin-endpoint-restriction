---
changelogVersion: 1
plugin: "visduo_endpoint-restriction"
version: "1.0.0"
locale: "zh-CN"
---
# Changelog

## [1.0.0]

### Added

- 按模型名称精确匹配、关键词匹配或正则表达式匹配，限制模型可使用的端点类型。
- 支持按顺序排列的规则、可选的规则 ID 和自定义拒绝提示。
- 在 `ingress` 阶段执行规则，此时尚未计价。
- 检查普通 API 请求和任务提交。

### Fixed

- 按协议名 `claude` 匹配 Claude Messages，使 **Anthropic Messages** 选项作用于 `/v1/messages` 请求。
