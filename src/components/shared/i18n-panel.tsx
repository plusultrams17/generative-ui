"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Languages, Copy, Check, X } from "lucide-react";
import { HighlightedCode } from "@/components/shared/highlighted-code";
import { toast } from "sonner";
import {
  generateI18nCode,
  LOCALE_LABELS,
  type I18nLocale,
  type I18nResult,
} from "@/lib/i18n-generator";

type I18nPanelProps = {
  code: string;
  open: boolean;
  onClose: () => void;
};

const LOCALES: I18nLocale[] = ["ja", "en", "zh", "ko", "es", "fr"];

export function I18nPanel({ code, open, onClose }: I18nPanelProps) {
  const [selectedLocale, setSelectedLocale] = useState<I18nLocale>("ja");
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeTab, setActiveTab] = useState<"texts" | "setup" | "component">("texts");

  const i18nResult: I18nResult = useMemo(() => generateI18nCode(code), [code]);

  if (!open) return null;

  const handleCopyJson = () => {
    const json = JSON.stringify(i18nResult.translations, null, 2);
    navigator.clipboard.writeText(json);
    setCopiedJson(true);
    toast.success("翻訳JSONをコピーしました");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const currentTranslations = i18nResult.translations[selectedLocale];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-96 max-w-full overflow-y-auto border-l bg-background shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            <h2 className="text-lg font-semibold">多言語化 (i18n)</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Extracted text count */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              検出テキスト: {i18nResult.extractedTexts.length}件
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
            >
              {copiedJson ? (
                <Check className="mr-1 h-3.5 w-3.5" />
              ) : (
                <Copy className="mr-1 h-3.5 w-3.5" />
              )}
              JSONコピー
            </Button>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
            <Button
              variant={activeTab === "texts" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab("texts")}
            >
              テキスト
            </Button>
            <Button
              variant={activeTab === "setup" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab("setup")}
            >
              セットアップ
            </Button>
            <Button
              variant={activeTab === "component" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab("component")}
            >
              コンポーネント
            </Button>
          </div>

          {activeTab === "texts" && (
            <>
              {/* Language tabs */}
              <div className="flex flex-wrap gap-1">
                {LOCALES.map((locale) => (
                  <Button
                    key={locale}
                    variant={selectedLocale === locale ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLocale(locale)}
                    className="text-xs"
                  >
                    {LOCALE_LABELS[locale]}
                  </Button>
                ))}
              </div>

              {/* Text list */}
              {i18nResult.extractedTexts.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  テキストが検出されませんでした
                </div>
              ) : (
                <div className="space-y-2">
                  {i18nResult.extractedTexts.map((text, index) => (
                    <div
                      key={index}
                      className="rounded-lg border p-3 text-sm space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {text.key}
                        </code>
                        {text.context && (
                          <Badge variant="outline" className="text-[10px]">
                            {text.context}
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {text.original}
                      </div>
                      <div className="font-medium">
                        {currentTranslations[text.key] || text.original}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "setup" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                react-intl を使用したセットアップコード
              </p>
              <HighlightedCode
                code={i18nResult.i18nSetupCode}
                maxHeight="500px"
              />
            </div>
          )}

          {activeTab === "component" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                i18n化されたコンポーネントコード
              </p>
              <HighlightedCode
                code={i18nResult.componentCode}
                maxHeight="500px"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
