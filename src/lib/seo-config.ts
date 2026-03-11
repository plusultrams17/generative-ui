export const SITE_CONFIG = {
  name: "生成UI",
  nameEn: "Generative UI",
  description: "AIがリアルタイムでUIを生成・変更する次世代インターフェース。自然言語でフォーム、テーブル、チャート、カスタムUIを即座に作成。",
  descriptionEn: "Next-generation AI-driven UI generator. Create forms, tables, charts, and custom UI components instantly with natural language.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://generative-ui.vercel.app",
  locale: "ja_JP",
  creator: "生成UI Team",
  keywords: [
    "AI UI生成", "AIドリブンUI", "生成UI", "UIジェネレーター",
    "フォーム生成", "テーブル生成", "チャート生成",
    "Next.js", "React", "Tailwind CSS",
    "GPT-4o", "Claude", "Gemini",
    "ノーコード", "ローコード", "プロトタイプ",
  ],
};

export const PAGE_METADATA: Record<string, { title: string; description: string }> = {
  home: {
    title: "生成UI - AIに話しかけるだけで、UIが生まれる",
    description: "AIがリアルタイムでUIを生成。フォーム、テーブル、チャート、カスタムUIを自然言語で即座に作成。GPT-4o、Claude、Gemini対応。",
  },
  chat: {
    title: "AIチャット | 生成UI",
    description: "AIに自然言語で指示してUIコンポーネントを生成。リアルタイムストリーミングで即座にプレビュー。",
  },
  gallery: {
    title: "ギャラリー | 生成UI",
    description: "生成したUIコンポーネントの一覧。お気に入り登録、再利用、タグ管理が可能。",
  },
  marketplace: {
    title: "マーケットプレイス | 生成UI",
    description: "コミュニティが作成したUIコンポーネントやテンプレートを閲覧・利用。",
  },
  composer: {
    title: "コンポーザー | 生成UI",
    description: "複数のUIコンポーネントを組み合わせてページを構築。ドラッグ&ドロップで簡単レイアウト。",
  },
  settings: {
    title: "設定 | 生成UI",
    description: "APIトークン、AIモデル、テーマ、エージェント設定を管理。",
  },
  stats: {
    title: "統計 | 生成UI",
    description: "UI生成の統計データ。使用頻度、モデル別分析、トレンドを可視化。",
  },
  templates: {
    title: "テンプレート | 生成UI",
    description: "すぐに使えるUIテンプレート集。ログインフォーム、データテーブル、チャート等。",
  },
  showcase: {
    title: "ショーケース | 生成UI",
    description: "ユーザーが公開した優秀なUI作品を閲覧。インスピレーションを得よう。",
  },
  help: {
    title: "ヘルプ | 生成UI",
    description: "生成UIの使い方ガイド。クイックスタート、機能説明、FAQ。",
  },
};
