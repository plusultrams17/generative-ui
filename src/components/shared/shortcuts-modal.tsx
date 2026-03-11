"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ShortcutsModalProps = {
  open: boolean;
  onClose: () => void;
};

const SHORTCUT_GROUPS = [
  {
    category: "ナビゲーション",
    items: [
      { keys: ["Ctrl", "K"], description: "チャット入力にフォーカス" },
      { keys: ["Ctrl", "/"], description: "ショートカット一覧" },
    ],
  },
  {
    category: "入力",
    items: [
      { keys: ["Enter"], description: "メッセージ送信" },
      { keys: ["Shift", "Enter"], description: "改行" },
    ],
  },
  {
    category: "その他",
    items: [{ keys: ["Escape"], description: "モーダルを閉じる" }],
  },
];

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">キーボードショートカット</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-medium text-muted-foreground mb-2">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div
                    key={item.description}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
                  >
                    <span>{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key) => (
                        <kbd
                          key={key}
                          className="rounded border bg-muted px-1.5 py-0.5 text-xs font-mono"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
