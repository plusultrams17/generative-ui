"use client";

import { useHistoryStore, type HistoryEntry } from "@/stores/history-store";
import { useComposerStore } from "@/stores/composer-store";
import { generateComposedHtml, generateComposedProjectZip } from "@/lib/compose-exporter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SandboxFrame } from "@/components/sandbox/sandbox-frame";
import {
  ArrowLeft,
  Layers,
  Plus,
  Check,
  ChevronUp,
  ChevronDown,
  X,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { TOOL_LABELS } from "@/lib/shared-constants";

const TOOL_COLORS: Record<string, string> = {
  showForm: "bg-blue-500",
  showTable: "bg-green-500",
  showChart: "bg-amber-500",
  generateCustomComponent: "bg-purple-500",
};

const FILTER_TABS = [
  { key: "all", label: "全て" },
  { key: "showForm", label: "フォーム" },
  { key: "showTable", label: "テーブル" },
  { key: "showChart", label: "チャート" },
  { key: "generateCustomComponent", label: "カスタム" },
] as const;

export default function ComposerPage() {
  const entries = useHistoryStore((s) => s.entries);
  const items = useComposerStore((s) => s.items);
  const addItem = useComposerStore((s) => s.addItem);
  const removeItem = useComposerStore((s) => s.removeItem);
  const moveItem = useComposerStore((s) => s.moveItem);
  const clearItems = useComposerStore((s) => s.clearItems);
  const isInComposer = useComposerStore((s) => s.isInComposer);

  const [filter, setFilter] = useState<string>("all");
  const [exporting, setExporting] = useState(false);

  const filtered =
    filter === "all"
      ? entries
      : entries.filter((e) => e.toolName === filter);

  function handleAdd(entry: HistoryEntry) {
    addItem(entry);
    toast.success("コンポーザーに追加しました");
  }

  function handleRemove(id: string) {
    removeItem(id);
    toast.success("コンポーネントを削除しました");
  }

  function handlePreview() {
    if (items.length === 0) return;
    const html = generateComposedHtml(items);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  async function handleDownloadZip() {
    if (items.length === 0) return;
    setExporting(true);
    try {
      const blob = await generateComposedProjectZip(items, "コンポーズドページ");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "composed-page.zip";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("ZIPをダウンロードしました");
    } catch {
      toast.error("エクスポートに失敗しました");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="ホームに戻る">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">ページコンポーザー</h1>
          </div>
          <Badge variant="secondary" className="text-xs">
            {items.length}件
          </Badge>
          <div className="flex-1" />
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearItems();
                toast.success("全てクリアしました");
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              全てクリア
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        {/* Left panel: component picker */}
        <div className="w-full shrink-0 lg:w-1/3">
          <div className="sticky top-20">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              コンポーネントを選択
            </h2>
            <div className="mb-3 flex gap-1 overflow-x-auto">
              {FILTER_TABS.map((tab) => (
                <Button
                  key={tab.key}
                  variant={filter === tab.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(tab.key)}
                  className="shrink-0 text-xs"
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            <ScrollArea className="h-[calc(100vh-16rem)] lg:h-[calc(100vh-14rem)]">
              <div className="space-y-2 pr-2">
                {filtered.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {filter === "all"
                      ? "生成履歴がありません"
                      : `${TOOL_LABELS[filter] || filter}の履歴がありません`}
                  </div>
                ) : (
                  filtered.map((entry) => {
                    const inComposer = isInComposer(entry.id);
                    const label =
                      TOOL_LABELS[entry.toolName] || entry.toolName;
                    const title =
                      (entry.toolData.title as string) || label;
                    const colorClass =
                      TOOL_COLORS[entry.toolName] || "bg-gray-500";

                    return (
                      <Card
                        key={entry.id}
                        className={`gap-0 overflow-hidden py-0 transition-opacity ${
                          inComposer ? "opacity-60" : ""
                        }`}
                      >
                        <div className={`h-1 ${colorClass}`} />
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-xs font-medium">
                                {title}
                              </span>
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-[9px]"
                              >
                                {label}
                              </Badge>
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                              {entry.prompt}
                            </p>
                          </div>
                          {inComposer ? (
                            <Badge
                              variant="outline"
                              className="shrink-0 gap-1 text-[10px]"
                            >
                              <Check className="h-2.5 w-2.5" />
                              追加済み
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 shrink-0 gap-1 text-[10px]"
                              onClick={() => handleAdd(entry)}
                            >
                              <Plus className="h-3 w-3" />
                              追加
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right panel: composition preview */}
        <div className="flex-1">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            コンポジション ({items.length}件)
          </h2>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-20 text-center">
              <Layers className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">
                左のパネルからコンポーネントを追加してください
              </p>
              <p className="text-xs text-muted-foreground">
                コンポーネントを組み合わせて1つのページを作成できます
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const label =
                  TOOL_LABELS[item.toolName] || item.toolName;
                const colorClass =
                  TOOL_COLORS[item.toolName] || "bg-gray-500";
                const isCustom =
                  item.toolName === "generateCustomComponent";
                const code = item.toolData.code as string | undefined;

                return (
                  <Card key={item.id} className="gap-0 overflow-hidden py-0">
                    <div className={`h-1 ${colorClass}`} />
                    {/* Controls */}
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          disabled={idx === 0}
                          onClick={() => moveItem(item.id, "up")}
                          aria-label="上に移動"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          disabled={idx === items.length - 1}
                          onClick={() => moveItem(item.id, "down")}
                          aria-label="下に移動"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {idx + 1}.
                      </span>
                      <span className="flex-1 truncate text-sm font-medium">
                        {item.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px]"
                      >
                        {label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(item.id)}
                        aria-label="削除"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {/* Preview */}
                    <CardContent className="p-3">
                      {isCustom && code ? (
                        <SandboxFrame code={code} maxWidth="100%" />
                      ) : (
                        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-6">
                          <div
                            className={`h-8 w-8 rounded-lg ${colorClass} flex items-center justify-center`}
                          >
                            <Layers className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {label}コンポーネント
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Bottom toolbar */}
          {items.length > 0 && (
            <div className="sticky bottom-0 mt-4 flex items-center gap-3 rounded-lg border bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
              <Badge variant="secondary" className="text-xs">
                {items.length}コンポーネント
              </Badge>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                プレビュー
              </Button>
              <Button
                size="sm"
                onClick={handleDownloadZip}
                disabled={exporting}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                {exporting ? "エクスポート中..." : "ZIPダウンロード"}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
