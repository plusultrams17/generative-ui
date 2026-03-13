import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const SEO_TEMPLATES = [
  {
    slug: "login-form",
    title: "ログインフォーム",
    description:
      "AIがモダンなログインフォームを自動生成。メール、パスワード、ソーシャルログイン対応。",
    keywords: [
      "ログインフォーム AI生成",
      "ログインフォーム 自動生成",
      "React ログインフォーム",
    ],
    prompt:
      "モダンなログインフォームを作って（メール、パスワード、ソーシャルログインボタン、パスワード忘れリンクつき）",
    features: [
      "メール/パスワード入力",
      "ソーシャルログインボタン",
      "パスワードリセットリンク",
      "バリデーション付き",
    ],
    category: "アプリ",
    relatedSlugs: ["contact-form", "profile-card"],
  },
  {
    slug: "contact-form",
    title: "お問い合わせフォーム",
    description:
      "AIがお問い合わせフォームを自動生成。名前、メール、カテゴリ選択、メッセージ入力対応。",
    keywords: ["お問い合わせフォーム AI", "コンタクトフォーム 自動生成"],
    prompt:
      "お問い合わせフォームを作って（名前、メール、カテゴリ選択、メッセージ入力つき）",
    features: [
      "名前・メール入力",
      "カテゴリドロップダウン",
      "メッセージテキストエリア",
      "送信ボタン",
    ],
    category: "Webサイト",
    relatedSlugs: ["login-form", "hero-section"],
  },
  {
    slug: "sales-chart",
    title: "売上チャート",
    description:
      "AIが月別売上チャートを自動生成。棒グラフ、折れ線グラフ、ツールチップ対応。",
    keywords: ["売上チャート 自動生成", "売上グラフ AI", "Recharts 売上"],
    prompt:
      "2024年の月別売上を棒グラフで表示して（ツールチップ、軸ラベルつき）",
    features: [
      "月別棒グラフ",
      "ツールチップ表示",
      "軸ラベル",
      "レスポンシブ対応",
    ],
    category: "データ",
    relatedSlugs: ["dashboard-kpi", "employee-table"],
  },
  {
    slug: "pricing-cards",
    title: "料金プランカード",
    description:
      "AIが料金プラン比較UIを自動生成。3プラン構成、おすすめバッジ、機能比較表つき。",
    keywords: [
      "料金プラン UI",
      "プライシングカード 生成",
      "SaaS 料金テーブル",
    ],
    prompt:
      "料金プラン比較テーブルを作って（3プラン、機能一覧のチェックマーク、おすすめバッジつき）",
    features: [
      "3プラン比較",
      "おすすめバッジ",
      "機能チェックリスト",
      "CTAボタン",
    ],
    category: "Webサイト",
    relatedSlugs: ["hero-section", "contact-form"],
  },
  {
    slug: "dashboard-kpi",
    title: "KPIダッシュボード",
    description:
      "AIがKPIダッシュボードを自動生成。指標カード、折れ線グラフ、前月比表示つき。",
    keywords: [
      "KPIダッシュボード 自動生成",
      "管理画面 AI",
      "ダッシュボード テンプレート",
    ],
    prompt:
      "KPIダッシュボードを作って（4つの指標カード、折れ線グラフ、前月比の増減表示つき）",
    features: [
      "4つのKPIカード",
      "折れ線グラフ",
      "前月比増減",
      "レスポンシブレイアウト",
    ],
    category: "ビジネス",
    relatedSlugs: ["sales-chart", "employee-table"],
  },
  {
    slug: "employee-table",
    title: "社員一覧テーブル",
    description:
      "AIが社員一覧テーブルを自動生成。名前、部署、役職、ソート、検索機能つき。",
    keywords: [
      "社員一覧 テーブル",
      "社員管理 UI",
      "データテーブル 自動生成",
    ],
    prompt:
      "社員一覧のテーブルを作って（名前、部署、役職、入社年、メールアドレス付き）",
    features: ["社員データ一覧", "部署・役職表示", "入社年", "メールアドレス"],
    category: "ビジネス",
    relatedSlugs: ["dashboard-kpi", "sales-chart"],
  },
  {
    slug: "hero-section",
    title: "ヒーローセクション",
    description:
      "AIがSaaSサイトのヒーローセクションを自動生成。キャッチコピー、CTA、イメージ付き。",
    keywords: [
      "ヒーローセクション AI",
      "ランディングページ 自動生成",
      "SaaS ヒーロー",
    ],
    prompt:
      "SaaSサービスのヒーローセクションを作って（キャッチコピー、CTAボタン、イメージ領域つき）",
    features: [
      "キャッチコピー",
      "CTAボタン",
      "イメージ領域",
      "レスポンシブ対応",
    ],
    category: "Webサイト",
    relatedSlugs: ["pricing-cards", "contact-form"],
  },
  {
    slug: "profile-card",
    title: "プロフィールカード",
    description:
      "AIがモダンなプロフィールカードを自動生成。アバター、統計情報、フォローボタン付き。",
    keywords: [
      "プロフィールカード UI",
      "SNS プロフィール",
      "ユーザーカード 生成",
    ],
    prompt:
      "プロフィールカードを作って（アバター、名前、自己紹介、統計情報、フォローボタンつき）",
    features: [
      "アバター画像",
      "自己紹介テキスト",
      "フォロワー統計",
      "フォローボタン",
    ],
    category: "アプリ",
    relatedSlugs: ["login-form", "dashboard-kpi"],
  },
];

export function generateStaticParams() {
  return SEO_TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const template = SEO_TEMPLATES.find((t) => t.slug === slug);
  if (!template) return {};
  return {
    title: `${template.title}をAIで自動生成 | 生成UI`,
    description: template.description,
    keywords: template.keywords,
    openGraph: {
      title: `${template.title}をAIで自動生成 | 生成UI`,
      description: template.description,
      type: "website",
    },
  };
}

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = SEO_TEMPLATES.find((t) => t.slug === slug);
  if (!template) notFound();

  const relatedTemplates = SEO_TEMPLATES.filter((t) =>
    template.relatedSlugs.includes(t.slug)
  );

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
                href="/templates"
                className="hover:text-foreground transition-colors"
              >
                テンプレート
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">{template.title}</li>
          </ol>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <div className="mb-12">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            {template.category}
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {template.title}をAIで自動生成
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {template.description}
          </p>
        </div>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">含まれる機能</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {template.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <svg
                    className="size-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="mb-16 rounded-xl border bg-muted/30 p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">
            今すぐ{template.title}を作成
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            ボタンをクリックするだけで、AIが{template.title}を自動生成します
          </p>
          <Link
            href={`/chat?prompt=${encodeURIComponent(template.prompt)}`}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            このテンプレートを試す（無料）
          </Link>
        </section>

        {/* How to use */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6">使い方</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "プロンプトを送信",
                desc: "上のボタンをクリックするか、自分でプロンプトを入力してAIに指示します。",
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

        {/* Related templates */}
        {relatedTemplates.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-semibold mb-6">
              関連テンプレート
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedTemplates.map((related) => (
                <Link
                  key={related.slug}
                  href={`/templates/${related.slug}`}
                  className="group rounded-lg border bg-card p-5 hover:border-primary/50 transition-colors"
                >
                  <span className="text-xs text-muted-foreground">
                    {related.category}
                  </span>
                  <h3 className="text-sm font-semibold mt-1 group-hover:text-primary transition-colors">
                    {related.title}をAIで自動生成
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {related.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <div className="text-center">
          <Link
            href="/templates"
            className="inline-flex items-center justify-center rounded-lg border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            他のテンプレートも見る
          </Link>
        </div>
      </main>
    </div>
  );
}
