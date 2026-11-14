---
locale: zh-CN
---
# 端点限制

限制模型可以使用哪些端点类型。规则按模型名称精确匹配、关键词匹配或正则表达式匹配，并列出该模型允许使用的端点。没有匹配规则的模型默认放行。

## 渠道设置

- 在 **请求插件** 中添加插件，并为它创建一个实例。
- 把实例绑定为全局、绑定到一个或多个分组，或绑定到需要限制的渠道。
- 保持实例启用。停用的实例不执行任何检查。网关会为已经开始的请求保留它开始时使用的插件版本，插件更新从新请求开始生效。
- 如果同一个实例要用于互不相关的模型，可以用实例的 **模型** 列表缩小范围。该列表按模型名精确匹配，由网关在插件的规则之前执行。

插件在 `ingress` 阶段运行。全局或分组实例在请求解析和计价之前运行一次；绑定到渠道的实例还会在每次渠道尝试时再执行一次，在该次尝试计价之前运行。

插件不需要 API Key、上游地址或渠道类型。它不会向上游发送请求，也不会改变模型价格或计费。

## 配置

实例表单有两个设置：**规则** 和 **拒绝提示**。

每条规则包含：

| 字段 | 含义 |
| --- | --- |
| **模型匹配方式** | `精确` 比较完整模型名，`关键词` 匹配名称中的任意部分，`正则表达式` 把值当作 JavaScript 正则表达式。 |
| **模型名称或表达式** | 模型名、关键词，或完整正则表达式，例如 `^claude-.*`；正则表达式不带两侧斜杠。 |
| **允许的端点** | 匹配到的模型可以使用的端点类型。没有勾选的端点会被拒绝。 |
| **规则 ID** | 规则的可选名称。拒绝时写入日志；留空时按规则顺序自动编号为 `rule-1`、`rule-2` 等。 |

规则从上到下检查。第一条匹配请求模型的规则立即生效，即使它允许当前端点，也不会继续检查后面的规则。没有匹配任何规则的模型放行。

如果要限制某个模型，至少勾选一个允许的端点。匹配到的规则没有勾选任何端点时，该模型的所有端点都会被拒绝。

**拒绝提示** 留空时使用 `This model is not available on this endpoint`。自定义提示最多 256 个字符。

保存实例时网关会检查配置。模型为空、正则表达式无效或规则格式错误时，保存会被拒绝，并提示对应的规则。

## 端点

插件没有固定的模型列表，可以匹配网关提供的任意模型。

| 端点类型 | 客户端路径 |
| --- | --- |
| `openai` | `/v1/chat/completions`，或按路径区分的旧版 `/v1/completions`、`/v1/moderations` 请求体 |
| `openai_responses` | `/v1/responses` |
| `openai_responses_compaction` | `/v1/responses/compact` |
| `claude` | `/v1/messages` |
| `openai_alpha_search` | `/v1/alpha/search` |
| `openai_audio` | `/v1/audio/speech`、`/v1/audio/transcriptions`、`/v1/audio/translations` |
| `openai_image` | `/v1/images/generations`、`/v1/images/edits`、`/v1/edits` |
| `openai_realtime` | `/v1/realtime` |
| `gemini` | Gemini 的 `generateContent` 和嵌入接口，包括 `/v1beta/models/{model}:generateContent` |
| `embedding` | `/v1/embeddings` |
| `rerank` | `/v1/rerank` |
| `task` | 任务提交，包括 `/v1/videos` 和 `/v1/video/generations` |
| `mj_proxy` | `/mj/...` 下的 Midjourney 提交 |

### 协议兼容性

**Realtime** 选项在 `ingress` 阶段需要特别注意：New API 把 `/v1/realtime` 报告为 `openai_responses`。`openai_realtime` 用于后续阶段，而本插件不实现这些阶段。要在 `ingress` 阶段允许 Realtime，应勾选 `openai_responses`；只勾选 `openai_realtime` 会拒绝它。

## 匹配规则

精确匹配区分大小写，比较完整模型名。关键词匹配也区分大小写，使用子串判断，因此 `claude` 可以匹配 `claude-sonnet-4` 和 `my-claude-proxy`。

正则表达式使用 JavaScript 语法，默认不锚定；需要锚定时添加 `^` 和 `$`。表达式两侧不要写斜杠。需要忽略大小写时在开头写 `(?i)`，例如 `(?i)^claude-.*`。

请求体中的 `req.body.model` 是字符串时，插件使用它；否则使用 `ctx.model`。两者都不是非空字符串时，请求放行。全局或分组实例看到的是客户端请求的模型名；绑定到渠道的实例在每次尝试时读取上游请求体，因此渠道的模型映射可能改变它看到的值。

规则在计价前匹配。被拒绝的请求不会发送到渠道，不会计费，并返回 HTTP 400 和错误码 `request_rejected`。插件给出的原因是 `endpoint_restricted`，管理员的请求日志会记录实例、动作和规则 ID。

## 计费

插件没有价格字段，也不会改变模型价格。被拒绝的请求在计价前停止，不会计费。放行的请求继续走正常的渠道选择和计费流程。

## 示例

只允许 `claude-*` 模型使用 Responses 端点，拒绝其他端点：

```json
{
  "rules": [
    {
      "id": "claude-responses-only",
      "modelType": "regex",
      "model": "^claude-.*",
      "openai": false,
      "openai_responses": true
    }
  ],
  "message": "This model is only available on the Responses endpoint"
}
```

向允许的端点发送请求：

```bash
curl https://your-gateway.example.com/v1/responses \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '{"model": "claude-sonnet-4", "input": "你好"}'
```

把同一个模型发到 `/v1/chat/completions` 会被拒绝，因为第一条匹配的规则只允许 `openai_responses`：

```bash
curl https://your-gateway.example.com/v1/chat/completions \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '{"model": "claude-sonnet-4", "messages": [{"role": "user", "content": "你好"}]}'
```

响应为 HTTP 400，错误码为 `request_rejected`，消息是配置的拒绝提示。

## 限制

- 每个实例最多 100 条规则。
- 模型匹配值长度为 1 到 1024 个字符。规则 ID 最多 64 个字符。拒绝提示最多 256 个字符。
- 一条规则可以同时允许多个端点类型。
- 插件会检查普通 API 请求和任务提交，但不检查任务轮询、文件下载或已经开始的回复。
- 请求体在 `ingress` 阶段无法读取时，插件不运行；没有非空模型名的请求会被放行。
- 插件实例运行失败时，请求会以 HTTP 500 和错误码 `request_plugin_failed` 停止；该插件没有声明为可选，因此启用实例前应仔细检查规则。
