"use client";

import { useThemeCustomStore, BUILT_IN_PRESETS } from "@/stores/theme-custom-store";
import { Button } from "@/components/ui/button";
import { Palette, RotateCcw, X } from "lucide-react";

type ThemeCustomizerProps = {
  open: boolean;
  onClose: () => void;
};

const FONT_OPTIONS = [
  { label: "システム", value: "system-ui, sans-serif" },
  { label: "Noto Sans JP", value: "'Noto Sans JP', sans-serif" },
  { label: "Georgia (セリフ)", value: "Georgia, serif" },
  { label: "Fira Code (等幅)", value: "'Fira Code', monospace" },
];

const PRESET_COLORS: Record<string, string> = {
  "デフォルト": "#2563eb",
  "ダーク": "#1e293b",
  "ウォーム": "#d97706",
  "モノクロ": "#374151",
  "ネオン": "#06b6d4",
};

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded border bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 flex-1 rounded border bg-transparent px-2 text-xs font-mono"
          maxLength={7}
        />
      </div>
    </div>
  );
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: string) => void;
}) {
  const numericValue = parseFloat(value);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs font-mono text-muted-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numericValue}
        onChange={(e) => onChange(`${e.target.value}${unit}`)}
        className="w-full accent-primary"
      />
    </div>
  );
}

export function ThemeCustomizer({ open, onClose }: ThemeCustomizerProps) {
  const { tokens, setToken, resetTokens, applyPreset } = useThemeCustomStore();

  if (!open) return null;

  return (
    <div className="absolute inset-y-0 right-0 z-20 flex w-72 flex-col border-l bg-background shadow-lg animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">テーマカスタマイズ</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Presets */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">プリセット</span>
          <div className="flex items-center gap-2">
            {BUILT_IN_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.name)}
                title={preset.name}
                className="h-7 w-7 rounded-full border-2 border-transparent transition-all hover:scale-110 hover:border-primary"
                style={{ backgroundColor: PRESET_COLORS[preset.name] || preset.tokens.primaryColor }}
              />
            ))}
          </div>
        </div>

        {/* Color inputs */}
        <ColorInput
          label="プライマリカラー"
          value={tokens.primaryColor}
          onChange={(v) => setToken("primaryColor", v)}
        />
        <ColorInput
          label="背景色"
          value={tokens.backgroundColor}
          onChange={(v) => setToken("backgroundColor", v)}
        />
        <ColorInput
          label="テキスト色"
          value={tokens.textColor}
          onChange={(v) => setToken("textColor", v)}
        />
        <ColorInput
          label="アクセントカラー"
          value={tokens.accentColor}
          onChange={(v) => setToken("accentColor", v)}
        />

        {/* Border radius */}
        <SliderInput
          label="角丸"
          value={tokens.borderRadius}
          min={0}
          max={1.5}
          step={0.125}
          unit="rem"
          onChange={(v) => setToken("borderRadius", v)}
        />

        {/* Font family */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">フォント</label>
          <select
            value={tokens.fontFamily}
            onChange={(e) => setToken("fontFamily", e.target.value)}
            className="h-8 w-full rounded border bg-transparent px-2 text-xs"
          >
            {FONT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Spacing */}
        <SliderInput
          label="余白"
          value={tokens.spacing}
          min={0.5}
          max={2}
          step={0.25}
          unit="rem"
          onChange={(v) => setToken("spacing", v)}
        />
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={resetTokens}
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          リセット
        </Button>
      </div>
    </div>
  );
}
