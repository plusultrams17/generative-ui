"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { Crown } from "lucide-react";

const LIMITS = {
  free: { monthly: 30 },
  pro: { monthly: 300 },
} as const;

export function QuotaBadge() {
  const profile = useAuthStore((s) => s.profile);
  const openUpgrade = useUpgradeStore((s) => s.openUpgrade);

  if (!profile) return null;

  const plan = (profile.plan as "free" | "pro") || "free";
  const limit = LIMITS[plan].monthly;
  const used = profile.generation_count_month ?? 0;
  const remaining = Math.max(0, limit - used);
  const ratio = used / limit;

  // Pro users: simple counter
  if (plan === "pro") {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Crown className="h-3 w-3 text-amber-500" />
        <span>{remaining}/{limit}</span>
      </div>
    );
  }

  // Color based on usage
  const colorClass =
    ratio >= 1
      ? "text-red-600 dark:text-red-400 font-semibold"
      : ratio >= 0.9
        ? "text-red-600 dark:text-red-400"
        : ratio >= 0.7
          ? "text-amber-600 dark:text-amber-400"
          : "text-muted-foreground";

  const pulseClass = ratio >= 0.9 ? "animate-pulse" : "";

  function handleClick() {
    if (remaining === 0) {
      openUpgrade("quota_exhausted", { remaining, limit: limit, used });
    } else if (ratio >= 0.7) {
      openUpgrade("quota_warning", { remaining, limit: limit, used });
    } else {
      openUpgrade("general", { remaining, limit: limit, used });
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-muted ${colorClass} ${pulseClass}`}
      title={`今月の残り生成回数: ${remaining}/${limit}`}
    >
      {/* Mini progress ring */}
      <svg className="h-3.5 w-3.5 -rotate-90" viewBox="0 0 20 20">
        <circle
          cx="10" cy="10" r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          opacity={0.15}
        />
        <circle
          cx="10" cy="10" r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={`${ratio * 50.27} 50.27`}
          strokeLinecap="round"
        />
      </svg>
      <span>
        {remaining === 0 ? "制限到達" : `残り ${remaining}回`}
      </span>
    </button>
  );
}
