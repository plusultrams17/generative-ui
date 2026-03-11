"use client";

import { useState } from "react";

type RefinementChipsProps = {
  toolName: string;
  onRefine: (refinement: string) => void;
};

const REFINEMENTS_BY_TOOL: Record<string, string[]> = {
  showForm: [
    "バリデーション追加",
    "フィールド追加",
    "レイアウト変更",
    "ダークモード対応",
    "レスポンシブ対応",
  ],
  showTable: [
    "列を追加",
    "ソート機能",
    "ページネーション追加",
    "レイアウト変更",
    "ダークモード対応",
  ],
  showChart: [
    "チャート種類変更",
    "色を変更",
    "データ追加",
    "アニメーション追加",
    "レスポンシブ対応",
  ],
  generateCustomComponent: [
    "色を変更",
    "アニメーション追加",
    "レスポンシブ対応",
    "サイズ調整",
    "ダークモード対応",
  ],
};

const DEFAULT_REFINEMENTS = [
  "色を変更",
  "サイズ調整",
  "レイアウト変更",
  "ダークモード対応",
  "アニメーション追加",
];

export function RefinementChips({ toolName, onRefine }: RefinementChipsProps) {
  const refinements = REFINEMENTS_BY_TOOL[toolName] ?? DEFAULT_REFINEMENTS;
  const [clickedLabel, setClickedLabel] = useState<string | null>(null);

  function handleClick(label: string) {
    setClickedLabel(label);
    onRefine(label);
  }

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {refinements.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => handleClick(label)}
          disabled={clickedLabel !== null}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            clickedLabel === label
              ? "border-primary bg-primary/10 text-primary"
              : clickedLabel !== null
                ? "border-border bg-card text-muted-foreground/50 cursor-not-allowed"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          }`}
        >
          {clickedLabel === label ? `${label}...` : label}
        </button>
      ))}
    </div>
  );
}
