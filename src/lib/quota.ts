import { createClient } from "@/lib/supabase/server";

export type QuotaResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  plan: "free" | "pro";
};

const LIMITS = {
  free: { daily: 5, monthly: 30 },
  pro: { daily: Infinity, monthly: 300 },
} as const;

export async function checkQuota(userId: string): Promise<QuotaResult> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan, generation_count_month, generation_reset_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) {
    return { allowed: true, remaining: 5, limit: 5, plan: "free" };
  }

  const plan = (profile.plan as "free" | "pro") || "free";
  const limits = LIMITS[plan];

  // Check if monthly counter needs reset
  const resetAt = new Date(profile.generation_reset_at);
  const now = new Date();
  let monthCount = profile.generation_count_month;

  if (now >= resetAt) {
    // Reset counter
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await supabase
      .from("profiles")
      .update({
        generation_count_month: 0,
        generation_reset_at: nextReset.toISOString(),
      })
      .eq("id", userId);
    monthCount = 0;
  }

  // Check daily usage for free plan
  if (plan === "free") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString());

    const dailyCount = count || 0;
    if (dailyCount >= limits.daily) {
      return {
        allowed: false,
        remaining: 0,
        limit: limits.daily,
        plan,
      };
    }
  }

  const remaining = Math.max(0, limits.monthly - monthCount);
  return {
    allowed: remaining > 0,
    remaining,
    limit: limits.monthly,
    plan,
  };
}

export async function incrementUsage(
  userId: string,
  model: string,
  toolName?: string
): Promise<void> {
  const supabase = await createClient();

  // Increment monthly counter
  await supabase.rpc("increment_generation_count", { p_user_id: userId });

  // Log usage
  await supabase.from("usage_logs").insert({
    user_id: userId,
    model,
    tool_name: toolName || null,
  });
}
