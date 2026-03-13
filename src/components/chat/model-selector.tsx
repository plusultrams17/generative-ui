"use client";

import { AVAILABLE_MODELS, type ModelConfig } from "@/lib/models";
import { useAuthStore } from "@/stores/auth-store";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Cpu, Lock, Crown } from "lucide-react";

type ModelSelectorProps = {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
};

export function ModelSelector({
  selectedModelId,
  onModelChange,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const openUpgrade = useUpgradeStore((s) => s.openUpgrade);
  const isPro = profile?.plan === "pro";
  const selected = AVAILABLE_MODELS.find((m) => m.id === selectedModelId);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => setOpen(!open)}
      >
        <Cpu className="h-3 w-3" />
        {selected?.label || "モデル選択"}
        <ChevronDown className="h-3 w-3" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border bg-popover p-1 shadow-lg">
            {AVAILABLE_MODELS.map((model: ModelConfig) => {
              const locked = model.proOnly && !isPro;
              return (
                <button
                  key={model.id}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left ${
                    locked
                      ? "cursor-pointer opacity-60 hover:bg-muted/50"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    if (locked) {
                      setOpen(false);
                      openUpgrade("model_locked", {
                        lockedModelName: model.label,
                        lockedModelDescription: model.description,
                      });
                      return;
                    }
                    onModelChange(model.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium">{model.label}</p>
                      {model.proOnly && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <Crown className="h-2.5 w-2.5" />
                          Pro
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {model.description}
                    </p>
                  </div>
                  {locked ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : model.id === selectedModelId ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : null}
                </button>
              );
            })}
            {!isPro && (
              <div className="mt-1 border-t pt-1">
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-primary hover:bg-muted"
                  onClick={() => {
                    setOpen(false);
                    openUpgrade("general");
                  }}
                >
                  <Crown className="h-3.5 w-3.5" />
                  全AIモデルを使うにはProプランへ
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
