import { createOpenAI } from "@ai-sdk/openai";

export interface ModelConfigInput {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    maxOutputTokens?: number;
}

const DEFAULTS = {
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
    maxOutputTokens: parseEnvInt(process.env.OPENAI_MAX_OUTPUT_TOKENS),
};

function parseEnvInt(value?: string) {
    if (!value) return undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function resolveModel(config?: ModelConfigInput) {
    const baseUrl = config?.baseUrl?.trim() || DEFAULTS.baseUrl;
    const apiKey = config?.apiKey?.trim() || DEFAULTS.apiKey;
    const model = config?.model?.trim() || DEFAULTS.model;
    const maxOutputTokens =
        typeof config?.maxOutputTokens === "number"
            ? config.maxOutputTokens
            : DEFAULTS.maxOutputTokens;

    const client = createOpenAI({
        apiKey,
        baseURL: baseUrl,
        name: "openai",
    });

    return { client, model, maxOutputTokens };
}
