"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Activity, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import type { OptimizationItem, OptimizationCategory, OptimizationSeverity } from "@/lib/code-optimizer";

type OptimizerReportProps = {
  items: OptimizationItem[];
  score: number;
};

const SEVERITY_STYLES: Record<OptimizationSeverity, string> = {
  important: "bg-destructive/10 text-destructive border-destructive/30",
  recommended:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  suggestion:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
};

const SEVERITY_LABELS: Record<OptimizationSeverity, string> = {
  important: "重要",
  recommended: "推奨",
  suggestion: "提案",
};

const CATEGORY_LABELS: Record<OptimizationCategory, string> = {
  performance: "パフォーマンス",
  bestPractice: "ベストプラクティス",
  accessibility: "アクセシビリティ",
  maintainability: "メンテナンス性",
};

function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBorderColor(score: number): string {
  if (score >= 90)
    return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30";
  if (score >= 70)
    return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
  return "bg-destructive/10 text-destructive border-destructive/30";
}

export function OptimizerReport({ items, score }: OptimizerReportProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Set<OptimizationCategory>
  >(new Set());

  const toggleCategory = (category: OptimizationCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<OptimizationCategory, OptimizationItem[]>
  );

  const isPerfect = score === 100;

  return (
    <div className={`mb-3 rounded-lg border p-3 ${getScoreBorderColor(score)}`}>
      <button
        className="flex w-full items-center justify-between text-sm font-medium"
        onClick={() => setShowDetails(!showDetails)}
      >
        <span className="flex items-center gap-2">
          <Activity className="inline h-4 w-4" />
          <span>コード品質スコア:</span>
          <span className={`font-bold ${getScoreColor(score)}`}>
            {score}/100
          </span>
          {isPerfect && (
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
            >
              <Trophy className="mr-1 h-3 w-3" />
              完璧
            </Badge>
          )}
          {items.length > 0 && (
            <span className="text-xs opacity-70">
              ({items.length}件の検出)
            </span>
          )}
        </span>
        {items.length > 0 &&
          (showDetails ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          ))}
      </button>

      {showDetails && items.length > 0 && (
        <div className="mt-3 space-y-2">
          {(
            Object.entries(grouped) as [
              OptimizationCategory,
              OptimizationItem[],
            ][]
          ).map(([category, categoryItems]) => (
            <div key={category} className="rounded-md border bg-background/50 p-2">
              <button
                className="flex w-full items-center justify-between text-xs font-medium"
                onClick={() => toggleCategory(category)}
              >
                <span>
                  {CATEGORY_LABELS[category]} ({categoryItems.length})
                </span>
                {expandedCategories.has(category) ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              {expandedCategories.has(category) && (
                <ul className="mt-2 space-y-1.5">
                  {categoryItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[10px] ${SEVERITY_STYLES[item.severity]}`}
                      >
                        {SEVERITY_LABELS[item.severity]}
                      </Badge>
                      <div className="min-w-0">
                        <p>{item.message}</p>
                        <p className="mt-0.5 opacity-70">
                          → {item.suggestion}
                          {item.line && (
                            <span className="ml-1">(行 {item.line})</span>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
