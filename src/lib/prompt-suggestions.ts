export type PromptSuggestion = {
  text: string;
  category: "form" | "table" | "chart" | "custom";
};

const SUGGESTION_DB: { keywords: string[]; suggestions: PromptSuggestion[] }[] = [
  {
    keywords: ["フォーム", "form", "入力", "登録", "ログイン"],
    suggestions: [
      { text: "バリデーション付きの登録フォーム", category: "form" },
      { text: "ステップ形式のウィザードフォーム", category: "form" },
      { text: "検索フィルターフォーム", category: "form" },
    ],
  },
  {
    keywords: ["テーブル", "table", "一覧", "リスト", "データ"],
    suggestions: [
      { text: "ソート可能な商品一覧テーブル", category: "table" },
      { text: "ステータスバッジ付きタスク管理テーブル", category: "table" },
      { text: "売上レポートのデータテーブル", category: "table" },
    ],
  },
  {
    keywords: ["グラフ", "チャート", "chart", "可視化", "統計"],
    suggestions: [
      { text: "月別売上の折れ線グラフ", category: "chart" },
      { text: "カテゴリ別シェアの円グラフ", category: "chart" },
      { text: "年間比較の棒グラフ", category: "chart" },
    ],
  },
  {
    keywords: ["カード", "プロフィール", "ダッシュボード", "LP", "ヒーロー"],
    suggestions: [
      { text: "SNSリンク付きプロフィールカード", category: "custom" },
      { text: "KPI表示のダッシュボード", category: "custom" },
      { text: "CTAボタン付きヒーローセクション", category: "custom" },
    ],
  },
  {
    keywords: ["ボタン", "メニュー", "ナビ", "ヘッダー", "フッター"],
    suggestions: [
      { text: "レスポンシブなナビゲーションバー", category: "custom" },
      { text: "ドロップダウンメニュー付きヘッダー", category: "custom" },
      { text: "サイトマップ付きフッター", category: "custom" },
    ],
  },
  {
    keywords: ["価格", "料金", "プラン", "pricing"],
    suggestions: [
      { text: "3プランの料金比較カード", category: "custom" },
      { text: "機能比較テーブル付き料金ページ", category: "table" },
      { text: "月額/年額切り替えの料金カード", category: "custom" },
    ],
  },
  {
    keywords: ["タイマー", "カウント", "時計", "通知"],
    suggestions: [
      { text: "カウントダウンタイマーコンポーネント", category: "custom" },
      { text: "通知バッジ付きベルアイコン", category: "custom" },
      { text: "アナログ時計コンポーネント", category: "custom" },
    ],
  },
];

export function getSuggestions(input: string): PromptSuggestion[] {
  if (!input || input.length < 2) return [];

  const lower = input.toLowerCase();
  const matched: PromptSuggestion[] = [];

  for (const group of SUGGESTION_DB) {
    if (group.keywords.some((kw) => lower.includes(kw))) {
      for (const s of group.suggestions) {
        if (!matched.some((m) => m.text === s.text)) {
          matched.push(s);
        }
      }
    }
  }

  return matched.slice(0, 4);
}

export function enhancePrompt(input: string): string {
  const additions: string[] = [];

  if (!/レスポンシブ|responsive|モバイル/i.test(input)) {
    additions.push("レスポンシブ対応で");
  }
  if (!/日本語|Japanese/i.test(input)) {
    additions.push("日本語UIで");
  }
  if (!/色|カラー|テーマ|color/i.test(input)) {
    additions.push("モダンな配色で");
  }

  if (additions.length === 0) return input;
  return `${input}（${additions.join("、")}）`;
}
