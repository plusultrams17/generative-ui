export type Template = {
  id: string;
  title: string;
  description: string;
  category: "form" | "table" | "chart" | "custom";
  prompt: string;
  icon: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "login-form",
    title: "ログインフォーム",
    description: "メール・パスワード認証、パスワードリセット、SNSログイン付き",
    category: "form",
    prompt:
      "メールとパスワードのログインフォームを作って。パスワードを忘れたリンクとSNSログインボタン付き",
    icon: "LogIn",
  },
  {
    id: "contact-form",
    title: "お問い合わせフォーム",
    description: "名前・メール・件名・メッセージの入力フォーム",
    category: "form",
    prompt:
      "名前、メール、件名、メッセージのお問い合わせフォームを作って",
    icon: "Mail",
  },
  {
    id: "product-table",
    title: "商品一覧テーブル",
    description: "商品名・価格・在庫数・カテゴリ・ステータスのテーブル",
    category: "table",
    prompt:
      "ECサイトの商品一覧テーブルを作って（商品名、価格、在庫数、カテゴリ、ステータス）サンプルデータ5行付き",
    icon: "ShoppingCart",
  },
  {
    id: "sales-chart",
    title: "売上チャート",
    description: "月別売上の折れ線グラフ（2024年1月〜12月）",
    category: "chart",
    prompt:
      "2024年1月〜12月の月別売上データを折れ線グラフで表示して。売上は100万〜500万の範囲で",
    icon: "TrendingUp",
  },
  {
    id: "pricing-cards",
    title: "料金プランカード",
    description: "フリー・プロ・エンタープライズの3プラン比較",
    category: "custom",
    prompt:
      "SaaSの料金プランを3つ作って（フリー、プロ、エンタープライズ）。機能リストと価格付き",
    icon: "CreditCard",
  },
  {
    id: "dashboard-kpi",
    title: "ダッシュボードKPI",
    description: "売上・ユーザー数・CVR・平均注文額の4カード",
    category: "custom",
    prompt:
      "管理画面のKPIカードを4つ作って（売上、ユーザー数、コンバージョン率、平均注文額）前月比の増減表示付き",
    icon: "BarChart3",
  },
  {
    id: "user-profile",
    title: "ユーザープロフィール",
    description: "アバター・名前・自己紹介・フォロワー数・投稿数",
    category: "custom",
    prompt:
      "SNS風のユーザープロフィールカードを作って（アバター、名前、自己紹介、フォロワー数、投稿数）",
    icon: "User",
  },
  {
    id: "faq-accordion",
    title: "FAQアコーディオン",
    description: "開閉式のよくある質問5つ",
    category: "custom",
    prompt:
      "よくある質問のアコーディオンを5つ作って。開閉できるようにして",
    icon: "HelpCircle",
  },
];

export function getTemplatesByCategory(
  category?: Template["category"]
): Template[] {
  if (!category) return TEMPLATES;
  return TEMPLATES.filter((t) => t.category === category);
}
