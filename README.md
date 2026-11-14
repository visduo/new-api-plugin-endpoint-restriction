---
translations:
  zh-CN: README.zh-CN.md
---
# Endpoint Restriction

Restricts which endpoint types a model may use. A rule matches the request model by exact name, keyword, or regular expression and lists the endpoints the model may use. Models without a matching rule are allowed.

## Channel setup

- Add the plugin under **Request plugins** and create an instance for it.
- Bind the instance globally, to one or more groups, or to the channels that need it.
- Keep the instance enabled. A disabled instance does nothing. The gateway keeps using the plugin version it knew when a request started, so a plugin update applies to new requests.
- Use the instance's **Models** list to narrow its scope when the same plugin instance is shared by unrelated models. The list matches the model name exactly and is applied by the gateway before the plugin's rules run.

The plugin runs at the `ingress` stage. A global or group instance runs once before the request is parsed and priced. A channel-bound instance also runs once per channel attempt, before that attempt is priced.

The plugin needs no API key, upstream address, or channel type. It does not send requests upstream and does not change model prices or billing.

## Configuration

The instance form has two settings: **Rules** and **Rejection message**.

Each rule contains:

| Field | Meaning |
| --- | --- |
| **Model match type** | `Exact` compares the whole model name, `Keyword` matches any part of it, and `Regular expression` treats the value as a JavaScript regular expression. |
| **Model name or expression** | A model name, a keyword, or a full regular expression without slashes, such as `^claude-.*`. |
| **Allowed endpoints** | The endpoint types the matched model may use. An endpoint that is not selected is rejected. |
| **Rule ID** | An optional name for the rule. It appears in the rejection log; when empty, the gateway numbers the rule by its position as `rule-1`, `rule-2`, and so on. |

Rules are checked from top to bottom. The first rule whose model matcher matches decides the request, even when it allows the endpoint. Later rules are not checked. A model that matches no rule is allowed.

Select at least one allowed endpoint for a rule that should restrict a model. A matched rule with no selected endpoints rejects every endpoint for that model.

An empty **Rejection message** uses `This model is not available on this endpoint`. A custom message is returned as the rejection message and can contain at most 256 characters.

The gateway checks the configuration when the instance is saved. An empty model, an invalid regular expression, or a malformed rule is refused with an error that names the rule.

## Endpoints

The plugin has no fixed model list; it can match any model the gateway serves.

| Endpoint type | Client paths |
| --- | --- |
| `openai` | `/v1/chat/completions`, or by path a legacy `/v1/completions` or `/v1/moderations` body |
| `openai_responses` | `/v1/responses` |
| `openai_responses_compaction` | `/v1/responses/compact` |
| `claude` | `/v1/messages` |
| `openai_alpha_search` | `/v1/alpha/search` |
| `openai_audio` | `/v1/audio/speech`, `/v1/audio/transcriptions`, `/v1/audio/translations` |
| `openai_image` | `/v1/images/generations`, `/v1/images/edits`, `/v1/edits` |
| `openai_realtime` | `/v1/realtime` |
| `gemini` | Gemini `generateContent` and embedding paths, including `/v1beta/models/{model}:generateContent` |
| `embedding` | `/v1/embeddings` |
| `rerank` | `/v1/rerank` |
| `task` | Task submissions, including `/v1/videos` and `/v1/video/generations` |
| `mj_proxy` | Midjourney submissions under `/mj/...` |

### Protocol compatibility

The **Realtime** option needs care at the `ingress` stage: New API reports `/v1/realtime` as `openai_responses`. `openai_realtime` is used in later stages, which this plugin does not implement. Select `openai_responses` to allow Realtime at `ingress`; selecting only `openai_realtime` rejects it.

## Matching

Exact matching is case-sensitive and compares the complete model name. Keyword matching is also case-sensitive and uses a substring test, so `claude` matches `claude-sonnet-4` and `my-claude-proxy`.

Regular expressions use JavaScript syntax and are not anchored; add `^` and `$` to anchor them. Write the expression without surrounding slashes. Prefix it with `(?i)` to ignore letter case, for example `(?i)^claude-.*`.

The plugin uses `req.body.model` when it is a string; otherwise it uses `ctx.model`. If neither is a non-empty string, the request is allowed. A global or group instance sees the client's request model. A channel-bound instance reads the upstream body on each attempt, so a channel model mapping can change the value it sees.

The rule matches the model before pricing. A rejected request is not sent to a channel, is not billed, and returns HTTP 400 with error code `request_rejected`. The plugin's reason is `endpoint_restricted`, and the administrator's request log records the instance, the action, and the rule ID.

## Billing

The plugin has no price fields and does not change model prices. A rejected request stops before pricing and is not billed. An allowed request continues through normal channel selection and billing.

## Example

Allow the `claude-*` models only on the Responses endpoint, and reject every other endpoint:

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

Send a request to an allowed endpoint:

```bash
curl https://your-gateway.example.com/v1/responses \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '{"model": "claude-sonnet-4", "input": "Hello"}'
```

The same model sent to `/v1/chat/completions` is rejected because the first matching rule only allows `openai_responses`:

```bash
curl https://your-gateway.example.com/v1/chat/completions \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '{"model": "claude-sonnet-4", "messages": [{"role": "user", "content": "Hello"}]}'
```

The response has HTTP status 400 and error code `request_rejected`, with the configured message.

## Limits

- An instance holds at most 100 rules.
- A model matcher is 1 to 1024 characters. A rule ID is at most 64 characters. The rejection message is at most 256 characters.
- A rule can allow any combination of the listed endpoint types.
- The plugin checks ordinary API requests and task submissions, but not task polling, artifact downloads, or replies that are already in progress.
- A request whose body cannot be read at `ingress` does not run the plugin. A request with no non-empty model is allowed.
- A failed plugin instance stops the request with HTTP 500 and error code `request_plugin_failed`; the plugin is not optional, so configure rules carefully before enabling the instance.
