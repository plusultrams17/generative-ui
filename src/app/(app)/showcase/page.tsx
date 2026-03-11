"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  ArrowLeft,
  Globe,
  Search,
  Copy,
  Check,
  Clock,
  Share2,
  Store,
  Code2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useShareStore } from "@/stores/share-store";
import {
  useMarketplaceStore,
  type MarketplaceItem,
} from "@/stores/marketplace-store";
import { TOOL_LABELS } from "@/lib/shared-constants";

const TOOL_COLORS: Record<string, string> = {
  showForm: "bg-blue-500",
  showTable: "bg-emerald-500",
  showChart: "bg-amber-500",
  generateCustomComponent: "bg-purple-500",
};

type SourceFilter = "all" | "shared" | "marketplace";
type SortKey = "newest" | "popular";

type ShowcaseItem = {
  id: string;
  title: string;
  description: string;
  toolName: string;
  code: string;
  createdAt: number;
  source: "shared" | "marketplace";
  likes?: number;
  downloads?: number;
  tags?: string[];
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  return `${Math.floor(days / 30)}ヶ月前`;
}

export default function ShowcasePage() {
  const shares = useShareStore((s) => s.shares);
  const marketplaceItems = useMarketplaceStore((s) => s.items);

  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Merge data sources
  const allItems = useMemo<ShowcaseItem[]>(() => {
    const sharedItems: ShowcaseItem[] = shares.map((s) => ({
      id: `share-${s.id}`,
      title: s.toolData.title as string || TOOL_LABELS[s.toolName] || s.toolName,
      description: s.toolData.description as string || "",
      toolName: s.toolName,
      code:
        typeof s.toolData.code === "string"
          ? s.toolData.code
          : JSON.stringify(s.toolData, null, 2),
      createdAt: s.createdAt,
      source: "shared" as const,
    }));

    const mpItems: ShowcaseItem[] = marketplaceItems.map((m: MarketplaceItem) => ({
      id: `mp-${m.id}`,
      title: m.title,
      description: m.description,
      toolName: m.toolName,
      code: m.code,
      createdAt: m.createdAt,
      source: "marketplace" as const,
      likes: m.likes,
      downloads: m.downloads,
      tags: m.tags,
    }));

    return [...sharedItems, ...mpItems];
  }, [shares, marketplaceItems]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    let items = allItems;

    if (sourceFilter !== "all") {
      items = items.filter((i) => i.source === sourceFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.toolName.toLowerCase().includes(q) ||
          i.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortKey === "newest") {
      items = [...items].sort((a, b) => b.createdAt - a.createdAt);
    } else {
      items = [...items].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    }

    return items;
  }, [allItems, sourceFilter, searchQuery, sortKey]);

  async function handleCopy(item: ShowcaseItem) {
    try {
      await navigator.clipboard.writeText(item.code);
      setCopiedId(item.id);
      toast.success("コードをコピーしました");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("コピーに失敗しました");
    }
  }

  const SOURCE_TABS: { key: SourceFilter; label: string; icon: typeof Globe }[] = [
    { key: "all", label: "全て", icon: Globe },
    { key: "shared", label: "共有", icon: Share2 },
    { key: "marketplace", label: "マーケットプレイス", icon: Store },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <Globe className="size-5 text-primary" />
          <h1 className="text-lg font-semibold">ショーケース</h1>
          <Badge variant="secondary" className="text-xs">
            {filteredItems.length}
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索..."
              className="h-8 pl-8 text-sm"
            />
          </div>

          <div className="flex gap-1">
            {SOURCE_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.key}
                  size="sm"
                  variant={sourceFilter === tab.key ? "default" : "ghost"}
                  onClick={() => setSourceFilter(tab.key)}
                  className="h-7 text-xs"
                >
                  <Icon className="mr-1 size-3" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          <div className="ml-auto flex gap-1">
            <Button
              size="sm"
              variant={sortKey === "newest" ? "secondary" : "ghost"}
              onClick={() => setSortKey("newest")}
              className="h-7 text-xs"
            >
              <Clock className="mr-1 size-3" />
              新着順
            </Button>
            <Button
              size="sm"
              variant={sortKey === "popular" ? "secondary" : "ghost"}
              onClick={() => setSortKey("popular")}
              className="h-7 text-xs"
            >
              人気順
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Globe className="mb-3 size-12 opacity-30" />
            <p className="text-sm">ショーケースにアイテムがありません</p>
            <p className="mt-1 text-xs">
              チャットで生成したUIを共有するとここに表示されます
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <Card key={item.id} className="gap-0 overflow-hidden py-0">
                  {/* Color bar */}
                  <div
                    className={`h-1.5 ${TOOL_COLORS[item.toolName] ?? "bg-gray-400"}`}
                  />

                  <CardHeader className="px-4 pb-2 pt-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm leading-snug">
                        {item.title}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[10px]"
                      >
                        {item.source === "shared" ? "共有" : "公開"}
                      </Badge>
                    </div>
                    {item.description && (
                      <CardDescription className="mt-1 text-xs line-clamp-2">
                        {item.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="px-4 pb-3">
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {TOOL_LABELS[item.toolName] ?? item.toolName}
                      </Badge>
                      {item.tags?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {relativeTime(item.createdAt)}
                      </span>
                      {item.likes !== undefined && (
                        <span>♥ {item.likes}</span>
                      )}
                      {item.downloads !== undefined && (
                        <span>↓ {item.downloads}</span>
                      )}
                    </div>

                    {/* Code preview / expand */}
                    {isExpanded && (
                      <pre className="mb-2 max-h-60 overflow-auto rounded-md bg-muted p-3 text-[11px] leading-relaxed">
                        <code>{item.code}</code>
                      </pre>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : item.id)
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp className="mr-1 size-3" />
                        ) : (
                          <Code2 className="mr-1 size-3" />
                        )}
                        {isExpanded ? "閉じる" : "コード"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleCopy(item)}
                      >
                        {copiedId === item.id ? (
                          <Check className="mr-1 size-3 text-green-500" />
                        ) : (
                          <Copy className="mr-1 size-3" />
                        )}
                        コピー
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
