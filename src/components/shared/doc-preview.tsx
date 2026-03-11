"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileText,
  Package,
  Code,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { ComponentDoc } from "@/lib/doc-generator";

type DocPreviewProps = {
  doc: ComponentDoc;
};

export function DocPreview({ doc }: DocPreviewProps) {
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedUsage, setCopiedUsage] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  function copyToClipboard(
    text: string,
    setter: (v: boolean) => void,
    label: string
  ) {
    navigator.clipboard.writeText(text);
    setter(true);
    toast.success(`${label}をコピーしました`);
    setTimeout(() => setter(false), 2000);
  }

  return (
    <div className="mb-3 max-h-[500px] overflow-y-auto rounded-lg border bg-background p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-semibold">コンポーネントドキュメント</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            copyToClipboard(doc.markdownDoc, setCopiedMarkdown, "Markdown")
          }
        >
          {copiedMarkdown ? (
            <Check className="mr-1 h-3.5 w-3.5" />
          ) : (
            <Copy className="mr-1 h-3.5 w-3.5" />
          )}
          Markdownをコピー
        </Button>
      </div>

      {/* Overview */}
      <section className="mb-4">
        <h4 className="mb-1 text-xs font-medium text-muted-foreground">概要</h4>
        <p className="text-sm">{doc.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            <Code className="mr-1 h-3 w-3" />
            {doc.componentName}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {doc.estimatedLines} 行
          </Badge>
          {doc.hasState && (
            <Badge
              variant="outline"
              className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 text-[10px]"
            >
              <Zap className="mr-1 h-3 w-3" />
              useState
            </Badge>
          )}
          {doc.hasEffects && (
            <Badge
              variant="outline"
              className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 text-[10px]"
            >
              <Zap className="mr-1 h-3 w-3" />
              useEffect
            </Badge>
          )}
        </div>
      </section>

      {/* Install */}
      {doc.installCommand && (
        <section className="mb-4">
          <h4 className="mb-1 text-xs font-medium text-muted-foreground">
            インストール
          </h4>
          <div className="flex items-center gap-2 rounded-md bg-muted p-2">
            <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <code className="flex-1 text-xs">{doc.installCommand}</code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() =>
                copyToClipboard(
                  doc.installCommand,
                  setCopiedInstall,
                  "インストールコマンド"
                )
              }
            >
              {copiedInstall ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </section>
      )}

      {/* Props */}
      {doc.props.length > 0 && (
        <section className="mb-4">
          <h4 className="mb-1 text-xs font-medium text-muted-foreground">
            Props
          </h4>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-1.5 text-left font-medium">Name</th>
                  <th className="px-3 py-1.5 text-left font-medium">Type</th>
                  <th className="px-3 py-1.5 text-left font-medium">Required</th>
                  <th className="px-3 py-1.5 text-left font-medium">Default</th>
                </tr>
              </thead>
              <tbody>
                {doc.props.map((prop) => (
                  <tr key={prop.name} className="border-b last:border-b-0">
                    <td className="px-3 py-1.5 font-mono">{prop.name}</td>
                    <td className="px-3 py-1.5">
                      <code className="rounded bg-muted px-1 py-0.5">
                        {prop.type}
                      </code>
                    </td>
                    <td className="px-3 py-1.5">
                      {prop.required ? (
                        <Badge
                          variant="outline"
                          className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 text-[10px]"
                        >
                          必須
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      {prop.defaultValue ? (
                        <code className="rounded bg-muted px-1 py-0.5">
                          {prop.defaultValue}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Usage Example */}
      <section className="mb-4">
        <h4 className="mb-1 text-xs font-medium text-muted-foreground">
          使用例
        </h4>
        <div className="relative rounded-md bg-muted p-3">
          <pre className="overflow-x-auto text-xs leading-relaxed">
            <code>{doc.usageExample}</code>
          </pre>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6"
            onClick={() =>
              copyToClipboard(doc.usageExample, setCopiedUsage, "使用例")
            }
          >
            {copiedUsage ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </section>

      {/* Tech Details (Collapsible) */}
      <section>
        <button
          className="flex w-full items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-xs font-medium"
          onClick={() => setShowTechDetails(!showTechDetails)}
        >
          <span>技術詳細</span>
          {showTechDetails ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        {showTechDetails && (
          <div className="mt-2 space-y-3 rounded-md border p-3">
            {/* State & Effects */}
            <div className="flex flex-wrap gap-3 text-xs">
              <span>
                状態管理:{" "}
                <strong>{doc.hasState ? "あり" : "なし"}</strong>
              </span>
              <span>
                副作用:{" "}
                <strong>{doc.hasEffects ? "あり" : "なし"}</strong>
              </span>
            </div>

            {/* Event Handlers */}
            {doc.eventHandlers.length > 0 && (
              <div>
                <h5 className="mb-1 text-xs font-medium text-muted-foreground">
                  イベントハンドラー
                </h5>
                <div className="flex flex-wrap gap-1">
                  {doc.eventHandlers.map((handler) => (
                    <Badge key={handler} variant="outline" className="text-[10px]">
                      {handler}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tailwind Classes */}
            {doc.tailwindClasses.length > 0 && (
              <div>
                <h5 className="mb-1 text-xs font-medium text-muted-foreground">
                  Tailwindクラス
                </h5>
                <div className="flex flex-wrap gap-1">
                  {doc.tailwindClasses.map((cls) => (
                    <code
                      key={cls}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                    >
                      {cls}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {/* Dependencies */}
            {doc.dependencies.length > 0 && (
              <div>
                <h5 className="mb-1 text-xs font-medium text-muted-foreground">
                  依存関係
                </h5>
                <div className="flex flex-wrap gap-1">
                  {doc.dependencies.map((dep) => (
                    <Badge key={dep} variant="secondary" className="text-[10px]">
                      <Package className="mr-1 h-2.5 w-2.5" />
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
