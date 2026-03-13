import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const TOOLS = [
  {
    slug: "form-generator",
    title: "AIフォームジェネレーター",
    description:
      "AIに話しかけるだけで、ログインフォーム、お問い合わせフォーム、登録フォームなどを自動生成。バリデーション付きのReactコンポーネントを即座に作成します。",
    keywords: [
      "AIフォームジェネレーター",
      "フォーム自動作成",
      "React フォーム生成",
    ],
    examples: [
      { title: "ログインフォーム", prompt: "ログインフォームを作って" },
      {
        title: "お問い合わせフォーム",
        prompt: "お問い合わせフォームを作って",
      },
      {
        title: "ユーザー登録フォーム",
        prompt: "ユーザー登録フォームを作って（名前、メール、パスワード）",
      },
    ],
    relatedSlugs: ["table-generator", "ui-generator"],
  },
  {
    slug: "table-generator",
    title: "AIテーブル生成ツール",
    description:
      "データテーブル、一覧表、管理画面のテーブルをAIで自動生成。ソート、フィルター、ページネーション対応。",
    keywords: [
      "AIテーブル生成",
      "データテーブル 自動生成",
      "React テーブル",
    ],
    examples: [
      { title: "社員一覧テーブル", prompt: "社員一覧のテーブルを作って" },
      {
        title: "商品管理テーブル",
        prompt: "ECサイトの商品管理テーブルを作って",
      },
      { title: "注文履歴テーブル", prompt: "注文履歴テーブルを作って" },
    ],
    relatedSlugs: ["chart-generator", "form-generator"],
  },
  {
    slug: "chart-generator",
    title: "AIチャート生成ツール",
    description:
      "棒グラフ、折れ線グラフ、円グラフなどのデータビジュアライゼーションをAIで自動生成。Rechartsベースの美しいチャート。",
    keywords: ["AIチャート生成", "グラフ自動作成", "データ可視化 AI"],
    examples: [
      {
        title: "月別売上棒グラフ",
        prompt: "月別売上を棒グラフで表示して",
      },
      {
        title: "部署別円グラフ",
        prompt: "部署別の人員構成を円グラフで表示して",
      },
      {
        title: "売上推移折れ線グラフ",
        prompt: "過去12ヶ月の売上推移を折れ線グラフで表示して",
      },
    ],
    relatedSlugs: ["table-generator", "ui-generator"],
  },
  {
    slug: "ui-generator",
    title: "AI UIジェネレーター",
    description:
      "カスタムUIコンポーネントをAIで自動生成。プロフィールカード、ダッシュボード、ナビゲーションなど、あらゆるUIを自然言語で作成。",
    keywords: [
      "AI UIジェネレーター",
      "UIコンポーネント 自動生成",
      "React UI 生成",
    ],
    examples: [
      {
        title: "プロフィールカード",
        prompt: "モダンなプロフィールカードを作って",
      },
      {
        title: "KPIダッシュボード",
        prompt: "KPIダッシュボードを作って",
      },
      {
        title: "ヒーローセクション",
        prompt: "SaaSのヒーローセクションを作って",
      },
    ],
    relatedSlugs: ["form-generator", "chart-generator"],
  },
];

export function generateStaticParams() {
  return TOOLS.map((t) => ({ tool: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool: toolSlug } = await params;
  const tool = TOOLS.find((t) => t.slug === toolSlug);
  if (!tool) return {};
  return {
    title: `${tool.title} | 生成UI`,
    description: tool.description,
    keywords: tool.keywords,
    openGraph: {
      title: `${tool.title} | 生成UI`,
      description: tool.description,
      type: "website",
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool: toolSlug } = await params;
  const tool = TOOLS.find((t) => t.slug === toolSlug);
  if (!tool) notFound();

  const relatedTools = TOOLS.filter((t) => tool.relatedSlugs.includes(t.slug));

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <nav className="border-b bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                ホーム
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/tools"
                className="hover:text-foreground transition-colors"
              >
                ツール
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">{tool.title}</li>
          </ol>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {tool.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {tool.description}
          </p>
        </div>

        {/* Examples */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6">作れるUIの例</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tool.examples.map((example) => (
              <div
                key={example.title}
                className="rounded-xl border bg-card p-5 flex flex-col"
              >
                <h3 className="text-sm font-semibold mb-2">{example.title}</h3>
                <p className="text-xs text-muted-foreground mb-4 flex-1">
                  &ldquo;{example.prompt}&rdquo;
                </p>
                <Link
                  href={`/chat?prompt=${encodeURIComponent(example.prompt)}`}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  試す
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* How to use */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6">使い方</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "プロンプトを送信",
                desc: "作りたいUIを自然言語で入力します。上の例をそのまま使ってもOK。",
              },
              {
                step: "2",
                title: "AIがUIを生成",
                desc: "AIがリアルタイムでUIコンポーネントを生成。数秒でプレビューが表示されます。",
              },
              {
                step: "3",
                title: "カスタマイズ・エクスポート",
                desc: "生成されたUIを自由に編集。HTMLやJSONでエクスポートできます。",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-lg border bg-card p-6 text-center"
              >
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-16 rounded-xl border bg-muted/30 p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">
            無料で{tool.title}を使う
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            アカウント登録不要で今すぐお試しいただけます
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            無料で始める
          </Link>
        </section>

        {/* Related tools */}
        {relatedTools.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">関連ツール</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedTools.map((related) => (
                <Link
                  key={related.slug}
                  href={`/tools/${related.slug}`}
                  className="group rounded-lg border bg-card p-5 hover:border-primary/50 transition-colors"
                >
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {related.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {related.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to tools */}
        <div className="text-center">
          <Link
            href="/tools"
            className="inline-flex items-center justify-center rounded-lg border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            他のツールを見る
          </Link>
        </div>
      </main>
    </div>
  );
}
