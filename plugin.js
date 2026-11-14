const MATCH_EXACT = "exact";
const MATCH_KEYWORD = "keyword";
const MATCH_REGEX = "regex";

const ENDPOINTS = [
    ["openai", { en: "Chat Completions", zh: "Chat Completions" }],
    ["openai_responses", { en: "Responses", zh: "Responses" }],
    ["openai_responses_compaction", { en: "Compaction", zh: "压缩" }],
    ["openai_alpha_search", { en: "Alpha search", zh: "Alpha 搜索" }],
    ["openai_audio", { en: "Audio", zh: "音频" }],
    ["openai_image", { en: "Images", zh: "图像" }],
    ["openai_realtime", { en: "Realtime", zh: "实时" }],
    ["claude", { en: "Anthropic Messages", zh: "Anthropic Messages" }],
    ["gemini", { en: "Gemini", zh: "Gemini" }],
    ["embedding", { en: "Embeddings", zh: "嵌入" }],
    ["rerank", { en: "Rerank", zh: "重排" }],
    ["task", { en: "Tasks", zh: "任务" }],
    ["mj_proxy", { en: "Midjourney", zh: "Midjourney" }],
];

const ENDPOINT_FORMATS = ENDPOINTS.map(([format]) => format);
const ENDPOINT_PROPERTIES = {};
for (const [format, title] of ENDPOINTS) {
    ENDPOINT_PROPERTIES[format] = {
        type: "boolean",
        title,
        description: { en: "Allow this endpoint", zh: "允许此端点" },
        default: false,
    };
}

const DEFAULT_MESSAGE = "This model is not available on this endpoint";

export const meta = {
    apiVersion: 1,
    key: "visduo_endpoint-restriction",
    name: { en: "Endpoint Restriction", zh: "端点限制" },
    description: {
        en: "Limits which endpoint types a model can use, matched by exact name, keyword or regular expression",
        zh: "按模型名称精确、关键词或正则匹配，限制模型可使用的端点类型",
    },
    version: "1.0.1",
    author: { name: "多栈科技" },
    website: "https://ais.6os.net/",
    configSchema: {
        type: "object",
        properties: {
            rules: {
                type: "array",
                title: { en: "Rules", zh: "规则" },
                description: {
                    en: "Checked in order; the first rule matching the request model decides. Models without a matching rule are allowed",
                    zh: "按顺序检查，第一条匹配请求模型的规则生效；没有匹配规则的模型默认放行",
                },
                default: [],
                maxItems: 100,
                items: {
                    type: "object",
                    title: { en: "Rule", zh: "规则" },
                    description: {
                        en: "A model matcher and the endpoints it may use",
                        zh: "模型匹配条件及允许使用的端点",
                    },
                    required: ["model"],
                    properties: {
                        modelType: {
                            type: "string",
                            title: { en: "Model match type", zh: "模型匹配方式" },
                            description: {
                                en: "Exact compares the whole model name; keyword matches any part; regular expression matches a full expression",
                                zh: "精确匹配完整模型名；关键词匹配名称中的任意部分；正则表达式按完整表达式匹配",
                            },
                            enum: ["exact", "keyword", "regex"],
                            enumTitles: [
                                { en: "Exact", zh: "精确" },
                                { en: "Keyword", zh: "关键词" },
                                { en: "Regular expression", zh: "正则表达式" },
                            ],
                            default: "keyword",
                        },
                        model: {
                            type: "string",
                            title: { en: "Model name or expression", zh: "模型名称或表达式" },
                            description: {
                                en: "A model name for exact or keyword matching, or a full regular expression without slashes such as ^claude-.*; the match type is selected to the left",
                                zh: "精确/关键词模式填写模型名称，正则模式填写不带斜杠的完整表达式（如 ^claude-.*）；匹配方式在左侧选择",
                            },
                            minLength: 1,
                            maxLength: 1024,
                            examples: ["claude-sonnet-4", "^claude-.*"],
                        },
                        openai: {
                            type: "boolean",
                            title: { en: "Chat Completions", zh: "Chat Completions" },
                            description: { en: "Allow this endpoint", zh: "允许此端点" },
                            default: false,
                        },
                        openai_responses: {
                            type: "boolean",
                            title: { en: "Responses", zh: "Responses" },
                            description: { en: "Allow this endpoint", zh: "允许此端点" },
                            default: false,
                        },
                        openai_responses_compaction: {
                            type: "boolean",
                            title: { en: "Compaction", zh: "压缩" },
                            description: { en: "Allow this endpoint", zh: "允许此端点" },
                            default: false,
                        },
                        openai_alpha_search: {
                            type: "boolean",
                            title: { en: "Alpha search", zh: "Alpha 搜索" },
                            description: { en: "Allow this endpoint", zh: "允许此端点" },
                            default: false,
                        },
                        openai_audio: {
                            type: "boolean",
                            title: { en: "Audio", zh: "音频" },
                            description: { en: "Allow this endpoint", zh: "允许此端点" },
                            default: false,
                        },
                        openai_image: {
                            type: "boolean",
                            title: { en: "Images", zh: "图像" },
                            description: { en: "Allow this endpoint", zh: "允许此端点" },
                            default: false,
                        },
                        openai_realtime: {
                            type: "boolean",
                            title: { en: "Realtime", zh: "实时" },
                            description: { en: "Allow this endpoint", zh: "允许此端点" },
                            default: false,
                        },
                        claude: {
                            type: "boolean",
                            title: { en: "Anthropic Messages", zh: "Anthropic Messages" },
                            description: { en: "Allow this endpoint", zh: "允许此端点" },
                            default: false,
                        },
                        gemini: {
                            type: "boolean",
                            title: { en: "Gemini", zh: "Gemini" },
                            description: { en: "Allow this endpoint", zh: "允许此端点" },
                            default: false,
                        },
                        embedding: {
                            type: "boolean",
                            title: { en: "Embeddings", zh: "嵌入" },
                            description: { en: "Allow this endpoint", zh: "允许此端点" },
                            default: false,
                        },
                        rerank: {
                            type: "boolean",
                            title: { en: "Rerank", zh: "重排" },
                            description: { en: "Allow this endpoint", zh: "允许此端点" },
                            default: false,
                        },
                        task: {
                            type: "boolean",
                            title: { en: "Tasks", zh: "任务" },
                            description: { en: "Allow this endpoint", zh: "允许此端点" },
                            default: false,
                        },
                        mj_proxy: {
                            type: "boolean",
                            title: { en: "Midjourney", zh: "Midjourney" },
                            description: { en: "Allow this endpoint", zh: "允许此端点" },
                            default: false,
                        },
                        id: {
                            type: "string",
                            title: { en: "Rule ID", zh: "规则 ID" },
                            description: {
                                en: "Recorded when the rule rejects a request; leave empty to number rules in order",
                                zh: "拒绝请求时记录，留空时按顺序编号",
                            },
                            maxLength: 64,
                            examples: ["claude-chat-disabled"],
                        },
                    },
                },
            },
            message: {
                type: "string",
                title: { en: "Rejection message", zh: "拒绝提示" },
                description: {
                    en: "Shown to the client; leave empty for the default message",
                    zh: "返回给客户端，留空时使用默认提示",
                },
                default: "",
                maxLength: 256,
                examples: ["This model does not support this endpoint"],
            },
        },
    },
    samples: [
        {
            name: { en: "Claude model on Chat Completions", zh: "Claude 模型使用 Chat Completions" },
            lang: "en",
            format: "openai",
            body: {
                model: "claude-sonnet-4",
                messages: [{ role: "user", content: "Hello" }],
            },
        },
        {
            name: { en: "Claude model on Chat Completions", zh: "Claude 模型使用 Chat Completions" },
            lang: "zh",
            format: "openai",
            body: {
                model: "claude-sonnet-4",
                messages: [{ role: "user", content: "你好" }],
            },
        },
    ],
};

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function trimmed(value) {
    return typeof value === "string" ? value.trim() : "";
}

function compileModelPattern(rule, ruleId) {
    if (rule.modelType === MATCH_EXACT) {
        return { exact: rule.model };
    }
    if (rule.modelType !== MATCH_REGEX) {
        return { keyword: trimmed(rule.model) };
    }
    let source = trimmed(rule.model);
    let insensitive = false;
    if (source.startsWith("(?i)")) {
        source = source.slice(4);
        insensitive = true;
    }
    try {
        return { regex: new RegExp(source, insensitive ? "i" : "") };
    } catch (error) {
        throw new Error('Rule "' + ruleId + '" has an invalid regular expression');
    }
}

function compileRules(config) {
    const rules = config.rules || [];
    const compiled = [];
    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        if (!isObject(rule)) continue;
        const ruleId = trimmed(rule.id) || "rule-" + (i + 1);
        const model = trimmed(rule.model);
        if (model === "") throw new Error('Rule "' + ruleId + '" has an empty model');
        // Older configurations used endpoints: [...]; keep them working while
        // the form now saves one boolean per endpoint.
        const endpoints = Array.isArray(rule.endpoints)
            ? rule.endpoints
            : ENDPOINT_FORMATS.filter((endpoint) => rule[endpoint] === true);
        compiled.push({
            id: ruleId,
            matcher: compileModelPattern(rule, ruleId),
            endpoints: endpoints,
        });
    }
    return compiled;
}

function modelMatches(matcher, model) {
    if (matcher.regex) {
        matcher.regex.lastIndex = 0;
        return matcher.regex.test(model);
    }
    if (matcher.keyword !== undefined) return model.includes(matcher.keyword);
    return model === matcher.exact;
}

function requestModel(ctx, req) {
    const body = req && req.body;
    if (isObject(body) && typeof body.model === "string") return body.model;
    return ctx && typeof ctx.model === "string" ? ctx.model : "";
}

function firstRuleFor(rules, model) {
    for (const rule of rules) {
        if (modelMatches(rule.matcher, model)) return rule;
    }
    return null;
}

function check(ctx, req) {
    const config = ctx.config || {};
    const rules = compileRules(config);
    if (rules.length === 0) return { action: "continue" };
    const model = requestModel(ctx, req);
    if (model === "") return { action: "continue" };
    const rule = firstRuleFor(rules, model);
    if (rule === null || rule.endpoints.includes(ctx.format)) return { action: "continue" };
    const result = { action: "reject", code: "endpoint_restricted", ruleId: rule.id };
    const message = trimmed(config.message);
    result.message = message || DEFAULT_MESSAGE;
    return result;
}

export function validateConfig(config) {
    compileRules(config || {});
}

export function ingress(ctx, req) {
    return check(ctx, req);
}
