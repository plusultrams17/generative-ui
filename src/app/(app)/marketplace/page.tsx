"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Heart,
  Download,
  Plus,
  Copy,
  Check,
  Tag,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { TOOL_LABELS } from "@/lib/shared-constants";
import {
  useMarketplaceStore,
  type MarketplaceItem,
} from "@/stores/marketplace-store";

const TAG_FILTERS = ["全て", "UI", "フォーム", "データ", "ナビ"];

type SortKey = "newest" | "popular" | "downloads";

const SORT_OPTIONS: { key: SortKey; label: string; icon: typeof Clock }[] = [
  { key: "newest", label: "新着順", icon: Clock },
  { key: "popular", label: "人気順", icon: TrendingUp },
  { key: "downloads", label: "DL順", icon: Download },
];

function sortItems(items: MarketplaceItem[], sort: SortKey): MarketplaceItem[] {
  const sorted = [...items];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => b.createdAt - a.createdAt);
    case "popular":
      return sorted.sort((a, b) => b.likes - a.likes);
    case "downloads":
      return sorted.sort((a, b) => b.downloads - a.downloads);
  }
}

function PublishModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const publishItem = useMarketplaceStore((s) => s.publishItem);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [toolName, setToolName] = useState("generateCustomComponent");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Escape key to close modal
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function handleAddTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleSubmit() {
    if (!title.trim() || !code.trim()) {
      toast.error("タイトルとコードは必須です");
      return;
    }
    publishItem({
      title: title.trim(),
      description: description.trim(),
      code: code.trim(),
      toolName,
      author: "あなた",
      tags: tags.length > 0 ? tags : ["UI"],
      thumbnail: undefined,
    });
    toast.success("コンポーネントを公開しました");
    setTitle("");
    setDescription("");
    setCode("");
    setToolName("generateCustomComponent");
    setTags([]);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">コンポーネントを公開</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Plus className="h-4 w-4 rotate-45" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">タイトル *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="コンポーネント名"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">説明</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="コンポーネントの説明"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ツールタイプ</label>
            <Select value={toolName} onValueChange={setToolName}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TOOL_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">コード *</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="JSXコードを貼り付けてください"
              rows={6}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">タグ</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="タグを追加"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={handleAddTag}>
                <Tag className="mr-1 h-3 w-3" />
                追加
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer gap-1"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <Plus className="h-3 w-3 rotate-45" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={handleSubmit}>公開する</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const router = useRouter();
  const items = useMarketplaceStore((s) => s.items);
  const toggleLike = useMarketplaceStore((s) => s.toggleLike);
  const likedIds = useMarketplaceStore((s) => s.likedIds);
  const incrementDownload = useMarketplaceStore((s) => s.incrementDownload);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("全て");
  const [sort, setSort] = useState<SortKey>("newest");
  const [publishOpen, setPublishOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = sortItems(
    items.filter((item) => {
      if (activeTag !== "全て" && !item.tags.includes(activeTag)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !item.title.toLowerCase().includes(q) &&
          !item.description.toLowerCase().includes(q) &&
          !item.tags.some((t) => t.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    }),
    sort
  );

  async function handleCopy(item: MarketplaceItem) {
    await navigator.clipboard.writeText(item.code);
    setCopiedId(item.id);
    toast.success("コードをコピーしました");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleImport(item: MarketplaceItem) {
    incrementDownload(item.id);
    const prompt = `「${item.title}」のUIを生成してください。${item.description}`;
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="戻る">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">
              コンポーネントマーケットプレイス
            </h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {filtered.length}件
          </span>
          <div className="flex-1" />
          <Button
            onClick={() => setPublishOpen(true)}
            size="sm"
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            公開する
          </Button>
        </div>

        <div className="mx-auto max-w-6xl space-y-3 px-4 pb-3 sm:px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="コンポーネントを検索..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1">
              {TAG_FILTERS.map((tag) => (
                <Badge
                  key={tag}
                  variant={activeTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-1">
              {SORT_OPTIONS.map((opt) => (
                <Button
                  key={opt.key}
                  variant={sort === opt.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSort(opt.key)}
                  className="gap-1 text-xs"
                >
                  <opt.icon className="h-3 w-3" />
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">
              {searchQuery
                ? "検索結果がありません"
                : "コンポーネントがありません"}
            </p>
            <p className="text-sm text-muted-foreground">
              コンポーネントを公開して共有しましょう
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setPublishOpen(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              最初のコンポーネントを公開
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <Card key={item.id} className="gap-0 overflow-hidden py-0">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">{item.title}</CardTitle>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {item.author}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2 text-xs">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <button
                      onClick={() => toggleLike(item.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        likedIds.has(item.id)
                          ? "text-red-500"
                          : "hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${
                          likedIds.has(item.id) ? "fill-current" : ""
                        }`}
                      />
                      {item.likes}
                    </button>
                    <span className="flex items-center gap-1">
                      <Download className="h-3.5 w-3.5" />
                      {item.downloads}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => handleCopy(item)}
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      コードをコピー
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => handleImport(item)}
                    >
                      <Download className="h-3 w-3" />
                      チャットで使う
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <PublishModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
      />
    </div>
  );
}
