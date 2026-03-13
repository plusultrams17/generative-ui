import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Check,
  X,
  Crown,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { JsonLd, BreadcrumbJsonLd } from "@/components/shared/json-ld";
import { SITE_CONFIG } from "@/lib/seo-config";

type ComparisonFeature = {
  label: string;
  generativeUi: string | boolean;
  competitor: string | boolean;
};

type CompetitorData = {
  slug: string;
  name: string;
  displayName: string;
  title: string;
  description: string;
  metaDescription: string;
  intro: string;
  features: ComparisonFeature[];
  strengths: string[];
  competitorWeaknesses: string[];
};

const COMPETITORS: CompetitorData[] = [
  {
    slug: "v0",
    name: "v0",
    displayName: "v0 (Vercel)",
    title: "v0 (Vercel)の代替ツール",
    description: "v0とは異なり、生成UIは日本語に完全対応。業務管理機能やマルチAIモデル対応で、日本のWeb制作現場に最適化されています。",
    metaDescription: "v0 (Vercel)と生成UIの機能・料金を徹底比較。日本語対応、マルチAIモデル、クライアント管理など生成UIの強みを解説。無料で試せます。",
    intro: "v0はVercelが提供するAI UIジェネレーターで、プロンプトからReactコンポーネントを生成できます。しかし、日本語対応やビジネス向け機能では生成UIが優れています。",
    features: [
      { label: "日本語対応", generativeUi: "完全対応", competitor: "英語のみ" },
      { label: "月額料金", generativeUi: "¥3,980 (Pro)", competitor: "$20 (~¥3,000)" },
      { label: "無料プラン", generativeUi: true, competitor: true },
      { label: "AIモデル", generativeUi: "GPT-4o / Claude / Gemini", competitor: "独自モデル" },
      { label: "APIキー持ち込み(BYOK)", generativeUi: true, competitor: false },
      { label: "クライアント管理", generativeUi: true, competitor: false },
      { label: "提案書・見積書", generativeUi: true, competitor: false },
      { label: "プロジェクト管理", generativeUi: true, competitor: false },
      { label: "Vercelデプロイ", generativeUi: true, competitor: true },
      { label: "GitHub連携", generativeUi: true, competitor: true },
      { label: "テンプレート", generativeUi: true, competitor: true },
      { label: "リアルタイムプレビュー", generativeUi: true, competitor: true },
    ],
    strengths: [
      "日本語プロンプトで自然にUI生成 — 英語を使う必要なし",
      "GPT-4o、Claude、Geminiから最適なモデルを選択可能",
      "自分のAPIキーで無制限生成（BYOK対応）",
      "クライアント管理・提案書・見積書など業務ツール内蔵",
      "1日あたり約130円で全機能利用可能",
    ],
    competitorWeaknesses: [
      "英語のみ対応 — 日本語プロンプトの精度が低い",
      "AIモデルの選択肢がない",
      "業務管理機能がなく、UI生成に特化",
      "APIキー持ち込み（BYOK）非対応",
    ],
  },
  {
    slug: "bolt-new",
    name: "bolt.new",
    displayName: "bolt.new (StackBlitz)",
    title: "bolt.newの代替ツール",
    description: "bolt.newがフルアプリ生成を目指すのに対し、生成UIはUIコンポーネント生成に特化。高品質なUIをすばやく生成し、業務フローに組み込めます。",
    metaDescription: "bolt.newと生成UIの機能・料金を徹底比較。UIコンポーネント特化の高品質生成、日本語完全対応、業務管理機能つき。無料で試せます。",
    intro: "bolt.newはStackBlitzが提供するAIフルスタックアプリジェネレーターです。アプリ全体を生成するアプローチに対し、生成UIはUIコンポーネント生成に特化することで、より高品質な出力を実現します。",
    features: [
      { label: "日本語対応", generativeUi: "完全対応", competitor: "部分的" },
      { label: "月額料金", generativeUi: "¥3,980 (Pro)", competitor: "$20 (~¥3,000)" },
      { label: "無料プラン", generativeUi: true, competitor: true },
      { label: "生成対象", generativeUi: "UIコンポーネント特化", competitor: "フルアプリ" },
      { label: "AIモデル", generativeUi: "GPT-4o / Claude / Gemini", competitor: "Claude主体" },
      { label: "APIキー持ち込み(BYOK)", generativeUi: true, competitor: false },
      { label: "クライアント管理", generativeUi: true, competitor: false },
      { label: "提案書・見積書", generativeUi: true, competitor: false },
      { label: "プロジェクト管理", generativeUi: true, competitor: false },
      { label: "Vercelデプロイ", generativeUi: true, competitor: false },
      { label: "GitHub連携", generativeUi: true, competitor: false },
      { label: "テンプレート", generativeUi: true, competitor: false },
      { label: "リアルタイムプレビュー", generativeUi: true, competitor: true },
    ],
    strengths: [
      "UIコンポーネントに特化し、フォーム・テーブル・チャートなど高品質な出力",
      "日本語プロンプトで自然にUI生成",
      "GPT-4o、Claude、Geminiから最適なモデルを選択可能",
      "業務管理機能内蔵 — クライアント管理・提案書・プロジェクト管理",
      "bolt.newのようにフルアプリを生成するオーバーキルではなく、必要なUIだけを効率的に生成",
    ],
    competitorWeaknesses: [
      "フルアプリ生成はオーバーキル — 単純なUI生成では冗長なコードが出力される",
      "日本語対応が不十分",
      "業務管理機能がない",
      "APIキー持ち込み（BYOK）非対応",
      "デプロイ・GitHub連携の柔軟性が低い",
    ],
  },
];

function getCompetitor(slug: string) {
  return COMPETITORS.find((c) => c.slug === slug);
}

export function generateStaticParams() {
  return COMPETITORS.map((c) => ({ competitor: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
  const { competitor: slug } = await params;
  const data = getCompetitor(slug);
  if (!data) return {};

  return {
    title: `${data.title} - 生成UI`,
    description: data.metaDescription,
    openGraph: {
      title: `${data.title} - 生成UI`,
      description: data.metaDescription,
      type: "website",
    },
  };
}

function FeatureCell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground/40" />
    );
  }
  return <span className="text-sm">{value}</span>;
}

export default async function CompetitorPage({
  params,
}: {
  params: Promise<{ competitor: string }>;
}) {
  const { competitor: slug } = await params;
  const data = getCompetitor(slug);
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <JsonLd
        type="WebPage"
        name={`${data.title} - 生成UI`}
        description={data.metaDescription}
        url={`${SITE_CONFIG.url}/alternatives/${data.slug}`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "生成UI", url: SITE_CONFIG.url },
          { name: "代替ツール比較", url: `${SITE_CONFIG.url}/alternatives/${data.slug}` },
          { name: data.title, url: `${SITE_CONFIG.url}/alternatives/${data.slug}` },
        ]}
      />

      <header className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-6">
        <Link href="/">
          <Button variant="ghost" size="icon" aria-label="戻る">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">{data.title}</h1>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20">
        {/* Hero */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 gap-1">
            <Sparkles className="h-3 w-3" />
            比較ガイド
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {data.displayName} vs 生成UI
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {data.description}
          </p>
        </div>

        {/* Intro */}
        <div className="mx-auto mb-12 max-w-3xl">
          <p className="text-muted-foreground leading-relaxed">{data.intro}</p>
        </div>

        {/* Comparison Table */}
        <div className="mx-auto mb-16 max-w-4xl overflow-x-auto">
          <h3 className="mb-6 text-center text-2xl font-bold">機能比較</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                  機能
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium">
                  <div className="flex items-center justify-center gap-1.5">
                    <Crown className="h-4 w-4 text-amber-500" />
                    生成UI
                  </div>
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-muted-foreground">
                  {data.displayName}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.features.map((f) => (
                <tr key={f.label} className="border-b last:border-0">
                  <td className="py-3 px-4 text-sm font-medium">{f.label}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center">
                      <FeatureCell value={f.generativeUi} />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center">
                      <FeatureCell value={f.competitor} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="mx-auto mb-16 grid max-w-4xl gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Check className="h-5 w-5 text-green-500" />
                生成UIの強み
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
                <X className="h-5 w-5 text-muted-foreground/60" />
                {data.displayName}の制限事項
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.competitorWeaknesses.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mx-auto max-w-2xl rounded-2xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center dark:from-blue-950/30 dark:to-indigo-950/30">
          <Crown className="mx-auto mb-4 h-8 w-8 text-amber-500" />
          <h3 className="mb-2 text-2xl font-bold">
            生成UIを無料で試す
          </h3>
          <p className="mb-6 text-muted-foreground">
            アカウント登録後、すぐにAI UI生成を体験できます。無料プランでも1日5回利用可能。
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                無料で始める
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                料金プランを見る
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
