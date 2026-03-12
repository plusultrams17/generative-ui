export type Feature =
  | "chat"
  | "gallery"
  | "templates"
  | "marketplace"
  | "showcase"
  | "help"
  | "settings"
  | "stats"
  | "clients"
  | "proposals"
  | "projects"
  | "presentations"
  | "composer"
  | "orchestration"
  | "agent-builder"
  | "vercel-deploy"
  | "github-push"
  | "all-models";

type Plan = "free" | "pro";

const FEATURE_ACCESS: Record<Feature, Plan[]> = {
  // Free features
  chat: ["free", "pro"],
  gallery: ["free", "pro"],
  templates: ["free", "pro"],
  marketplace: ["free", "pro"],
  showcase: ["free", "pro"],
  help: ["free", "pro"],
  settings: ["free", "pro"],
  stats: ["free", "pro"],

  // Pro-only features
  clients: ["pro"],
  proposals: ["pro"],
  projects: ["pro"],
  presentations: ["pro"],
  composer: ["pro"],
  orchestration: ["pro"],
  "agent-builder": ["pro"],
  "vercel-deploy": ["pro"],
  "github-push": ["pro"],
  "all-models": ["pro"],
};

export function hasFeatureAccess(feature: Feature, plan: Plan): boolean {
  return FEATURE_ACCESS[feature]?.includes(plan) ?? false;
}

export const PRO_FEATURES: { feature: Feature; label: string }[] = [
  { feature: "clients", label: "クライアント管理" },
  { feature: "proposals", label: "提案書・見積書" },
  { feature: "presentations", label: "プレゼンテーション" },
  { feature: "projects", label: "プロジェクト管理" },
  { feature: "composer", label: "コンポーザー" },
  { feature: "orchestration", label: "オーケストレーション" },
  { feature: "agent-builder", label: "エージェントビルダー" },
  { feature: "vercel-deploy", label: "Vercelデプロイ" },
  { feature: "github-push", label: "GitHub連携" },
  { feature: "all-models", label: "全AIモデル対応" },
];
