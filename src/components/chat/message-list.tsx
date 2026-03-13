"use client";

import type { UIMessage } from "ai";
import { MessageItem } from "./message-item";
import { StreamingIndicator } from "@/components/shared/streaming-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Briefcase,
  Globe,
  Smartphone,
  BarChart3,
  Palette,
  Lightbulb,
} from "lucide-react";

type MessageListProps = {
  messages: UIMessage[];
  isLoading: boolean;
  status?: string;
  onPromptClick?: (prompt: string) => void;
  onSendMessage?: (message: string) => void;
};

type PromptItem = {
  emoji: string;
  label: string;
  prompt: string;
};

type CategoryDef = {
  id: string;
  name: string;
  icon: typeof Briefcase;
  color: string;
  prompts: PromptItem[];
};

const PROMPT_CATEGORIES: CategoryDef[] = [
  {
    id: "business",
    name: "ビジネス",
    icon: Briefcase,
    color: "text-blue-500",
    prompts: [
      { emoji: "📊", label: "社員一覧テーブル", prompt: "社員一覧のテーブルを作って（名前、部署、役職、入社年、メールアドレス付き）" },
      { emoji: "📈", label: "月次売上ダッシュボード", prompt: "月次売上ダッシュボードを作って（棒グラフ、前年比、目標達成率つき）" },
      { emoji: "👥", label: "顧客管理フォーム", prompt: "顧客管理フォームを作って（会社名、担当者、電話番号、ステータス選択つき）" },
      { emoji: "💰", label: "請求書テンプレート", prompt: "請求書テンプレートを作って（発行日、品目、数量、単価、合計の表つき）" },
      { emoji: "🏢", label: "会議室予約フォーム", prompt: "会議室予約フォームを作って（日時選択、会議室一覧、参加者入力つき）" },
      { emoji: "🎯", label: "KPIカード", prompt: "KPIカードを4つ並べて表示して（売上、顧客数、コンバージョン率、平均単価）" },
    ],
  },
  {
    id: "website",
    name: "Webサイト",
    icon: Globe,
    color: "text-green-500",
    prompts: [
      { emoji: "🚀", label: "ヒーローセクション", prompt: "SaaSサービスのヒーローセクションを作って（キャッチコピー、CTAボタン、イメージ領域つき）" },
      { emoji: "💳", label: "料金プラン比較", prompt: "料金プラン比較テーブルを作って（3プラン、機能一覧のチェックマーク、おすすめバッジつき）" },
      { emoji: "📩", label: "お問い合わせフォーム", prompt: "お問い合わせフォームを作って（名前、メール、カテゴリ選択、メッセージ入力つき）" },
      { emoji: "📋", label: "フッター", prompt: "Webサイトのフッターを作って（ロゴ、リンクカラム4つ、SNSアイコン、著作権表示つき）" },
      { emoji: "❓", label: "FAQセクション", prompt: "アコーディオン型のFAQセクションを作って（開閉アニメーション、5つの質問つき）" },
      { emoji: "👨‍💼", label: "チーム紹介セクション", prompt: "チーム紹介セクションを作って（写真領域、名前、肩書き、SNSリンクのカード形式）" },
    ],
  },
  {
    id: "app",
    name: "アプリ",
    icon: Smartphone,
    color: "text-purple-500",
    prompts: [
      { emoji: "🔐", label: "ログインフォーム", prompt: "モダンなログインフォームを作って（メール、パスワード、ソーシャルログインボタン、パスワード忘れリンクつき）" },
      { emoji: "👤", label: "プロフィールカード", prompt: "プロフィールカードを作って（アバター、名前、自己紹介、統計情報、フォローボタンつき）" },
      { emoji: "🔔", label: "通知パネル", prompt: "通知パネルを作って（未読バッジ、通知リスト、既読/未読の切り替え、時刻表示つき）" },
      { emoji: "⚙️", label: "設定画面", prompt: "アプリの設定画面を作って（プロフィール、通知、テーマ、言語などのセクション分けつき）" },
      { emoji: "✅", label: "タスク管理ボード", prompt: "カンバン風タスク管理ボードを作って（ToDo、進行中、完了の3カラム、カード追加つき）" },
      { emoji: "💬", label: "チャットUI", prompt: "チャットUIを作って（メッセージ吹き出し、入力欄、送信ボタン、タイムスタンプつき）" },
    ],
  },
  {
    id: "data",
    name: "データ",
    icon: BarChart3,
    color: "text-orange-500",
    prompts: [
      { emoji: "📊", label: "棒グラフ（月別売上）", prompt: "2024年の月別売上を棒グラフで表示して（ツールチップ、軸ラベルつき）" },
      { emoji: "🍩", label: "円グラフ（部署別）", prompt: "部署別の人員構成を円グラフで表示して（凡例、パーセンテージ表示つき）" },
      { emoji: "📉", label: "KPIダッシュボード", prompt: "KPIダッシュボードを作って（4つの指標カード、折れ線グラフ、前月比の増減表示つき）" },
      { emoji: "🌐", label: "アクセス解析レポート", prompt: "Webサイトのアクセス解析レポートを作って（PV推移グラフ、流入元内訳、人気ページランキングつき）" },
      { emoji: "📈", label: "折れ線グラフ（売上推移）", prompt: "過去12ヶ月の売上推移を折れ線グラフで表示して（目標ラインと実績の2本線つき）" },
    ],
  },
  {
    id: "creative",
    name: "クリエイティブ",
    icon: Palette,
    color: "text-pink-500",
    prompts: [
      { emoji: "🎨", label: "ポートフォリオカード", prompt: "デザイナー向けのポートフォリオカードを作って（サムネイル画像、タイトル、タグ、いいねボタンつき）" },
      { emoji: "📱", label: "SNSプロフィール", prompt: "SNS風のプロフィールページを作って（カバー画像、アバター、フォロワー数、投稿グリッドつき）" },
      { emoji: "🎪", label: "イベント告知バナー", prompt: "テックカンファレンスのイベント告知バナーを作って（日時、場所、スピーカー一覧、参加ボタンつき）" },
      { emoji: "🍳", label: "レシピカード", prompt: "料理レシピカードを作って（写真領域、調理時間、材料リスト、手順のステップ表示つき）" },
      { emoji: "🎵", label: "音楽プレイヤーUI", prompt: "音楽プレイヤーUIを作って（アルバムアート、再生/停止ボタン、プログレスバー、曲リストつき）" },
    ],
  },
];

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function MessageList({ messages, isLoading, status, onPromptClick, onSendMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState("business");

  // Show first 4 prompts on SSR, then shuffle on client to avoid hydration mismatch
  const [displayedPrompts, setDisplayedPrompts] = useState<PromptItem[]>(() => {
    const cat = PROMPT_CATEGORIES.find((c) => c.id === selectedCategory);
    return cat ? cat.prompts.slice(0, 4) : [];
  });

  useEffect(() => {
    const cat = PROMPT_CATEGORIES.find((c) => c.id === selectedCategory);
    if (cat) {
      setDisplayedPrompts(shuffleAndPick(cat.prompts, 4));
    }
  }, [selectedCategory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto max-w-3xl space-y-6 p-4 pb-8">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-6 pt-12 text-center">
            {/* Header */}
            <div className="rounded-full bg-primary/10 p-5">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">生成UI アシスタント</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                AIに話しかけるだけでUIが作れます。試しにクリックしてみましょう。
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex w-full max-w-lg gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PROMPT_CATEGORIES.map((cat) => {
                const isActive = cat.id === selectedCategory;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <cat.icon className={`h-3.5 w-3.5 ${isActive ? cat.color : ""}`} />
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Prompt Cards */}
            <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
              {displayedPrompts.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onPromptClick?.(item.prompt)}
                  className="group flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
                >
                  <span className="text-xl leading-none">{item.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {item.prompt}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Tips Section */}
            <div className="w-full max-w-lg rounded-xl border border-dashed border-border/60 bg-muted/30 px-5 py-4 text-left">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5" />
                こんな使い方もできます
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>&quot;画像をアップロードして、そのUIを再現して&quot;</li>
                <li>&quot;もっと丸みを帯びたデザインにして&quot;</li>
                <li>&quot;ダークモード対応にして&quot;</li>
                <li>デザインスタイルセレクターで雰囲気を指定できます</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message, idx) => {
          let userPrompt: string | undefined;
          if (message.role === "assistant") {
            for (let i = idx - 1; i >= 0; i--) {
              if (messages[i].role === "user") {
                userPrompt = messages[i].parts.find((p) => p.type === "text")?.text || "";
                break;
              }
            }
          }
          return (
            <MessageItem
              key={message.id}
              message={message}
              userPrompt={userPrompt}
              onSendMessage={onSendMessage}
            />
          );
        })}

        {isLoading && (
          <StreamingIndicator status={status} messages={messages} />
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
