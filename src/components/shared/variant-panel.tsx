"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Layers, RotateCcw, X, Check } from "lucide-react";
import {
  generateVariants,
  type VariantType,
  type ComponentVariant,
} from "@/lib/variant-generator";

type VariantPanelProps = {
  originalCode: string;
  onSelectVariant: (code: string, variantType: VariantType | null) => void;
  open: boolean;
  onClose: () => void;
  activeVariant: VariantType | null;
};

const VARIANT_ICONS: Record<VariantType, { bg: string; icon: string }> = {
  dark: { bg: "bg-gray-800", icon: "text-gray-100" },
  compact: { bg: "bg-blue-100", icon: "text-blue-700" },
  rounded: { bg: "bg-pink-100", icon: "text-pink-700" },
  bordered: { bg: "bg-amber-100", icon: "text-amber-700" },
  colorful: {
    bg: "bg-gradient-to-br from-purple-400 to-pink-400",
    icon: "text-white",
  },
  minimal: { bg: "bg-gray-100", icon: "text-gray-500" },
};

const VARIANT_SYMBOLS: Record<VariantType, string> = {
  dark: "D",
  compact: "C",
  rounded: "R",
  bordered: "B",
  colorful: "G",
  minimal: "M",
};

export function VariantPanel({
  originalCode,
  onSelectVariant,
  open,
  onClose,
  activeVariant,
}: VariantPanelProps) {
  const variants = useMemo(
    () => generateVariants(originalCode),
    [originalCode]
  );

  if (!open) return null;

  function handleSelect(variant: ComponentVariant) {
    onSelectVariant(variant.code, variant.type);
  }

  function handleRevert() {
    onSelectVariant(originalCode, null);
  }

  return (
    <div className="absolute inset-y-0 right-0 z-20 flex w-80 flex-col border-l bg-background shadow-lg animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">バリアント生成</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Variant Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {variants.map((variant) => {
            const isActive = activeVariant === variant.type;
            const style = VARIANT_ICONS[variant.type];
            return (
              <button
                key={variant.type}
                onClick={() => handleSelect(variant)}
                className={`group relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all hover:border-primary/50 hover:bg-muted/50 ${
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border"
                }`}
              >
                {/* Icon/Preview */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold ${style.bg} ${style.icon}`}
                >
                  {VARIANT_SYMBOLS[variant.type]}
                </div>
                {/* Label */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">
                      {variant.label}
                    </span>
                    {isActive && (
                      <Check className="h-3 w-3 text-primary" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                    {variant.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleRevert}
          disabled={activeVariant === null}
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          オリジナルに戻す
        </Button>
      </div>
    </div>
  );
}
