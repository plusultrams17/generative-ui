"use client";

import { useHistoryStore, type HistoryEntry } from "@/stores/history-store";
import { Button } from "@/components/ui/button";
import { History, Trash2, X, FormInput, Table2, BarChart3, Palette, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { TOOL_LABELS } from "@/lib/shared-constants";

const TOOL_ICONS: Record<string, typeof FormInput> = {
  showForm: FormInput,
  showTable: Table2,
  showChart: BarChart3,
  generateCustomComponent: Palette,
};

type HistoryPanelProps = {
  onReuse: (prompt: string) => void;
};

export function HistoryPanel({ onReuse }: HistoryPanelProps) {
  const [open, setOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const entries = useHistoryStore((s) => s.entries);
  const removeEntry = useHistoryStore((s) => s.removeEntry);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  // Escape key to close panel
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (confirmClear) {
          setConfirmClear(false);
        } else {
          setOpen(false);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, confirmClear]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="履歴"
        className="relative"
      >
        <History className="h-4 w-4" />
        {entries.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {entries.length > 99 ? "99+" : entries.length}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold">生成履歴</h2>
              <div className="flex items-center gap-1">
                {entries.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => setConfirmClear(true)}
                  >
                    全削除
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Clear confirmation */}
            {confirmClear && (
              <div className="border-b bg-destructive/5 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  すべての履歴を削除しますか？
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  この操作は元に戻せません
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      clearHistory();
                      setConfirmClear(false);
                    }}
                  >
                    削除する
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setConfirmClear(false)}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                  <History className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    まだ生成履歴がありません
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {entries.map((entry: HistoryEntry) => {
                    const Icon = TOOL_ICONS[entry.toolName] || Palette;
                    return (
                      <div
                        key={entry.id}
                        className="group flex items-start gap-3 p-3 hover:bg-muted/50"
                      >
                        <div className="mt-0.5 rounded-md bg-muted p-1.5">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">
                            {(entry.toolData.title as string) || entry.toolName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.prompt}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">
                              {TOOL_LABELS[entry.toolName] || entry.toolName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleDateString("ja-JP", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 h-6 text-xs"
                            onClick={() => {
                              onReuse(entry.prompt);
                              setOpen(false);
                            }}
                          >
                            再利用
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => removeEntry(entry.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
