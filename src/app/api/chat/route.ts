import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { tools } from "@/ai/tools";
import { buildSystemPrompt } from "@/ai/prompts/system";
import { AVAILABLE_MODELS } from "@/lib/models";
import type { UserContext } from "@/types/context";

function getModel(modelId?: string) {
  const config = AVAILABLE_MODELS.find((m) => m.id === modelId);
  if (!config) return openai("gpt-4o");

  switch (config.provider) {
    case "anthropic":
      return anthropic(config.modelId);
    case "google":
      return google(config.modelId);
    default:
      return openai(config.modelId);
  }
}

export async function POST(request: Request) {
  const {
    messages,
    userContext,
    modelId,
  }: {
    messages: UIMessage[];
    userContext?: UserContext;
    modelId?: string;
  } = await request.json();

  const result = streamText({
    model: getModel(modelId),
    system: buildSystemPrompt(userContext),
    messages: await convertToModelMessages(messages),
    tools,
  });

  return result.toUIMessageStreamResponse();
}
