import type { UserContext } from "@/types/context";

function getMostFrequent(actions: string[], count: number): string[] {
  const freq = new Map<string, number>();
  for (const action of actions) {
    freq.set(action, (freq.get(action) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([action]) => action);
}

export function buildContextAdaptivePrompt(ctx: UserContext): string {
  const lines: string[] = [];

  if (ctx.skillLevel === "beginner") {
    lines.push(
      "The user is a beginner. Provide detailed explanations alongside generated UI.",
      "Use simpler layouts and include helpful labels/tooltips."
    );
  } else if (ctx.skillLevel === "advanced") {
    lines.push(
      "The user is advanced. Be concise. Prefer code-focused responses.",
      "You can use complex layouts and advanced component patterns."
    );
  }

  if (ctx.deviceType === "mobile") {
    lines.push(
      "The user is on a mobile device. Generate mobile-first, single-column layouts.",
      "Use larger touch targets (min 44px) and avoid hover-dependent interactions."
    );
  }

  if (ctx.recentErrors > 3) {
    lines.push(
      "The user has encountered several errors recently. Generate simpler, more robust components.",
      "Include extra validation and user-friendly error messages."
    );
  }

  const topActions = getMostFrequent(ctx.frequentActions, 3);
  if (topActions.length > 0) {
    lines.push(
      `The user frequently works with: ${topActions.join(", ")}. Proactively suggest related components when appropriate.`
    );
  }

  return lines.length > 0
    ? `User context adaptations:\n${lines.join("\n")}`
    : "";
}
