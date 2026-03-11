"use client";

import {
  useAnimationStore,
  ANIMATION_PRESETS,
} from "@/stores/animation-store";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, X } from "lucide-react";

type AnimationPanelProps = {
  open: boolean;
  onClose: () => void;
};

const EASING_OPTIONS = [
  { label: "ease", value: "ease" },
  { label: "ease-in", value: "ease-in" },
  { label: "ease-out", value: "ease-out" },
  { label: "ease-in-out", value: "ease-in-out" },
  { label: "linear", value: "linear" },
];

export function AnimationPanel({ open, onClose }: AnimationPanelProps) {
  const { config, setConfig, resetConfig } = useAnimationStore();

  if (!open) return null;

  const isActive = config.preset !== "none";

  function handlePreview() {
    // Briefly set to "none" then restore to re-trigger the animation in sandbox
    const current = config.preset;
    setConfig({ preset: "none" });
    setTimeout(() => {
      setConfig({ preset: current });
    }, 50);
  }

  return (
    <div className="absolute inset-y-0 right-0 z-20 flex w-72 flex-col border-l bg-background shadow-lg animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">アニメーション</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Preset grid */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">プリセット</span>
          <div className="grid grid-cols-3 gap-1.5">
            {ANIMATION_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setConfig({ preset: preset.name })}
                className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                  config.preset === preset.name
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:border-primary/50 hover:bg-muted"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls - only when an animation is selected */}
        {isActive && (
          <>
            {/* Duration */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">時間</label>
                <span className="text-xs font-mono text-muted-foreground">{config.duration}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={2}
                step={0.1}
                value={parseFloat(config.duration)}
                onChange={(e) => setConfig({ duration: `${e.target.value}s` })}
                className="w-full accent-primary"
              />
            </div>

            {/* Delay */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">遅延</label>
                <span className="text-xs font-mono text-muted-foreground">{config.delay}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={parseFloat(config.delay)}
                onChange={(e) => setConfig({ delay: `${e.target.value}s` })}
                className="w-full accent-primary"
              />
            </div>

            {/* Easing */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">イージング</label>
              <select
                value={config.easing}
                onChange={(e) => setConfig({ easing: e.target.value })}
                className="h-8 w-full rounded border bg-transparent px-2 text-xs"
              >
                {EASING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Repeat toggle */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">繰り返し</label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setConfig({ iterationCount: "1" })}
                  className={`flex-1 rounded-md border px-3 py-1.5 text-xs transition-colors ${
                    config.iterationCount === "1"
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:border-primary/50 hover:bg-muted"
                  }`}
                >
                  1回
                </button>
                <button
                  onClick={() => setConfig({ iterationCount: "infinite" })}
                  className={`flex-1 rounded-md border px-3 py-1.5 text-xs transition-colors ${
                    config.iterationCount === "infinite"
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:border-primary/50 hover:bg-muted"
                  }`}
                >
                  ループ
                </button>
              </div>
            </div>

            {/* Preview button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handlePreview}
            >
              <Play className="mr-1.5 h-3.5 w-3.5" />
              プレビュー
            </Button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={resetConfig}
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          リセット
        </Button>
      </div>
    </div>
  );
}
