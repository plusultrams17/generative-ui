"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Palette } from "lucide-react";

export type DesignStyle =
  | "auto"
  | "modern"
  | "glassmorphism"
  | "neobrutalism"
  | "corporate"
  | "playful"
  | "dark-luxury"
  | "japanese";

type StyleOption = {
  id: DesignStyle;
  label: string;
  description: string;
  color: string;
};

const STYLE_OPTIONS: StyleOption[] = [
  { id: "auto", label: "おまかせ", description: "AIが最適なスタイルを選択", color: "bg-gradient-to-r from-violet-500 to-pink-500" },
  { id: "modern", label: "モダン", description: "ミニマル・洗練・余白重視", color: "bg-slate-500" },
  { id: "glassmorphism", label: "グラス", description: "半透明・ぼかし・グラデーション", color: "bg-sky-400" },
  { id: "neobrutalism", label: "ネオブルータル", description: "太枠・鮮やか・大胆", color: "bg-yellow-400" },
  { id: "corporate", label: "ビジネス", description: "信頼感・青系・整然", color: "bg-blue-600" },
  { id: "playful", label: "ポップ", description: "カラフル・丸み・楽しい", color: "bg-pink-500" },
  { id: "dark-luxury", label: "ダーク", description: "高級感・暗い背景・ゴールド", color: "bg-zinc-800" },
  { id: "japanese", label: "和風", description: "余白・和カラー・上品", color: "bg-emerald-700" },
];

type StyleSelectorProps = {
  selectedStyle: DesignStyle;
  onStyleChange: (style: DesignStyle) => void;
};

export function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  const [open, setOpen] = useState(false);
  const selected = STYLE_OPTIONS.find((s) => s.id === selectedStyle);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => setOpen(!open)}
      >
        <Palette className="h-3 w-3" />
        {selected?.label || "スタイル"}
        <ChevronDown className="h-3 w-3" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border bg-popover p-1 shadow-lg">
            {STYLE_OPTIONS.map((style) => (
              <button
                key={style.id}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted"
                onClick={() => {
                  onStyleChange(style.id);
                  setOpen(false);
                }}
              >
                <div className={`h-4 w-4 shrink-0 rounded-full ${style.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{style.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{style.description}</p>
                </div>
                {style.id === selectedStyle && (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
