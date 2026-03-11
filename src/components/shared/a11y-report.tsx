"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Accessibility, ChevronDown, ChevronUp } from "lucide-react";
import type { A11yIssue } from "@/lib/a11y-scanner";

type A11yReportProps = {
  issues: A11yIssue[];
};

const A11Y_SEVERITY_STYLES = {
  error: "bg-destructive/10 text-destructive border-destructive/30",
  warning:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
};

const A11Y_SEVERITY_LABELS = {
  error: "エラー",
  warning: "警告",
  info: "情報",
};

export function A11yReport({ issues }: A11yReportProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (issues.length === 0) return null;

  const highestSeverity = issues.some((i) => i.severity === "error")
    ? "error"
    : issues.some((i) => i.severity === "warning")
      ? "warning"
      : "info";

  return (
    <div
      className={`mb-3 rounded-lg border p-3 ${A11Y_SEVERITY_STYLES[highestSeverity]}`}
    >
      <button
        className="flex w-full items-center justify-between text-sm font-medium"
        onClick={() => setShowDetails(!showDetails)}
      >
        <span>
          <Accessibility className="mr-1.5 inline h-4 w-4" />
          アクセシビリティスキャン: {issues.length}件の検出
        </span>
        {showDetails ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {showDetails && (
        <ul className="mt-2 space-y-1 text-xs">
          {issues.map((issue, i) => (
            <li key={i} className="flex items-start gap-2">
              <Badge
                variant="outline"
                className={`shrink-0 text-[10px] ${A11Y_SEVERITY_STYLES[issue.severity]}`}
              >
                {A11Y_SEVERITY_LABELS[issue.severity]}
              </Badge>
              <span>
                {issue.message}
                {issue.wcag && (
                  <span className="ml-1 opacity-60">(WCAG {issue.wcag})</span>
                )}
                {issue.line && (
                  <span className="ml-1 opacity-60">(行 {issue.line})</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
