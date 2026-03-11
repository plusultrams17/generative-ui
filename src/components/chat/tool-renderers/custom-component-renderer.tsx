"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SandboxFrame } from "@/components/sandbox/sandbox-frame";
import { Code, Eye, Copy, Check, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp, Smartphone, Tablet, Monitor, MonitorSmartphone, History, Accessibility, Palette, Gauge, Play, Layers, FileText, FlaskConical, Languages, BookOpen, Zap, MessageSquareCode, GitFork } from "lucide-react";
import { toast } from "sonner";
import { scanCode, getHighestSeverity, type SecurityIssue } from "@/lib/security-scanner";
import { scanA11y, getHighestA11ySeverity } from "@/lib/a11y-scanner";
import { analyzeCode, getOptimizationScore } from "@/lib/code-optimizer";
import { A11yReport } from "@/components/shared/a11y-report";
import { OptimizerReport } from "@/components/shared/optimizer-report";
import { useVersionStore, type ComponentVersion } from "@/stores/version-store";
import { VersionTimeline } from "@/components/shared/version-timeline";
import { useThemeCustomStore } from "@/stores/theme-custom-store";
import { ThemeCustomizer } from "@/components/shared/theme-customizer";
import { useAnimationStore } from "@/stores/animation-store";
import { AnimationPanel } from "@/components/shared/animation-panel";
import { VariantPanel } from "@/components/shared/variant-panel";
import type { VariantType } from "@/lib/variant-generator";
import { generateDocs } from "@/lib/doc-generator";
import { DocPreview } from "@/components/shared/doc-preview";
import { generateTests } from "@/lib/test-generator";
import { TestPreview } from "@/components/shared/test-preview";
import { HighlightedCode } from "@/components/shared/highlighted-code";
import { I18nPanel } from "@/components/shared/i18n-panel";
import { generateStorybook } from "@/lib/storybook-generator";
import { StorybookPreview } from "@/components/shared/storybook-preview";
import { analyzePerformance } from "@/lib/perf-analyzer";
import { PerfPanel } from "@/components/shared/perf-panel";
import { ResponsiveEditor } from "@/components/shared/responsive-editor";
import { CodeChat } from "@/components/shared/code-chat";
import { analyzeDependencies } from "@/lib/dependency-analyzer";
import { DependencyGraphView } from "@/components/shared/dependency-graph";

const VARIANT_LABELS: Record<VariantType, string> = {
  dark: "ダーク",
  compact: "コンパクト",
  rounded: "まるみ",
  bordered: "ボーダー",
  colorful: "カラフル",
  minimal: "ミニマル",
};

type CustomComponentRendererProps = {
  title: string;
  description: string;
  code: string;
  userPrompt?: string;
};

const VIEWPORT_CONFIG = {
  mobile: { label: "モバイル", width: "375px", icon: Smartphone },
  tablet: { label: "タブレット", width: "768px", icon: Tablet },
  desktop: { label: "デスクトップ", width: "100%", icon: Monitor },
  custom: { label: "カスタム", width: "100%", icon: MonitorSmartphone },
} as const;

const VIEWPORT_BAR_KEYS = ["mobile", "tablet", "desktop"] as const;

const SEVERITY_STYLES = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
};

const SEVERITY_LABELS = {
  high: "高リスク",
  medium: "中リスク",
  low: "低リスク",
};

function generateComponentId(title: string, description: string): string {
  const input = `${title}::${description}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `comp-${Math.abs(hash).toString(36)}`;
}

export function CustomComponentRenderer({
  title,
  description,
  code,
  userPrompt,
}: CustomComponentRendererProps) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showScanDetails, setShowScanDetails] = useState(false);
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop" | "custom">("desktop");
  const [customWidth, setCustomWidth] = useState("1024px");
  const [showResponsiveEditor, setShowResponsiveEditor] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showAnimationPanel, setShowAnimationPanel] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [overrideCode, setOverrideCode] = useState<string | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<string | undefined>();
  const [showVariantPanel, setShowVariantPanel] = useState(false);
  const [activeVariant, setActiveVariant] = useState<VariantType | null>(null);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [showTestPreview, setShowTestPreview] = useState(false);
  const [showI18nPanel, setShowI18nPanel] = useState(false);
  const [showStorybook, setShowStorybook] = useState(false);
  const [showPerfPanel, setShowPerfPanel] = useState(false);
  const [showCodeChat, setShowCodeChat] = useState(false);
  const [showDepGraph, setShowDepGraph] = useState(false);

  const themeTokens = useThemeCustomStore((s) => s.tokens);
  const animationCSS = useAnimationStore((s) => s.getAnimationCSS)();

  const componentId = useMemo(
    () => generateComponentId(title, description),
    [title, description]
  );

  const addVersion = useVersionStore((s) => s.addVersion);
  const getVersions = useVersionStore((s) => s.getVersions);
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    const existing = getVersions(componentId);
    const alreadySaved = existing.some((v) => v.code === code);
    if (!alreadySaved) {
      const newVersion = addVersion(
        componentId,
        userPrompt || "",
        "generateCustomComponent",
        { title, description },
        code
      );
      setCurrentVersionId(newVersion.id);
    } else {
      const match = existing.find((v) => v.code === code);
      if (match) setCurrentVersionId(match.id);
    }
  }, [componentId, code, userPrompt, title, description, addVersion, getVersions]);

  const handleSelectVersion = useCallback((version: ComponentVersion) => {
    if (version.code) {
      setOverrideCode(version.code);
      setCurrentVersionId(version.id);
      setActiveVariant(null);
      toast.success(`v${version.version} にロールバックしました`);
    }
  }, []);

  const handleApplyPatch = useCallback((newCode: string) => {
    setOverrideCode(newCode);
    toast.success("パッチを適用しました");
  }, []);

  const handleSelectVariant = useCallback(
    (variantCode: string, variantType: VariantType | null) => {
      if (variantType === null) {
        // Reverting to original
        setOverrideCode(null);
        setActiveVariant(null);
        toast.success("オリジナルに戻しました");
      } else {
        setOverrideCode(variantCode);
        setActiveVariant(variantType);
      }
    },
    []
  );

  const displayCode = overrideCode ?? code;
  const versionCount = getVersions(componentId).length;

  const securityIssues = useMemo(() => scanCode(displayCode), [displayCode]);
  const severity = getHighestSeverity(securityIssues);

  const a11yIssues = useMemo(() => scanA11y(displayCode), [displayCode]);
  const a11ySeverity = getHighestA11ySeverity(a11yIssues);

  const optimizationItems = useMemo(() => analyzeCode(displayCode), [displayCode]);
  const optimizationScore = useMemo(() => getOptimizationScore(optimizationItems), [optimizationItems]);

  const componentDoc = useMemo(
    () => generateDocs(displayCode, title, description),
    [displayCode, title, description]
  );

  const generatedTests = useMemo(
    () => generateTests(displayCode, title),
    [displayCode, title]
  );

  const storybookResult = useMemo(
    () => generateStorybook(displayCode, title, description),
    [displayCode, title, description]
  );

  const perfResult = useMemo(
    () => analyzePerformance(displayCode),
    [displayCode]
  );

  const depGraph = useMemo(
    () => analyzeDependencies(displayCode, title),
    [displayCode, title]
  );

  function handleCopy() {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    toast.success("コピーしました");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="relative w-full overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2">
              <span className="truncate">{title}</span>
              <Badge variant="secondary">カスタム</Badge>
              {versionCount > 0 && (
                <Badge variant="outline" className="text-[10px]">
                  v{versionCount}
                </Badge>
              )}
              {activeVariant && (
                <Badge
                  variant="outline"
                  className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 text-[10px]"
                >
                  <Layers className="mr-1 h-3 w-3" />
                  {VARIANT_LABELS[activeVariant]}
                </Badge>
              )}
              {severity ? (
                <Badge variant="outline" className={SEVERITY_STYLES[severity]}>
                  <ShieldAlert className="mr-1 h-3 w-3" />
                  {SEVERITY_LABELS[severity]}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  安全
                </Badge>
              )}
              {a11ySeverity ? (
                <Badge
                  variant="outline"
                  className={
                    a11ySeverity === "error"
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : a11ySeverity === "warning"
                        ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
                        : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
                  }
                >
                  <Accessibility className="mr-1 h-3 w-3" />
                  {a11ySeverity === "error"
                    ? "A11y エラー"
                    : a11ySeverity === "warning"
                      ? "A11y 警告"
                      : "A11y 情報"}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
                  <Accessibility className="mr-1 h-3 w-3" />
                  アクセシブル
                </Badge>
              )}
              <Badge
                variant="outline"
                className={
                  optimizationScore >= 90
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
                    : optimizationScore >= 70
                      ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
                      : "bg-destructive/10 text-destructive border-destructive/30"
                }
              >
                <Gauge className="mr-1 h-3 w-3" />
                品質: {optimizationScore}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant={view === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("preview")}
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              プレビュー
            </Button>
            <Button
              variant={view === "code" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("code")}
            >
              <Code className="mr-1 h-3.5 w-3.5" />
              コード
            </Button>
            <Button
              variant={showTimeline ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowTimeline(!showTimeline)}
              title="バージョン履歴"
            >
              <History className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={showThemeCustomizer ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowThemeCustomizer(!showThemeCustomizer)}
              title="テーマカスタマイズ"
            >
              <Palette className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={showAnimationPanel ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowAnimationPanel(!showAnimationPanel)}
              title="アニメーション"
            >
              <Play className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={showVariantPanel ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowVariantPanel(!showVariantPanel)}
              title="バリアント"
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={showOptimizer ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowOptimizer(!showOptimizer)}
              title="コード品質"
            >
              <Gauge className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={showDocPreview ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowDocPreview(!showDocPreview)}
              title="ドキュメント"
            >
              <FileText className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={showTestPreview ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowTestPreview(!showTestPreview)}
              title="テスト生成"
            >
              <FlaskConical className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={showI18nPanel ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowI18nPanel(!showI18nPanel)}
              title="多言語化"
            >
              <Languages className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={showStorybook ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowStorybook(!showStorybook)}
              title="Storybook"
            >
              <BookOpen className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={showPerfPanel ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowPerfPanel(!showPerfPanel)}
              title="パフォーマンス"
            >
              <Zap className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={showCodeChat ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowCodeChat(!showCodeChat)}
              title="コードチャット"
            >
              <MessageSquareCode className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={showDepGraph ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowDepGraph(!showDepGraph)}
              title="依存関係"
            >
              <GitFork className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showTimeline && (
          <div className="mb-3">
            <VersionTimeline
              componentId={componentId}
              currentVersionId={currentVersionId}
              onSelectVersion={handleSelectVersion}
            />
          </div>
        )}

        {securityIssues.length > 0 && (
          <div className={`mb-3 rounded-lg border p-3 ${SEVERITY_STYLES[severity!]}`}>
            <button
              className="flex w-full items-center justify-between text-sm font-medium"
              onClick={() => setShowScanDetails(!showScanDetails)}
            >
              <span>
                <ShieldAlert className="mr-1.5 inline h-4 w-4" />
                セキュリティスキャン: {securityIssues.length}件の検出
              </span>
              {showScanDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {showScanDetails && (
              <ul className="mt-2 space-y-1 text-xs">
                {securityIssues.map((issue: SecurityIssue, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] ${SEVERITY_STYLES[issue.severity]}`}
                    >
                      {SEVERITY_LABELS[issue.severity]}
                    </Badge>
                    <span>
                      {issue.message}
                      {issue.line && (
                        <span className="ml-1 opacity-60">(行 {issue.line})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <A11yReport issues={a11yIssues} />

        {showOptimizer && (
          <OptimizerReport items={optimizationItems} score={optimizationScore} />
        )}

        {showDocPreview && <DocPreview doc={componentDoc} />}

        {showTestPreview && <TestPreview tests={generatedTests} />}

        {showStorybook && <StorybookPreview result={storybookResult} />}

        {showPerfPanel && <PerfPanel result={perfResult} />}

        {showDepGraph && <DependencyGraphView graph={depGraph} />}

        {view === "preview" ? (
          <div>
            <div className="mb-3 flex items-center justify-between rounded-lg border bg-muted/50 p-1">
              <div className="flex items-center gap-1">
                {VIEWPORT_BAR_KEYS.map((key) => {
                  const config = VIEWPORT_CONFIG[key];
                  const Icon = config.icon;
                  return (
                    <Button
                      key={key}
                      variant={viewport === key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewport(key)}
                    >
                      <Icon className="mr-1 h-3.5 w-3.5" />
                      {config.label}
                    </Button>
                  );
                })}
                <Button
                  variant={showResponsiveEditor ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowResponsiveEditor(!showResponsiveEditor)}
                >
                  <MonitorSmartphone className="mr-1 h-3.5 w-3.5" />
                  詳細
                </Button>
              </div>
              <span className="pr-2 text-xs text-muted-foreground">
                {viewport === "custom" ? customWidth : VIEWPORT_CONFIG[viewport].width}
              </span>
            </div>
            {error && (
              <div className="mb-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <SandboxFrame
              code={displayCode}
              onError={setError}
              onLoad={() => setError(null)}
              maxWidth={viewport === "custom" ? customWidth : VIEWPORT_CONFIG[viewport].width}
              themeTokens={themeTokens}
              animationCSS={animationCSS}
            />
          </div>
        ) : (
          <HighlightedCode code={displayCode} maxHeight="500px" />
        )}
      </CardContent>
      <ThemeCustomizer
        open={showThemeCustomizer}
        onClose={() => setShowThemeCustomizer(false)}
      />
      <AnimationPanel
        open={showAnimationPanel}
        onClose={() => setShowAnimationPanel(false)}
      />
      <VariantPanel
        originalCode={code}
        onSelectVariant={handleSelectVariant}
        open={showVariantPanel}
        onClose={() => setShowVariantPanel(false)}
        activeVariant={activeVariant}
      />
      <I18nPanel
        code={displayCode}
        open={showI18nPanel}
        onClose={() => setShowI18nPanel(false)}
      />
      <ResponsiveEditor
        currentWidth={viewport === "custom" ? customWidth : VIEWPORT_CONFIG[viewport].width}
        onWidthChange={(w) => {
          setViewport("custom");
          setCustomWidth(w.endsWith("px") ? w : w + "px");
        }}
        open={showResponsiveEditor}
        onClose={() => setShowResponsiveEditor(false)}
      />
      <CodeChat
        code={displayCode}
        onApply={handleApplyPatch}
        open={showCodeChat}
        onClose={() => setShowCodeChat(false)}
      />
    </Card>
  );
}
