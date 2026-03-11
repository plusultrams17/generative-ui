"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, X, Maximize2, Minimize2 } from "lucide-react";
import {
  DEVICE_PRESETS,
  TAILWIND_BREAKPOINTS,
  getActiveBreakpoints,
  getDeviceForWidth,
  type DevicePreset,
} from "@/lib/responsive-presets";

type ResponsiveEditorProps = {
  currentWidth: string;
  onWidthChange: (width: string) => void;
  open: boolean;
  onClose: () => void;
};

const CATEGORY_LABELS: Record<DevicePreset["category"], string> = {
  phone: "スマートフォン",
  tablet: "タブレット",
  laptop: "ラップトップ",
  desktop: "デスクトップ",
};

const CATEGORIES: DevicePreset["category"][] = ["phone", "tablet", "laptop", "desktop"];

function parseWidth(width: string): number {
  const n = parseInt(width, 10);
  return isNaN(n) ? 1024 : n;
}

export function ResponsiveEditor({
  currentWidth,
  onWidthChange,
  open,
  onClose,
}: ResponsiveEditorProps) {
  const [isLandscape, setIsLandscape] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<DevicePreset | null>(null);

  const numericWidth = parseWidth(currentWidth);

  const activeBreakpoints = useMemo(
    () => getActiveBreakpoints(numericWidth),
    [numericWidth]
  );

  const matchedDevice = useMemo(
    () => getDeviceForWidth(numericWidth),
    [numericWidth]
  );

  const groupedPresets = useMemo(() => {
    const groups: Record<DevicePreset["category"], DevicePreset[]> = {
      phone: [],
      tablet: [],
      laptop: [],
      desktop: [],
    };
    for (const preset of DEVICE_PRESETS) {
      groups[preset.category].push(preset);
    }
    return groups;
  }, []);

  function handlePresetClick(preset: DevicePreset) {
    setSelectedPreset(preset);
    const w = isLandscape ? preset.height : preset.width;
    onWidthChange(String(w));
  }

  function handleSliderChange(value: number) {
    setSelectedPreset(null);
    onWidthChange(String(value));
  }

  function handleInputChange(value: string) {
    const n = parseInt(value, 10);
    if (!isNaN(n) && n >= 320 && n <= 3840) {
      setSelectedPreset(null);
      onWidthChange(String(n));
    }
  }

  function handleOrientationToggle() {
    const next = !isLandscape;
    setIsLandscape(next);
    if (selectedPreset) {
      const w = next ? selectedPreset.height : selectedPreset.width;
      onWidthChange(String(w));
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/30"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-full flex-col border-l bg-background shadow-xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">レスポンシブエディタ</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Current width display */}
          <div className="rounded-lg border bg-muted/50 p-3 text-center">
            <div className="text-2xl font-bold tabular-nums">{numericWidth}px</div>
            {matchedDevice && (
              <div className="mt-1 text-xs text-muted-foreground">
                {matchedDevice.icon} {matchedDevice.name}
              </div>
            )}
          </div>

          {/* Breakpoint indicators */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              有効なブレイクポイント
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TAILWIND_BREAKPOINTS.map((bp) => {
                const isActive = activeBreakpoints.includes(bp.name);
                return (
                  <Badge
                    key={bp.name}
                    variant="outline"
                    className="text-xs transition-opacity"
                    style={{
                      borderColor: isActive ? bp.color : undefined,
                      color: isActive ? bp.color : undefined,
                      opacity: isActive ? 1 : 0.35,
                    }}
                  >
                    {bp.name} ({bp.minWidth}px)
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Custom width controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">カスタム幅</span>
              <div className="flex items-center gap-1">
                <Button
                  variant={isLandscape ? "default" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleOrientationToggle}
                  title={isLandscape ? "縦向きに切替" : "横向きに切替"}
                >
                  {isLandscape ? (
                    <Maximize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Minimize2 className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setSelectedPreset(null);
                    setIsLandscape(false);
                    onWidthChange("1024");
                  }}
                  title="リセット"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <input
              type="range"
              min={320}
              max={3840}
              step={1}
              value={numericWidth}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={320}
                max={3840}
                value={numericWidth}
                onChange={(e) => handleInputChange(e.target.value)}
                className="h-8 w-full rounded border bg-transparent px-2 text-xs font-mono tabular-nums"
              />
              <span className="shrink-0 text-xs text-muted-foreground">px</span>
            </div>
          </div>

          {/* Device presets */}
          {CATEGORIES.map((category) => {
            const presets = groupedPresets[category];
            if (presets.length === 0) return null;
            return (
              <div key={category} className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {CATEGORY_LABELS[category]}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {presets.map((preset) => {
                    const isSelected =
                      selectedPreset?.name === preset.name ||
                      (!selectedPreset && numericWidth === (isLandscape ? preset.height : preset.width));
                    return (
                      <button
                        key={preset.name}
                        onClick={() => handlePresetClick(preset)}
                        className={`rounded-md border p-2 text-left text-xs transition-colors hover:bg-accent ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span>{preset.icon}</span>
                          <span className="truncate font-medium">{preset.name}</span>
                        </div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground tabular-nums">
                          {isLandscape
                            ? `${preset.height} x ${preset.width}`
                            : `${preset.width} x ${preset.height}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
