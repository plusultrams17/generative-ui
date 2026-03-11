"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutTemplate,
  X,
  FormInput,
  Table2,
  BarChart3,
  Palette,
  Wand2,
} from "lucide-react";
import { TEMPLATES, type Template } from "@/lib/templates";
import {
  CUSTOMIZABLE_TEMPLATES,
  type CustomizableTemplate,
} from "@/lib/template-customizer";
import { TemplateCustomizerPanel } from "@/components/shared/template-customizer-panel";

const CATEGORY_CONFIG: Record<
  Template["category"],
  { label: string; icon: typeof FormInput }
> = {
  form: { label: "フォーム", icon: FormInput },
  table: { label: "テーブル", icon: Table2 },
  chart: { label: "チャート", icon: BarChart3 },
  custom: { label: "カスタム", icon: Palette },
};

type TemplateDrawerProps = {
  onSelect: (prompt: string) => void;
};

export function TemplateDrawer({ onSelect }: TemplateDrawerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    Template["category"] | null
  >(null);
  const [customizing, setCustomizing] = useState<CustomizableTemplate | null>(
    null
  );

  const filtered = activeCategory
    ? TEMPLATES.filter((t) => t.category === activeCategory)
    : TEMPLATES;

  function handleSelect(prompt: string) {
    onSelect(prompt);
    setOpen(false);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="テンプレート"
      >
        <LayoutTemplate className="h-4 w-4" />
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 flex h-full w-80 flex-col border-r bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold">テンプレート</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-1 border-b px-4 py-2">
              <Badge
                className="cursor-pointer select-none"
                variant={activeCategory === null ? "default" : "outline"}
                onClick={() => setActiveCategory(null)}
              >
                すべて
              </Badge>
              {(
                Object.entries(CATEGORY_CONFIG) as [
                  Template["category"],
                  (typeof CATEGORY_CONFIG)[Template["category"]],
                ][]
              ).map(([key, cfg]) => (
                <Badge
                  key={key}
                  className="cursor-pointer select-none"
                  variant={activeCategory === key ? "default" : "outline"}
                  onClick={() => setActiveCategory(key)}
                >
                  {cfg.label}
                </Badge>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="divide-y">
                {filtered.map((template) => {
                  const CategoryIcon =
                    CATEGORY_CONFIG[template.category].icon;
                  return (
                    <button
                      key={template.id}
                      className="group flex w-full items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                      onClick={() => handleSelect(template.prompt)}
                    >
                      <div className="mt-0.5 rounded-md bg-muted p-2">
                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {template.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          const customizable = CUSTOMIZABLE_TEMPLATES.find(
                            (ct) => ct.category === template.category
                          );
                          if (customizable) setCustomizing(customizable);
                        }}
                        title="カスタマイズ"
                      >
                        <Wand2 className="h-3 w-3" />
                      </Button>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {customizing && (
        <TemplateCustomizerPanel
          template={customizing}
          onSubmit={(prompt) => {
            handleSelect(prompt);
            setCustomizing(null);
          }}
          onClose={() => setCustomizing(null)}
        />
      )}
    </>
  );
}
