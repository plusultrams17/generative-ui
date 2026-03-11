export type ModelProvider = "openai" | "anthropic" | "google";

export type ModelConfig = {
  id: string;
  provider: ModelProvider;
  modelId: string;
  label: string;
  description: string;
};

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "gpt-4o",
    provider: "openai",
    modelId: "gpt-4o",
    label: "GPT-4o",
    description: "OpenAI — 高速・バランス型",
  },
  {
    id: "gpt-4o-mini",
    provider: "openai",
    modelId: "gpt-4o-mini",
    label: "GPT-4o mini",
    description: "OpenAI — 軽量・低コスト",
  },
  {
    id: "claude-sonnet",
    provider: "anthropic",
    modelId: "claude-sonnet-4-6",
    label: "Claude Sonnet 4.6",
    description: "Anthropic — 高品質コード生成",
  },
  {
    id: "gemini-flash",
    provider: "google",
    modelId: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    description: "Google — 超高速レスポンス",
  },
];

export const DEFAULT_MODEL_ID = "gpt-4o";
