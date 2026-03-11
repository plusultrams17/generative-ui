"use client";

import { useState, useMemo } from "react";
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
  ArrowLeft,
  FileText,
  Search,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useMarketplaceStore } from "@/stores/marketplace-store";
import { TOOL_LABELS } from "@/lib/shared-constants";

const CATEGORY_FILTERS = ["全て", "UI", "フォーム", "データ", "ナビ"];

const TOOL_COLORS: Record<string, string> = {
  showForm: "bg-blue-500",
  showTable: "bg-emerald-500",
  showChart: "bg-amber-500",
  generateCustomComponent: "bg-purple-500",
};

// Additional built-in templates beyond marketplace seeds
const EXTRA_TEMPLATES = [
  {
    id: "tmpl-landing-header",
    title: "ランディングページヘーダー",
    description: "CTA付きのヒーローセクション。グラデーション背景とキャッチコピー。",
    toolName: "generateCustomComponent",
    tags: ["UI", "ナビ"],
    code: `<section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 px-8 py-16 text-center text-white">
  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">次世代のUIを、AIと共に</h1>
  <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">プロンプトひとつで美しいUIコンポーネントを生成。デザインからコードまで、すべてを自動化します。</p>
  <div className="mt-8 flex justify-center gap-4">
    <button className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow hover:bg-blue-50">無料で始める</button>
    <button className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">デモを見る</button>
  </div>
</section>`,
  },
  {
    id: "tmpl-footer",
    title: "フッター",
    description: "リンク付きの4カラムフッター。コピーライトとSNSリンク。",
    toolName: "generateCustomComponent",
    tags: ["UI", "ナビ"],
    code: `<footer className="rounded-xl border bg-card px-8 py-10">
  <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
    <div>
      <h4 className="text-sm font-semibold">プロダクト</h4>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        <li><a href="#" className="hover:text-foreground">機能</a></li>
        <li><a href="#" className="hover:text-foreground">料金</a></li>
        <li><a href="#" className="hover:text-foreground">更新履歴</a></li>
      </ul>
    </div>
    <div>
      <h4 className="text-sm font-semibold">サポート</h4>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        <li><a href="#" className="hover:text-foreground">ドキュメント</a></li>
        <li><a href="#" className="hover:text-foreground">FAQ</a></li>
        <li><a href="#" className="hover:text-foreground">お問い合わせ</a></li>
      </ul>
    </div>
    <div>
      <h4 className="text-sm font-semibold">会社</h4>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        <li><a href="#" className="hover:text-foreground">会社概要</a></li>
        <li><a href="#" className="hover:text-foreground">ブログ</a></li>
        <li><a href="#" className="hover:text-foreground">採用情報</a></li>
      </ul>
    </div>
    <div>
      <h4 className="text-sm font-semibold">法的情報</h4>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        <li><a href="#" className="hover:text-foreground">利用規約</a></li>
        <li><a href="#" className="hover:text-foreground">プライバシー</a></li>
      </ul>
    </div>
  </div>
  <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
    &copy; 2026 GenUI. All rights reserved.
  </div>
</footer>`,
  },
  {
    id: "tmpl-contact-form",
    title: "問い合わせフォーム",
    description: "名前・メール・メッセージの3フィールド問い合わせフォーム。",
    toolName: "showForm",
    tags: ["フォーム"],
    code: `<div className="mx-auto max-w-md space-y-6 rounded-xl border bg-card p-6 shadow-sm">
  <div className="space-y-2 text-center">
    <h2 className="text-2xl font-bold">お問い合わせ</h2>
    <p className="text-sm text-muted-foreground">ご質問やご要望をお聞かせください</p>
  </div>
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="text-sm font-medium">お名前</label>
      <input type="text" placeholder="山田太郎" className="w-full rounded-md border px-3 py-2 text-sm" />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium">メールアドレス</label>
      <input type="email" placeholder="mail@example.com" className="w-full rounded-md border px-3 py-2 text-sm" />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium">メッセージ</label>
      <textarea rows={4} placeholder="お問い合わせ内容をご記入ください" className="w-full rounded-md border px-3 py-2 text-sm" />
    </div>
    <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
      送信する
    </button>
  </div>
</div>`,
  },
  {
    id: "tmpl-faq",
    title: "FAQアコーディオン",
    description: "開閉式のよくある質問コンポーネント。クリックで回答表示。",
    toolName: "generateCustomComponent",
    tags: ["UI"],
    code: `<div className="mx-auto max-w-lg space-y-2 rounded-xl border bg-card p-6 shadow-sm">
  <h3 className="mb-4 text-lg font-semibold">よくある質問</h3>
  {[
    { q: "無料プランはありますか？", a: "はい、基本機能は無料でご利用いただけます。" },
    { q: "データはどこに保存されますか？", a: "すべてのデータは暗号化され、安全なクラウドサーバーに保存されます。" },
    { q: "チームで使えますか？", a: "プロプラン以上でチーム機能をご利用いただけます。" },
    { q: "解約はいつでもできますか？", a: "はい、いつでもワンクリックで解約可能です。" },
  ].map((item, i) => (
    <details key={i} className="group rounded-lg border px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium list-none flex items-center justify-between">
        {item.q}
        <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
      </summary>
      <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
    </details>
  ))}
</div>`,
  },
];

type TemplateItem = {
  id: string;
  title: string;
  description: string;
  toolName: string;
  tags: string[];
  code: string;
  author?: string;
};

export default function TemplatesPage() {
  const marketplaceItems = useMarketplaceStore((s) => s.items);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("全て");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Combine official marketplace templates + extra built-in templates
  const allTemplates = useMemo<TemplateItem[]>(() => {
    const officialItems: TemplateItem[] = marketplaceItems
      .filter((i) => i.author === "公式")
      .map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        toolName: i.toolName,
        tags: i.tags,
        code: i.code,
        author: i.author,
      }));

    const extraItems: TemplateItem[] = EXTRA_TEMPLATES.map((t) => ({
      ...t,
      author: "公式",
    }));

    // Deduplicate by ID
    const seen = new Set<string>();
    const result: TemplateItem[] = [];
    for (const item of [...officialItems, ...extraItems]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        result.push(item);
      }
    }
    return result;
  }, [marketplaceItems]);

  // Community templates (non-official)
  const communityTemplates = useMemo<TemplateItem[]>(() => {
    return marketplaceItems
      .filter((i) => i.author !== "公式")
      .map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        toolName: i.toolName,
        tags: i.tags,
        code: i.code,
        author: i.author,
      }));
  }, [marketplaceItems]);

  // Filter
  const filteredOfficial = useMemo(() => {
    let items = allTemplates;
    if (categoryFilter !== "全て") {
      items = items.filter((i) => i.tags.includes(categoryFilter));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }
    return items;
  }, [allTemplates, categoryFilter, searchQuery]);

  const filteredCommunity = useMemo(() => {
    let items = communityTemplates;
    if (categoryFilter !== "全て") {
      items = items.filter((i) => i.tags.includes(categoryFilter));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }
    return items;
  }, [communityTemplates, categoryFilter, searchQuery]);

  async function handleCopy(item: TemplateItem) {
    try {
      await navigator.clipboard.writeText(item.code);
      setCopiedId(item.id);
      toast.success("コードをコピーしました");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("コピーに失敗しました");
    }
  }

  function handleUseInChat(item: TemplateItem) {
    const prompt = `「${item.title}」のUIコンポーネントを生成してください。${item.description}`;
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  }

  function renderTemplateCard(item: TemplateItem) {
    const codePreview = item.code
      .split("\n")
      .slice(0, 3)
      .join("\n");

    return (
      <Card key={item.id} className="gap-0 overflow-hidden py-0">
        <div
          className={`h-1 ${TOOL_COLORS[item.toolName] ?? "bg-gray-400"}`}
        />
        <CardHeader className="px-4 pb-2 pt-3">
          <CardTitle className="text-sm">{item.title}</CardTitle>
          <CardDescription className="text-xs line-clamp-2">
            {item.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="secondary" className="text-[10px]">
              {TOOL_LABELS[item.toolName] ?? item.toolName}
            </Badge>
            {item.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Code preview */}
          <pre className="mb-3 rounded-md bg-muted p-2 text-[10px] leading-relaxed overflow-hidden max-h-16">
            <code className="text-muted-foreground">{codePreview}...</code>
          </pre>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleUseInChat(item)}
            >
              <MessageSquare className="mr-1 size-3" />
              チャットで使う
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
  }

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
          <FileText className="size-5 text-primary" />
          <h1 className="text-lg font-semibold">テンプレート</h1>
          <Badge variant="secondary" className="text-xs">
            {filteredOfficial.length + filteredCommunity.length}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="テンプレートを検索..."
              className="h-8 pl-8 text-sm"
            />
          </div>

          <div className="flex gap-1">
            {CATEGORY_FILTERS.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={categoryFilter === cat ? "default" : "ghost"}
                onClick={() => setCategoryFilter(cat)}
                className="h-7 text-xs"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 space-y-8">
        {/* Official templates */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">公式テンプレート</h2>
            <Badge variant="secondary" className="text-[10px]">
              {filteredOfficial.length}
            </Badge>
          </div>
          {filteredOfficial.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              該当するテンプレートがありません
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOfficial.map(renderTemplateCard)}
            </div>
          )}
        </section>

        {/* Community templates */}
        {filteredCommunity.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold">コミュニティ</h2>
              <Badge variant="secondary" className="text-[10px]">
                {filteredCommunity.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCommunity.map(renderTemplateCard)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
