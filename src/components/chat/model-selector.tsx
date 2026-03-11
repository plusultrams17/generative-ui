"use client";

import { AVAILABLE_MODELS, type ModelConfig } from "@/lib/models";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Cpu } from "lucide-react";

type ModelSelectorProps = {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
};

export function ModelSelector({
  selectedModelId,
  onModelChange,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
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
          <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border bg-popover p-1 shadow-lg">
            {AVAILABLE_MODELS.map((model: ModelConfig) => (
              <button
                key={model.id}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted"
                onClick={() => {
                  onModelChange(model.id);
                  setOpen(false);
                }}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{model.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {model.description}
                  </p>
                </div>
                {model.id === selectedModelId && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
