"use client";

import { useState } from "react";
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
import {
  ArrowLeft,
  HelpCircle,
  MessageSquare,
  LayoutGrid,
  Globe,
  Store,
  FileText,
  Bot,
  GitBranch,
  Layers,
  FolderOpen,
  Users,
  FileCheck,
  Presentation,
  BarChart3,
  Settings,
  Shield,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Keyboard,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// Feature list matching sidebar exactly
const FEATURES: {
  category: string;
  items: { href: string; icon: LucideIcon; label: string; description: string }[];
}[] = [
  {
    category: "メイン",
    items: [
      {
        href: "/chat",
        icon: MessageSquare,
        label: "チャット",
        description:
          "AIとの対話でUIコンポーネントを生成。フォーム、テーブル、チャート、カスタムコンポーネントに対応。",
      },
      {
        href: "/gallery",
        icon: LayoutGrid,
        label: "ギャラリー",
        description:
          "生成したUIの履歴を閲覧・管理。お気に入り登録やタグ付けで整理。",
      },
      {
        href: "/showcase",
        icon: Globe,
        label: "ショーケース",
        description:
          "共有・公開されたUIコンポーネントを一覧表示。他のユーザーの作品を参考にできます。",
      },
      {
        href: "/marketplace",
        icon: Store,
        label: "マーケットプレイス",
        description:
          "UIコンポーネントの共有プラットフォーム。公開・いいね・ダウンロードが可能。",
      },
    ],
  },
  {
    category: "ツール",
    items: [
      {
        href: "/templates",
        icon: FileText,
        label: "テンプレート",
        description:
          "プリセットUIテンプレートのライブラリ。ワンクリックでチャットに適用して即座に利用開始。",
      },
      {
        href: "/agent-builder",
        icon: Bot,
        label: "エージェントビルダー",
        description:
          "AIエージェントのワークフローをビジュアルに構築。ノードをドラッグ&ドロップで接続。",
      },
      {
        href: "/orchestration",
        icon: GitBranch,
        label: "オーケストレーション",
        description:
          "複数エージェントの連携・協調動作を視覚化。シミュレーション実行可能。",
      },
      {
        href: "/composer",
        icon: Layers,
        label: "コンポーザー",
        description:
          "複数のUIコンポーネントを組み合わせてページを構成。HTMLやZIPでエクスポート。",
      },
    ],
  },
  {
    category: "管理",
    items: [
      {
        href: "/projects",
        icon: FolderOpen,
        label: "プロジェクト",
        description:
          "カンバンボードでプロジェクトを管理。ステータス追跡、予算管理、ブランド設定に対応。",
      },
      {
        href: "/clients",
        icon: Users,
        label: "クライアント",
        description:
          "クライアント情報のCRM。連絡先、ステータス管理、プロジェクト紐付け。",
      },
      {
        href: "/proposals",
        icon: FileCheck,
        label: "提案書",
        description:
          "見積書・提案書の作成と管理。明細行、税計算、ステータス管理、プレビュー。",
      },
      {
        href: "/presentations",
        icon: Presentation,
        label: "プレゼンテーション",
        description:
          "スライドベースのプレゼンテーション作成。フルスクリーン表示、キーボード操作対応。",
      },
    ],
  },
  {
    category: "システム",
    items: [
      {
        href: "/stats",
        icon: BarChart3,
        label: "統計",
        description:
          "生成履歴の分析ダッシュボード。KPI、ツール分布、トレンド、キーワード分析。",
      },
      {
        href: "/settings",
        icon: Settings,
        label: "設定",
        description:
          "APIトークン管理、デフォルトモデル選択、データ管理、エージェント設定。",
      },
      {
        href: "/admin",
        icon: Shield,
        label: "管理者",
        description:
          "エンタープライズ管理。ユーザー管理、監査ログ、コスト管理、SSO設定。",
      },
      {
        href: "/help",
        icon: HelpCircle,
        label: "ヘルプ",
        description: "このページです。アプリの使い方やよくある質問を確認できます。",
      },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: "どのようにUIを生成しますか？",
    a: "チャットページでプロンプトを入力すると、AIが自動的にUIコンポーネントを生成します。フォーム、テーブル、チャート、カスタムコンポーネントの4種類に対応しています。例えば「ログインフォームを作って」と入力するだけでOKです。",
  },
  {
    q: "生成したUIをエクスポートするには？",
    a: "生成されたコンポーネントのプレビュー画面から「コードをコピー」でクリップボードにコピーできます。また、コンポーザー機能を使えば複数コンポーネントを組み合わせてHTMLファイルやZIPプロジェクトとしてダウンロードできます。",
  },
  {
    q: "プロジェクトとクライアントの関係は？",
    a: "クライアントページでクライアント情報を登録し、プロジェクト作成時にクライアントを紐付けます。提案書やブランド設定もプロジェクト単位で管理できます。",
  },
  {
    q: "マーケットプレイスにコンポーネントを公開するには？",
    a: "マーケットプレイスページの「公開する」ボタンをクリックし、タイトル・説明・コード・ツールタイプ・タグを入力して公開します。公開後は他のユーザーがいいねやダウンロードできます。",
  },
  {
    q: "エージェントビルダーとは？",
    a: "AIエージェントのワークフローをビジュアルに設計するツールです。トリガー、アクション、条件、出力の4種類のノードをキャンバス上に配置し、接続することでエージェントの動作フローを定義できます。",
  },
  {
    q: "複数のAIモデルを切り替えるには？",
    a: "チャットページのモデルセレクターからGPT-4o、Claude Sonnet、Gemini Flashなどを選択できます。設定ページでデフォルトモデルを変更することも可能です。",
  },
  {
    q: "データはどこに保存されますか？",
    a: "現在、すべてのデータはブラウザのLocalStorageに保存されます。ブラウザのデータを消去すると失われるため、重要なコンポーネントはエクスポートしておくことをお勧めします。",
  },
];

const SHORTCUTS = [
  { keys: "Ctrl + Enter", description: "メッセージを送信" },
  { keys: "Ctrl + K", description: "チャット入力にフォーカス" },
  { keys: "Ctrl + /", description: "ショートカット一覧を表示" },
  { keys: "Esc", description: "モーダル・ダイアログを閉じる" },
  { keys: "← →", description: "プレゼンテーションのスライド移動" },
  { keys: "Space", description: "プレゼンテーションの次のスライド" },
];

export default function HelpPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
          <HelpCircle className="size-5 text-primary" />
          <h1 className="text-lg font-semibold">ヘルプ</h1>
        </div>
      </header>

      <main className="flex-1 space-y-10 p-4 pb-12 max-w-4xl mx-auto w-full">
        {/* Getting Started */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="size-4 text-primary" />
            <h2 className="text-base font-semibold">はじめに</h2>
          </div>
          <Card className="py-0 overflow-hidden">
            <CardContent className="p-0">
              <ol className="divide-y">
                {[
                  {
                    step: 1,
                    title: "チャットでUIを生成する",
                    desc: "チャットページでプロンプトを入力し、AIにUIコンポーネントを生成してもらいます。",
                  },
                  {
                    step: 2,
                    title: "ギャラリーで生成物を管理する",
                    desc: "生成したUIはギャラリーに自動保存。お気に入りやタグで整理しましょう。",
                  },
                  {
                    step: 3,
                    title: "コンポーザーでレイアウトを組み合わせる",
                    desc: "複数のコンポーネントを組み合わせてページ全体のレイアウトを構成。エクスポート可能。",
                  },
                  {
                    step: 4,
                    title: "プロジェクトで案件を管理する",
                    desc: "クライアント情報・提案書・プレゼンテーションと連携して案件全体を管理。",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-4 px-5 py-4"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* Feature List */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-base font-semibold">機能一覧</h2>
          </div>
          <div className="space-y-6">
            {FEATURES.map((group) => (
              <div key={group.category}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.category}
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <Card className="gap-2 py-3 transition-colors hover:bg-muted/50 cursor-pointer">
                          <CardHeader className="flex-row items-center gap-3 px-4 py-0">
                            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                              <Icon className="size-4 text-primary" />
                            </div>
                            <CardTitle className="text-sm">
                              {item.label}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 py-0">
                            <CardDescription className="text-xs">
                              {item.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="size-4 text-primary" />
            <h2 className="text-base font-semibold">よくある質問</h2>
          </div>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <Card
                  key={i}
                  className="gap-0 py-0 cursor-pointer overflow-hidden"
                  onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                >
                  <CardHeader className="flex-row items-center justify-between px-4 py-3">
                    <CardTitle className="text-sm font-medium">
                      {item.q}
                    </CardTitle>
                    {isOpen ? (
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </CardHeader>
                  {isOpen && (
                    <CardContent className="border-t px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        {item.a}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Keyboard className="size-4 text-primary" />
            <h2 className="text-base font-semibold">キーボードショートカット</h2>
          </div>
          <Card className="py-0 overflow-hidden">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      キー
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {SHORTCUTS.map((s) => (
                    <tr key={s.keys}>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="font-mono text-xs">
                          {s.keys}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-sm">
                        {s.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        {/* Version Info */}
        <section>
          <Card className="gap-2 py-4">
            <CardContent className="px-4 text-center">
              <p className="text-sm font-medium">生成UI v0.1.0</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Next.js 16 &middot; React 19 &middot; Tailwind CSS &middot;
                shadcn/ui &middot; Zustand
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
