"use client";

import { useHistoryStore, type HistoryEntry } from "@/stores/history-store";
import { useFavoritesStore } from "@/stores/favorites-store";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, LayoutGrid, Trash2, RotateCcw, Layers, Star, Plus, X, Search, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { TOOL_LABELS } from "@/lib/shared-constants";
import { useShareStore } from "@/stores/share-store";

const TOOL_COLORS: Record<string, string> = {
  showForm: "bg-blue-500",
  showTable: "bg-green-500",
  showChart: "bg-amber-500",
  generateCustomComponent: "bg-purple-500",
};

const FILTER_TABS = [
  { key: "all", label: "全て" },
  { key: "favorites", label: "お気に入り" },
  { key: "showForm", label: "フォーム" },
  { key: "showTable", label: "テーブル" },
  { key: "showChart", label: "チャート" },
  { key: "generateCustomComponent", label: "カスタム" },
] as const;

const TAG_COLORS = [
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
];

function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

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

function TagInput({ entryId }: { entryId: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const addTag = useFavoritesStore((s) => s.addTag);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      addTag(entryId, value.trim());
      setValue("");
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground/60 hover:border-muted-foreground hover:text-muted-foreground transition-colors"
        title="タグを追加"
      >
        <Plus className="h-3 w-3" />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (!value.trim()) setOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setValue("");
            setOpen(false);
          }
        }}
        placeholder="タグ名"
        className="h-5 w-20 rounded border bg-transparent px-1.5 text-[10px] outline-none focus:border-primary"
      />
    </form>
  );
}

export default function GalleryPage() {
  const entries = useHistoryStore((s) => s.entries);
  const removeEntry = useHistoryStore((s) => s.removeEntry);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const removeTag = useFavoritesStore((s) => s.removeTag);
  const addShare = useShareStore((s) => s.addShare);

  const filtered = entries.filter((e) => {
    // Filter by tab
    if (filter === "favorites") {
      if (!isFavorite(e.id)) return false;
    } else if (filter !== "all") {
      if (e.toolName !== filter) return false;
    }

    // Filter by tag
    if (activeTag) {
      const fav = favorites.find((f) => f.historyEntryId === e.id);
      if (!fav || !fav.tags.includes(activeTag)) return false;
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = ((e.toolData.title as string) || "").toLowerCase();
      const prompt = e.prompt.toLowerCase();
      if (!title.includes(q) && !prompt.includes(q)) return false;
    }

    return true;
  });

  function handleDelete(entry: HistoryEntry) {
    removeEntry(entry.id);
    toast.success("削除しました");
  }

  function handleToggleFavorite(entryId: string) {
    const wasFavorite = isFavorite(entryId);
    toggleFavorite(entryId);
    toast.success(wasFavorite ? "お気に入りから削除しました" : "お気に入りに追加しました");
  }

  function handleShare(entry: HistoryEntry) {
    const id = addShare(entry.toolName, entry.toolData);
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("共有リンクをコピーしました");
  }

  function handleTagClick(tag: string) {
    setActiveTag((prev) => (prev === tag ? null : tag));
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="チャットに戻る">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">ギャラリー</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {filtered.length}件
          </span>
          <div className="flex-1" />
          <Link href="/composer">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              コンポーザー
            </Button>
          </Link>
        </div>

        <div className="mx-auto max-w-6xl space-y-3 px-4 pb-3 sm:px-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="タイトルやプロンプトで検索..."
              className="pl-9"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-1">
            {FILTER_TABS.map((tab) => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilter(tab.key);
                  if (tab.key !== "favorites") setActiveTag(null);
                }}
                className="shrink-0"
              >
                {tab.key === "favorites" && <Star className="mr-1 h-3 w-3" />}
                {tab.label}
              </Button>
            ))}

            {activeTag && (
              <Badge
                variant="secondary"
                className="ml-2 gap-1 text-[10px]"
              >
                タグ: {activeTag}
                <button
                  onClick={() => setActiveTag(null)}
                  className="ml-0.5 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <LayoutGrid className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">
              {filter === "favorites"
                ? "お気に入りがありません"
                : filter === "all"
                  ? searchQuery
                    ? "検索結果がありません"
                    : "まだ生成履歴がありません"
                  : `${TOOL_LABELS[filter] || filter}の履歴がありません`}
            </p>
            <p className="text-sm text-muted-foreground">
              {filter === "favorites"
                ? "カードの星アイコンをクリックしてお気に入りに追加できます"
                : "チャットでUIを生成すると、ここに表示されます"}
            </p>
            <Link href="/">
              <Button variant="outline" className="mt-2">
                チャットに戻る
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((entry) => {
              const colorClass = TOOL_COLORS[entry.toolName] || "bg-gray-500";
              const label = TOOL_LABELS[entry.toolName] || entry.toolName;
              const title = (entry.toolData.title as string) || label;
              const favorited = isFavorite(entry.id);
              const fav = favorites.find((f) => f.historyEntryId === entry.id);

              return (
                <Card key={entry.id} className="gap-0 overflow-hidden py-0">
                  <div className={`h-2 ${colorClass}`} />
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm">{title}</CardTitle>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleFavorite(entry.id)}
                          className="rounded-md p-1 transition-colors hover:bg-muted"
                          title={favorited ? "お気に入りから削除" : "お気に入りに追加"}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              favorited
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {label}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {relativeTime(entry.timestamp)}
                    </span>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {entry.prompt}
                    </p>
                    {/* Tags */}
                    {favorited && fav && (
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {fav.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium transition-opacity hover:opacity-80 ${getTagColor(tag)}`}
                          >
                            {tag}
                            <span
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTag(entry.id, tag);
                              }}
                              className="ml-0.5 hover:opacity-60"
                            >
                              <X className="h-2.5 w-2.5" />
                            </span>
                          </button>
                        ))}
                        <TagInput entryId={entry.id} />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="gap-2 border-t pb-3 pt-3">
                    <Link
                      href={`/chat?prompt=${encodeURIComponent(entry.prompt)}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full gap-1.5">
                        <RotateCcw className="h-3 w-3" />
                        再利用
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => handleShare(entry)}
                      title="共有リンクを作成"
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(entry)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
