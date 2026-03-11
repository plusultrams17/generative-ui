"use client";

import { useState } from "react";
import { Copy, Check, FolderPlus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { GeneratedApiRoute } from "@/lib/api-generator";
import { HighlightedCode } from "@/components/shared/highlighted-code";

type ApiRoutePreviewProps = {
  route: GeneratedApiRoute;
};

const methodColors: Record<string, string> = {
  GET: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  POST: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function ApiRoutePreview({ route }: ApiRoutePreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const methods = route.method.split(",").map((m) => m.trim());

  function handleCopy() {
    navigator.clipboard.writeText(route.code);
    setCopied(true);
    toast.success("コードをコピーしました");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleAddToProject() {
    toast.info("プロジェクトに追加", {
      description: `${route.filename} はZIPエクスポート時に含まれます`,
    });
  }

  return (
    <Card className="w-full mt-3 border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-2 text-left"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <CardTitle className="text-sm font-mono">
              {route.filename}
            </CardTitle>
          </button>
          <div className="flex items-center gap-1.5">
            {methods.map((method) => (
              <span
                key={method}
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${methodColors[method] || "bg-muted text-muted-foreground"}`}
              >
                {method}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {route.description}
        </p>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <div className="relative">
            <HighlightedCode code={route.code} maxHeight="400px" />
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="mr-1.5 h-3 w-3" />
              ) : (
                <Copy className="mr-1.5 h-3 w-3" />
              )}
              コードをコピー
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleAddToProject}
            >
              <FolderPlus className="mr-1.5 h-3 w-3" />
              プロジェクトに追加
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
