export type ParamType = "text" | "select" | "color" | "number" | "toggle";

export type TemplateParam = {
  key: string;
  label: string;
  type: ParamType;
  defaultValue: string;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
};

export type CustomizableTemplate = {
  id: string;
  title: string;
  description: string;
  category: string;
  basePrompt: string;
  params: TemplateParam[];
};

export const CUSTOMIZABLE_TEMPLATES: CustomizableTemplate[] = [
  {
    id: "custom-form",
    title: "カスタムフォーム",
    description: "タイトル・フィールド数・テーマカラーなどを指定して入力フォームを生成",
    category: "form",
    basePrompt:
      "「{{title}}」というタイトルの入力フォームを作成してください。フィールド数は{{fields}}個、テーマカラーは{{color}}、バリデーションは{{validation}}、送信先は「{{destination}}」です。レスポンシブ対応で美しいデザインにしてください。",
    params: [
      {
        key: "title",
        label: "フォームタイトル",
        type: "text",
        defaultValue: "お問い合わせ",
        placeholder: "例: お問い合わせ、会員登録",
      },
      {
        key: "fields",
        label: "フィールド数",
        type: "number",
        defaultValue: "5",
        min: 3,
        max: 10,
      },
      {
        key: "color",
        label: "テーマカラー",
        type: "color",
        defaultValue: "#3b82f6",
      },
      {
        key: "validation",
        label: "バリデーション",
        type: "toggle",
        defaultValue: "true",
      },
      {
        key: "destination",
        label: "送信先",
        type: "text",
        defaultValue: "管理者メール",
        placeholder: "例: 管理者メール、Slack通知",
      },
    ],
  },
  {
    id: "data-table",
    title: "データテーブル",
    description: "カラム数・ソート・ページネーションなどを指定してテーブルを生成",
    category: "table",
    basePrompt:
      "「{{tableName}}」というデータテーブルを作成してください。カラム数は{{columns}}個、ソート機能は{{sort}}、ページネーションは{{pagination}}、スタイルは「{{style}}」です。サンプルデータ5行付きでお願いします。",
    params: [
      {
        key: "tableName",
        label: "テーブル名",
        type: "text",
        defaultValue: "商品一覧",
        placeholder: "例: 商品一覧、ユーザー管理",
      },
      {
        key: "columns",
        label: "カラム数",
        type: "number",
        defaultValue: "5",
        min: 3,
        max: 8,
      },
      {
        key: "sort",
        label: "ソート機能",
        type: "toggle",
        defaultValue: "true",
      },
      {
        key: "pagination",
        label: "ページネーション",
        type: "toggle",
        defaultValue: "true",
      },
      {
        key: "style",
        label: "スタイル",
        type: "select",
        defaultValue: "ストライプ",
        options: ["シンプル", "ストライプ", "ボーダー"],
      },
    ],
  },
  {
    id: "dashboard",
    title: "ダッシュボード",
    description: "KPI数・チャートタイプ・カラースキームを指定してダッシュボードを生成",
    category: "chart",
    basePrompt:
      "管理ダッシュボードを作成してください。KPIカードは{{kpiCount}}個、チャートタイプは「{{chartType}}」、カラースキームは{{colorScheme}}、データ密度は「{{density}}」です。前月比の増減表示も含めてください。",
    params: [
      {
        key: "kpiCount",
        label: "KPI数",
        type: "number",
        defaultValue: "4",
        min: 2,
        max: 6,
      },
      {
        key: "chartType",
        label: "チャートタイプ",
        type: "select",
        defaultValue: "棒グラフ",
        options: ["棒グラフ", "円グラフ", "折れ線グラフ"],
      },
      {
        key: "colorScheme",
        label: "カラースキーム",
        type: "color",
        defaultValue: "#6366f1",
      },
      {
        key: "density",
        label: "データ密度",
        type: "select",
        defaultValue: "中",
        options: ["低", "中", "高"],
      },
    ],
  },
  {
    id: "landing-page",
    title: "ランディングページ",
    description: "製品名・キャッチコピー・CTAなどを指定してLPを生成",
    category: "custom",
    basePrompt:
      "「{{productName}}」のランディングページを作成してください。キャッチコピーは「{{catchcopy}}」、CTAボタンのテキストは「{{ctaText}}」、セクション数は{{sections}}個、スタイルは「{{style}}」です。魅力的なデザインでお願いします。",
    params: [
      {
        key: "productName",
        label: "製品名",
        type: "text",
        defaultValue: "MyApp",
        placeholder: "例: MyApp、CloudSync",
      },
      {
        key: "catchcopy",
        label: "キャッチコピー",
        type: "text",
        defaultValue: "あなたの仕事を変える",
        placeholder: "例: あなたの仕事を変える",
      },
      {
        key: "ctaText",
        label: "CTAテキスト",
        type: "text",
        defaultValue: "無料で始める",
        placeholder: "例: 無料で始める、今すぐ登録",
      },
      {
        key: "sections",
        label: "セクション数",
        type: "number",
        defaultValue: "3",
        min: 2,
        max: 5,
      },
      {
        key: "style",
        label: "スタイル",
        type: "select",
        defaultValue: "モダン",
        options: ["モダン", "ミニマル", "大胆"],
      },
    ],
  },
  {
    id: "profile-card",
    title: "プロフィールカード",
    description: "名前・役職・SNSリンク数などを指定してプロフィールカードを生成",
    category: "custom",
    basePrompt:
      "プロフィールカードを作成してください。名前は「{{name}}」、役職は「{{role}}」、SNSリンクは{{snsCount}}個、レイアウトは「{{layout}}」、画像形状は「{{imageShape}}」です。洗練されたデザインでお願いします。",
    params: [
      {
        key: "name",
        label: "名前",
        type: "text",
        defaultValue: "田中太郎",
        placeholder: "例: 田中太郎",
      },
      {
        key: "role",
        label: "役職",
        type: "text",
        defaultValue: "フロントエンドエンジニア",
        placeholder: "例: フロントエンドエンジニア",
      },
      {
        key: "snsCount",
        label: "SNSリンク数",
        type: "number",
        defaultValue: "3",
        min: 1,
        max: 5,
      },
      {
        key: "layout",
        label: "レイアウト",
        type: "select",
        defaultValue: "横",
        options: ["横", "縦"],
      },
      {
        key: "imageShape",
        label: "画像形状",
        type: "select",
        defaultValue: "丸",
        options: ["丸", "四角", "角丸"],
      },
    ],
  },
  {
    id: "navbar",
    title: "ナビゲーションバー",
    description: "サイト名・メニュー項目数・スタイルなどを指定してナビバーを生成",
    category: "custom",
    basePrompt:
      "ナビゲーションバーを作成してください。サイト名は「{{siteName}}」、メニュー項目は{{menuItems}}個、スタイルは「{{style}}」、ダークモードは{{darkMode}}、ロゴ位置は「{{logoPosition}}」です。レスポンシブ対応でお願いします。",
    params: [
      {
        key: "siteName",
        label: "サイト名",
        type: "text",
        defaultValue: "MySite",
        placeholder: "例: MySite、TechBlog",
      },
      {
        key: "menuItems",
        label: "メニュー項目数",
        type: "number",
        defaultValue: "5",
        min: 3,
        max: 7,
      },
      {
        key: "style",
        label: "スタイル",
        type: "select",
        defaultValue: "固定",
        options: ["固定", "スクロール"],
      },
      {
        key: "darkMode",
        label: "ダークモード",
        type: "toggle",
        defaultValue: "false",
      },
      {
        key: "logoPosition",
        label: "ロゴ位置",
        type: "select",
        defaultValue: "左",
        options: ["左", "中央"],
      },
    ],
  },
];

export function buildPrompt(
  template: CustomizableTemplate,
  values: Record<string, string>
): string {
  let prompt = template.basePrompt;
  for (const param of template.params) {
    const raw = values[param.key] ?? param.defaultValue;
    const value = param.type === "toggle" ? (raw === "true" ? "あり" : "なし") : raw;
    prompt = prompt.replace(new RegExp(`\\{\\{${param.key}\\}\\}`, "g"), value);
  }
  return prompt;
}
