"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  AlertTriangle,
  Info,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  PerfResult,
  PerfCategory,
  PerfIssue,
} from "@/lib/perf-analyzer";

type PerfPanelProps = {
  result: PerfResult;
};

const CATEGORY_LABELS: Record<PerfCategory, string> = {
  rendering: "レンダリング",
  bundle: "バンドル",
  runtime: "ランタイム",
  memory: "メモリ",
};

const SEVERITY_STYLES: Record<PerfIssue["severity"], string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  warning:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
};

const SEVERITY_LABELS: Record<PerfIssue["severity"], string> = {
  critical: "重大",
  warning: "警告",
  info: "情報",
};

const GRADE_COLORS: Record<PerfResult["grade"], string> = {
  A: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30",
  B: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  C: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  D: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30",
  F: "bg-destructive/10 text-destructive border-destructive/30",
};

function SeverityIcon({ severity }: { severity: PerfIssue["severity"] }) {
  switch (severity) {
    case "critical":
      return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
    case "warning":
      return (
        <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
      );
    case "info":
      return (
        <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
      );
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function PerfPanel({ result }: PerfPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<
    Set<PerfCategory>
  >(new Set());

  const toggleCategory = (category: PerfCategory) => {
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

  const grouped = result.issues.reduce(
    (acc, issue) => {
      if (!acc[issue.category]) acc[issue.category] = [];
      acc[issue.category]!.push(issue);
      return acc;
    },
    {} as Partial<Record<PerfCategory, PerfIssue[]>>
  );

  const scoreColor =
    result.score >= 90
      ? "text-green-600 dark:text-green-400"
      : result.score >= 70
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";

  const barColor =
    result.score >= 90
      ? "bg-green-500"
      : result.score >= 70
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="mb-3 max-h-[500px] overflow-y-auto rounded-lg border bg-background p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Zap className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-sm font-semibold">パフォーマンス分析</h3>
      </div>

      {/* Grade + Score */}
      <div className="mb-4 flex items-center gap-4">
        <Badge
          variant="outline"
          className={`text-2xl font-bold px-4 py-2 ${GRADE_COLORS[result.grade]}`}
        >
          {result.grade}
        </Badge>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-xl font-bold ${scoreColor}`}>
              {result.score}
            </span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className={`h-2 rounded-full transition-all ${barColor}`}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>
        {result.score === 100 && (
          <CheckCircle className="h-5 w-5 text-green-500" />
        )}
      </div>

      {/* Metrics Cards */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-md border p-2.5">
          <p className="text-[10px] text-muted-foreground">DOM要素数(推定)</p>
          <p className="text-sm font-bold">{result.metrics.estimatedDOMNodes}</p>
        </div>
        <div className="rounded-md border p-2.5">
          <p className="text-[10px] text-muted-foreground">バンドルサイズ(推定)</p>
          <p className="text-sm font-bold">
            {formatBytes(result.metrics.estimatedBundleSize)}
          </p>
        </div>
        <div className="rounded-md border p-2.5">
          <p className="text-[10px] text-muted-foreground">複雑度スコア</p>
          <p className="text-sm font-bold">
            {result.metrics.complexityScore}/100
          </p>
        </div>
        <div className="rounded-md border p-2.5">
          <p className="text-[10px] text-muted-foreground">レンダーコスト</p>
          <p className="text-sm font-bold">
            {result.metrics.renderCost === "low"
              ? "低"
              : result.metrics.renderCost === "medium"
                ? "中"
                : "高"}
          </p>
        </div>
      </div>

      {/* Issues by Category */}
      {result.issues.length === 0 ? (
        <div className="rounded-md border bg-green-500/10 p-3 text-center text-sm text-green-700 dark:text-green-400">
          <CheckCircle className="mx-auto mb-1 h-5 w-5" />
          パフォーマンスの問題は検出されませんでした
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            検出された問題 ({result.issues.length}件)
          </p>
          {(
            Object.entries(grouped) as [PerfCategory, PerfIssue[]][]
          ).map(([category, categoryIssues]) => (
            <div
              key={category}
              className="rounded-md border bg-background/50 p-2"
            >
              <button
                className="flex w-full items-center justify-between text-xs font-medium"
                onClick={() => toggleCategory(category)}
              >
                <span className="flex items-center gap-1.5">
                  {CATEGORY_LABELS[category]} ({categoryIssues.length})
                </span>
                {expandedCategories.has(category) ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              {expandedCategories.has(category) && (
                <ul className="mt-2 space-y-2">
                  {categoryIssues.map((issue, i) => (
                    <li
                      key={i}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-start gap-2">
                        <SeverityIcon severity={issue.severity} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${SEVERITY_STYLES[issue.severity]}`}
                            >
                              {SEVERITY_LABELS[issue.severity]}
                            </Badge>
                            <span className="text-xs font-medium">
                              {issue.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {issue.description}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            → {issue.suggestion}
                          </p>
                        </div>
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
