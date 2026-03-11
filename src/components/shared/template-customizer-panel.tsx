"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import {
  type CustomizableTemplate,
  type TemplateParam,
  buildPrompt,
} from "@/lib/template-customizer";

type TemplateCustomizerPanelProps = {
  template: CustomizableTemplate;
  onSubmit: (prompt: string) => void;
  onClose: () => void;
};

const COLOR_PRESETS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

function ParamInput({
  param,
  value,
  onChange,
}: {
  param: TemplateParam;
  value: string;
  onChange: (v: string) => void;
}) {
  switch (param.type) {
    case "text":
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.placeholder}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      );

    case "number":
      return (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={param.min ?? 1}
            max={param.max ?? 10}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1"
          />
          <span className="w-8 text-center text-sm font-medium tabular-nums">
            {value}
          </span>
        </div>
      );

    case "select":
      return (
        <div className="flex flex-wrap gap-1.5">
          {param.options?.map((opt) => (
            <Badge
              key={opt}
              variant={value === opt ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() => onChange(opt)}
            >
              {opt}
            </Badge>
          ))}
        </div>
      );

    case "color":
      return (
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: value === c ? "currentColor" : "transparent",
              }}
              onClick={() => onChange(c)}
            />
          ))}
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        </div>
      );

    case "toggle":
      return (
        <button
          type="button"
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            value === "true" ? "bg-primary" : "bg-muted"
          }`}
          onClick={() => onChange(value === "true" ? "false" : "true")}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              value === "true" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      );

    default:
      return null;
  }
}

export function TemplateCustomizerPanel({
  template,
  onSubmit,
  onClose,
}: TemplateCustomizerPanelProps) {
  const defaults = useMemo(() => {
    const d: Record<string, string> = {};
    for (const p of template.params) {
      d[p.key] = p.defaultValue;
    }
    return d;
  }, [template]);

  const [values, setValues] = useState<Record<string, string>>(defaults);

  const preview = useMemo(
    () => buildPrompt(template, values),
    [template, values]
  );

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    setValues(defaults);
    toast("パラメータをリセットしました");
  }

  function handleSubmit() {
    onSubmit(preview);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/40"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 top-[100px] z-[70] mx-auto max-w-lg rounded-xl border bg-background shadow-2xl sm:inset-x-auto">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{template.title}</h3>
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

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-4 py-4">
          <p className="mb-4 text-xs text-muted-foreground">
            {template.description}
          </p>

          <div className="space-y-4">
            {template.params.map((param) => (
              <div key={param.key} className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  {param.label}
                </label>
                <ParamInput
                  param={param}
                  value={values[param.key] ?? param.defaultValue}
                  onChange={(v) => handleChange(param.key, v)}
                />
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              生成されるプロンプト
            </label>
            <div className="rounded-md bg-muted p-3 text-xs leading-relaxed">
              {preview}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-3 w-3" />
            リセット
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            <Wand2 className="mr-1.5 h-3 w-3" />
            このプロンプトで生成
          </Button>
        </div>
      </div>
    </>
  );
}
