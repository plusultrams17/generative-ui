import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { tools } from "@/ai/tools";
import { buildSystemPrompt } from "@/ai/prompts/system";
import { AVAILABLE_MODELS } from "@/lib/models";
import { createClient } from "@/lib/supabase/server";
import { checkQuota, incrementUsage } from "@/lib/quota";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import type { UserContext } from "@/types/context";

const FREE_MODEL_ID = "gpt-4o-mini";

// Rate limit: 20 requests per minute per IP
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 1000;

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
  try {
    // Rate limit check
    const clientIP = getClientIP(request);
    const rateResult = checkRateLimit(clientIP, RATE_LIMIT, RATE_WINDOW_MS);
    if (!rateResult.allowed) {
      return new Response(
        JSON.stringify({
          error: "リクエストが多すぎます。しばらくしてから再度お試しください。",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(rateResult.retryAfterMs / 1000)),
          },
        }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "認証が必要です。ログインしてください。" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const { messages, userContext, modelId, designStyle } = body as {
      messages: UIMessage[];
      userContext?: UserContext;
      modelId?: string;
      designStyle?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages is required and must be a non-empty array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check quota
    const quota = await checkQuota(user.id);
    if (!quota.allowed) {
      const message =
        quota.plan === "free"
          ? "本日の無料生成回数の上限に達しました。Proプランにアップグレードすると月300回まで利用できます。"
          : "今月の生成回数の上限に達しました。";
      return new Response(
        JSON.stringify({
          error: message,
          quota: { remaining: quota.remaining, limit: quota.limit, plan: quota.plan },
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Free users can only use gpt-4o-mini
    const effectiveModelId = quota.plan === "free" ? FREE_MODEL_ID : (modelId || FREE_MODEL_ID);

    // Increment usage BEFORE streaming to prevent race conditions
    // (multiple rapid requests bypassing daily limits)
    try {
      await incrementUsage(user.id, effectiveModelId);
    } catch (err) {
      console.error("[chat] Failed to increment usage:", err);
    }

    const result = streamText({
      model: getModel(effectiveModelId),
      system: buildSystemPrompt(userContext, designStyle),
      messages: await convertToModelMessages(messages),
      tools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
