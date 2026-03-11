"use client";

import {
  usePresentationStore,
  type Presentation,
  type PresentationSlide,
} from "@/stores/presentation-store";
import { useHistoryStore, type HistoryEntry } from "@/stores/history-store";
import { useProjectStore } from "@/stores/project-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Play,
  Edit3,
  ChevronUp,
  ChevronDown,
  X,
  Monitor,
  Type,
  LayoutGrid,
  Columns,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { TOOL_LABELS } from "@/lib/shared-constants";

// ─── Helpers ────────────────────────────────────────────────

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  return new Date(timestamp).toLocaleDateString("ja-JP");
}

const SLIDE_TYPE_OPTIONS = [
  {
    type: "title" as const,
    label: "タイトル",
    icon: Type,
    desc: "タイトル + サブテキスト",
  },
  {
    type: "ui_preview" as const,
    label: "UIプレビュー",
    icon: Monitor,
    desc: "生成UIの表示",
  },
  {
    type: "comparison" as const,
    label: "Before/After比較",
    icon: Columns,
    desc: "ビフォー・アフター",
  },
  {
    type: "text" as const,
    label: "テキスト",
    icon: FileText,
    desc: "自由テキスト",
  },
];

const SLIDE_TYPE_LABELS: Record<PresentationSlide["type"], string> = {
  title: "タイトル",
  ui_preview: "UIプレビュー",
  comparison: "比較",
  text: "テキスト",
};

// ─── Slide Add Dropdown ─────────────────────────────────────

function SlideAddDropdown({
  onAdd,
}: {
  onAdd: (type: PresentationSlide["type"]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(!open)}
      >
        <Plus className="h-3.5 w-3.5" />
        スライド追加
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border bg-popover p-1 shadow-lg">
            {SLIDE_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
                onClick={() => {
                  onAdd(opt.type);
                  setOpen(false);
                }}
              >
                <opt.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {opt.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── History Selector ───────────────────────────────────────

function HistorySelector({
  selectedId,
  onSelect,
}: {
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const entries = useHistoryStore((s) => s.entries);
  const [open, setOpen] = useState(false);
  const selected = entries.find((e) => e.id === selectedId);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 text-xs"
        onClick={() => setOpen(!open)}
      >
        {selected ? (
          <>
            <Badge variant="secondary" className="text-[9px]">
              {TOOL_LABELS[selected.toolName] || selected.toolName}
            </Badge>
            <span className="truncate">
              {(selected.toolData.title as string) || selected.prompt}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">生成UIを選択...</span>
        )}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-popover p-1 shadow-lg">
            {entries.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                生成履歴がありません
              </div>
            ) : (
              entries.map((entry) => (
                <button
                  key={entry.id}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs hover:bg-accent transition-colors ${
                    entry.id === selectedId ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    onSelect(entry.id);
                    setOpen(false);
                  }}
                >
                  <Badge variant="secondary" className="shrink-0 text-[9px]">
                    {TOOL_LABELS[entry.toolName] || entry.toolName}
                  </Badge>
                  <span className="truncate">
                    {(entry.toolData.title as string) || entry.prompt}
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Slide Editor ───────────────────────────────────────────

function SlideEditor({
  slide,
  onUpdate,
}: {
  slide: PresentationSlide;
  onUpdate: (updates: Partial<PresentationSlide>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{SLIDE_TYPE_LABELS[slide.type]}</Badge>
      </div>

      {(slide.type === "title" || slide.type === "ui_preview" || slide.type === "comparison") && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            タイトル
          </label>
          <Input
            value={slide.title || ""}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="スライドタイトル"
          />
        </div>
      )}

      {(slide.type === "title" || slide.type === "ui_preview") && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            説明文
          </label>
          <Textarea
            value={slide.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="説明を入力..."
            rows={3}
          />
        </div>
      )}

      {(slide.type === "ui_preview" || slide.type === "comparison") && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            生成UI
          </label>
          <HistorySelector
            selectedId={slide.generationId}
            onSelect={(id) => onUpdate({ generationId: id })}
          />
        </div>
      )}

      {slide.type === "comparison" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Beforeテキスト
          </label>
          <Textarea
            value={slide.beforeText || ""}
            onChange={(e) => onUpdate({ beforeText: e.target.value })}
            placeholder="改善前の状態を説明..."
            rows={3}
          />
        </div>
      )}

      {slide.type === "text" && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              タイトル（任意）
            </label>
            <Input
              value={slide.title || ""}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="見出し"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              本文
            </label>
            <Textarea
              value={slide.content || ""}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="テキストを入力..."
              rows={6}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── UI Summary (for preview slide) ────────────────────────

function getUiSummary(entry: HistoryEntry): string {
  const label = TOOL_LABELS[entry.toolName] || entry.toolName;
  const title = (entry.toolData.title as string) || "";
  const parts: string[] = [`[${label}]`];
  if (title) parts.push(title);

  if (entry.toolName === "showTable") {
    const columns = entry.toolData.columns;
    const rows = entry.toolData.rows;
    if (Array.isArray(columns)) parts.push(`${columns.length}列`);
    if (Array.isArray(rows)) parts.push(`${rows.length}行`);
  } else if (entry.toolName === "showChart") {
    const chartType = entry.toolData.chartType as string;
    if (chartType) parts.push(`(${chartType})`);
    const data = entry.toolData.data;
    if (Array.isArray(data)) parts.push(`${data.length}データ点`);
  } else if (entry.toolName === "showForm") {
    const fields = entry.toolData.fields;
    if (Array.isArray(fields)) parts.push(`${fields.length}フィールド`);
  } else if (entry.toolName === "generateCustomComponent") {
    parts.push("カスタムコンポーネント");
  }

  return parts.join(" ");
}

// ─── Presentation Mode (Fullscreen) ────────────────────────

function PresentationMode({
  presentation,
  onExit,
}: {
  presentation: Presentation;
  onExit: () => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const entries = useHistoryStore((s) => s.entries);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = presentation.slides.length;

  const goNext = useCallback(() => {
    setCurrentSlide((p) => Math.min(p + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentSlide((p) => Math.max(p - 1, 0));
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onExit();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onExit]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    async function enterFullscreen() {
      try {
        await el!.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        setIsFullscreen(false);
      }
    }

    enterFullscreen();

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  // Exit fullscreen => exit presentation (only if fullscreen was entered)
  useEffect(() => {
    if (!isFullscreen) return;
    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        onExit();
      }
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [onExit, isFullscreen]);

  if (total === 0) return null;

  const slide = presentation.slides[currentSlide];

  function getEntry(id?: string) {
    return entries.find((e) => e.id === id);
  }

  function renderSlide(s: PresentationSlide) {
    switch (s.type) {
      case "title":
        return (
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <h1 className="text-5xl font-bold text-white">
              {s.title || "無題"}
            </h1>
            {s.description && (
              <p className="max-w-2xl text-xl text-gray-300">
                {s.description}
              </p>
            )}
          </div>
        );

      case "ui_preview": {
        const entry = getEntry(s.generationId);
        return (
          <div className="flex flex-col items-center gap-6">
            {s.title && (
              <h2 className="text-3xl font-bold text-white">{s.title}</h2>
            )}
            {s.description && (
              <p className="max-w-2xl text-center text-lg text-gray-300">
                {s.description}
              </p>
            )}
            {entry ? (
              <div className="w-full max-w-3xl rounded-xl border border-gray-700 bg-gray-800 p-8">
                <p className="mb-2 text-sm text-gray-400">
                  {getUiSummary(entry)}
                </p>
                <p className="text-xs text-gray-500">
                  プロンプト: {entry.prompt}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-700 bg-gray-800 px-12 py-16">
                <p className="text-gray-500">UIが選択されていません</p>
              </div>
            )}
          </div>
        );
      }

      case "comparison": {
        const entry = getEntry(s.generationId);
        return (
          <div className="flex flex-col items-center gap-6">
            {s.title && (
              <h2 className="text-3xl font-bold text-white">{s.title}</h2>
            )}
            <div className="grid w-full max-w-5xl grid-cols-2 gap-6">
              {/* Before */}
              <div className="flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-800 p-6">
                <Badge className="w-fit bg-red-600/80 text-white">
                  Before
                </Badge>
                <p className="text-lg text-gray-300">
                  {s.beforeText || "改善前の説明がありません"}
                </p>
              </div>
              {/* After */}
              <div className="flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-800 p-6">
                <Badge className="w-fit bg-green-600/80 text-white">
                  After
                </Badge>
                {entry ? (
                  <>
                    <p className="text-sm text-gray-400">
                      {getUiSummary(entry)}
                    </p>
                    <p className="text-xs text-gray-500">
                      プロンプト: {entry.prompt}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">UIが選択されていません</p>
                )}
              </div>
            </div>
          </div>
        );
      }

      case "text":
        return (
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            {s.title && (
              <h2 className="text-3xl font-bold text-white">{s.title}</h2>
            )}
            <p className="max-w-3xl whitespace-pre-wrap text-xl text-gray-300">
              {s.content || ""}
            </p>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col bg-gray-900"
    >
      {/* Main slide area */}
      <div className="flex flex-1 items-center justify-center px-12 py-8">
        {renderSlide(slide)}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-gray-400 hover:text-white"
          onClick={onExit}
        >
          ESCで終了
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            disabled={currentSlide === 0}
            onClick={goPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            disabled={currentSlide === total - 1}
            onClick={goNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <span className="text-sm text-gray-500">
          {currentSlide + 1} / {total}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────

type ViewMode = "list" | "edit";

export default function PresentationsPage() {
  const presentations = usePresentationStore((s) => s.presentations);
  const addPresentation = usePresentationStore((s) => s.addPresentation);
  const updatePresentation = usePresentationStore((s) => s.updatePresentation);
  const deletePresentation = usePresentationStore((s) => s.deletePresentation);
  const addSlide = usePresentationStore((s) => s.addSlide);
  const updateSlide = usePresentationStore((s) => s.updateSlide);
  const removeSlide = usePresentationStore((s) => s.removeSlide);
  const moveSlide = usePresentationStore((s) => s.moveSlide);
  const projects = useProjectStore((s) => s.projects);

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [presentingId, setPresentingId] = useState<string | null>(null);

  const editing = presentations.find((p) => p.id === editingId) || null;
  const presenting = presentations.find((p) => p.id === presentingId) || null;
  const selectedSlide =
    editing?.slides.find((s) => s.id === selectedSlideId) || null;

  function handleCreate() {
    const id = addPresentation({ title: "新しいプレゼンテーション", slides: [] });
    setEditingId(id);
    setViewMode("edit");
    toast.success("プレゼンテーションを作成しました");
  }

  function handleEdit(id: string) {
    setEditingId(id);
    setSelectedSlideId(null);
    setViewMode("edit");
  }

  function handleDelete(id: string) {
    deletePresentation(id);
    if (editingId === id) {
      setEditingId(null);
      setViewMode("list");
    }
    toast.success("削除しました");
  }

  function handleBackToList() {
    setViewMode("list");
    setEditingId(null);
    setSelectedSlideId(null);
  }

  function handleAddSlide(type: PresentationSlide["type"]) {
    if (!editingId) return;
    addSlide(editingId, { type });
    // Select the newly added slide
    const pres = usePresentationStore.getState().presentations.find(
      (p) => p.id === editingId
    );
    if (pres && pres.slides.length > 0) {
      setSelectedSlideId(pres.slides[pres.slides.length - 1].id);
    }
  }

  function handleStartPresentation(id: string) {
    const pres = presentations.find((p) => p.id === id);
    if (!pres || pres.slides.length === 0) {
      toast.error("スライドがありません");
      return;
    }
    setPresentingId(id);
  }

  // ─── Presentation Mode ───
  if (presenting) {
    return (
      <PresentationMode
        presentation={presenting}
        onExit={() => setPresentingId(null)}
      />
    );
  }

  // ─── List View ───
  if (viewMode === "list") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
            <Link href="/">
              <Button variant="ghost" size="icon" aria-label="ホームに戻る">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">プレゼンテーション</h1>
            </div>
            <span className="text-sm text-muted-foreground">
              {presentations.length}件
            </span>
            <div className="flex-1" />
            <Button size="sm" className="gap-1.5" onClick={handleCreate}>
              <Plus className="h-3.5 w-3.5" />
              新規作成
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          {presentations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Monitor className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">
                プレゼンテーションがありません
              </p>
              <p className="text-sm text-muted-foreground">
                生成UIをスライドにまとめて、プレゼンテーションを作成しましょう
              </p>
              <Button
                variant="outline"
                className="mt-2 gap-1.5"
                onClick={handleCreate}
              >
                <Plus className="h-3.5 w-3.5" />
                最初のプレゼンテーションを作成
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {presentations.map((pres) => {
                const project = projects.find(
                  (p) => p.id === pres.projectId
                );
                return (
                  <Card key={pres.id} className="gap-0 overflow-hidden py-0">
                    <div className="h-2 bg-primary" />
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm">{pres.title}</CardTitle>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {pres.slides.length}スライド
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{relativeTime(pres.createdAt)}</span>
                        {project && (
                          <>
                            <span>-</span>
                            <span>{project.name}</span>
                          </>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      {pres.slides.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {pres.slides.slice(0, 5).map((s) => (
                            <Badge
                              key={s.id}
                              variant="outline"
                              className="text-[9px]"
                            >
                              {SLIDE_TYPE_LABELS[s.type]}
                            </Badge>
                          ))}
                          {pres.slides.length > 5 && (
                            <Badge variant="outline" className="text-[9px]">
                              +{pres.slides.length - 5}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          スライドなし
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 text-xs"
                          onClick={() => handleEdit(pres.id)}
                        >
                          <Edit3 className="h-3 w-3" />
                          編集
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5 text-xs"
                          onClick={() => handleStartPresentation(pres.id)}
                        >
                          <Play className="h-3 w-3" />
                          開始
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(pres.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ─── Edit View ───
  if (!editing) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            aria-label="一覧に戻る"
            onClick={handleBackToList}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">プレゼン編集</h1>
          </div>
          <Badge variant="secondary" className="text-xs">
            {editing.slides.length}スライド
          </Badge>
          <div className="flex-1" />
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => handleStartPresentation(editing.id)}
          >
            <Play className="h-3.5 w-3.5" />
            プレゼン開始
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        {/* Left sidebar: slide list */}
        <div className="w-full shrink-0 lg:w-72">
          <div className="sticky top-20 space-y-4">
            {/* Title input */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                タイトル
              </label>
              <Input
                value={editing.title}
                onChange={(e) =>
                  updatePresentation(editing.id, { title: e.target.value })
                }
                placeholder="プレゼンテーション名"
              />
            </div>

            {/* Project selector */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                プロジェクト（任意）
              </label>
              <select
                value={editing.projectId || ""}
                onChange={(e) =>
                  updatePresentation(editing.id, {
                    projectId: e.target.value || undefined,
                  })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">なし</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Slide list */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  スライド一覧
                </span>
                <SlideAddDropdown onAdd={handleAddSlide} />
              </div>

              <ScrollArea className="h-[calc(100vh-22rem)]">
                <div className="space-y-1 pr-2">
                  {editing.slides.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      スライドを追加してください
                    </div>
                  ) : (
                    editing.slides.map((slide, idx) => {
                      const isSelected = slide.id === selectedSlideId;
                      const Icon =
                        SLIDE_TYPE_OPTIONS.find(
                          (o) => o.type === slide.type
                        )?.icon || FileText;

                      return (
                        <div
                          key={slide.id}
                          className={`group flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-transparent hover:border-border hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedSlideId(slide.id)}
                        >
                          <span className="text-[10px] text-muted-foreground w-4 text-center shrink-0">
                            {idx + 1}
                          </span>
                          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-xs">
                            {slide.title ||
                              SLIDE_TYPE_LABELS[slide.type]}
                          </span>
                          <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="rounded p-0.5 hover:bg-muted"
                              disabled={idx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSlide(editing.id, slide.id, "up");
                              }}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              className="rounded p-0.5 hover:bg-muted"
                              disabled={idx === editing.slides.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSlide(editing.id, slide.id, "down");
                              }}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                            <button
                              className="rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSlide(editing.id, slide.id);
                                if (selectedSlideId === slide.id) {
                                  setSelectedSlideId(null);
                                }
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Right panel: slide editor */}
        <div className="flex-1">
          {selectedSlide ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  スライド編集 -{" "}
                  {SLIDE_TYPE_LABELS[selectedSlide.type]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SlideEditor
                  slide={selectedSlide}
                  onUpdate={(updates) =>
                    updateSlide(editing.id, selectedSlide.id, updates)
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-20 text-center">
              <LayoutGrid className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">
                {editing.slides.length === 0
                  ? "スライドを追加してください"
                  : "左のパネルからスライドを選択してください"}
              </p>
              {editing.slides.length === 0 && (
                <SlideAddDropdown onAdd={handleAddSlide} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
