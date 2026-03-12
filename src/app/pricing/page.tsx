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
  CardFooter,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Check,
  X,
  Crown,
  Sparkles,
  Loader2,
  Zap,
  Shield,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { PRO_FEATURES } from "@/lib/feature-gates";

const FREE_FEATURES = [
  { label: "AI UI生成", detail: "5回/日、月30回", included: true },
  { label: "AIモデル", detail: "GPT-4o mini のみ", included: true },
  { label: "APIキー持ち込み(BYOK)", detail: "無制限", included: true },
  { label: "ギャラリー・テンプレート", detail: "全て利用可能", included: true },
  { label: "JSON/HTMLエクスポート", detail: "", included: true },
  { label: "クライアント管理", detail: "", included: false },
  { label: "提案書・見積書", detail: "", included: false },
  { label: "プレゼンテーション", detail: "", included: false },
  { label: "プロジェクト管理", detail: "", included: false },
  { label: "Vercelデプロイ", detail: "", included: false },
  { label: "GitHub連携", detail: "", included: false },
];

const PRO_FEATURE_LIST = [
  { label: "AI UI生成", detail: "月300回", included: true },
  { label: "AIモデル", detail: "GPT-4o / Claude / Gemini 全対応", included: true },
  { label: "APIキー持ち込み(BYOK)", detail: "無制限", included: true },
  { label: "ギャラリー・テンプレート", detail: "全て利用可能", included: true },
  { label: "JSON/HTMLエクスポート", detail: "", included: true },
  { label: "クライアント管理", detail: "", included: true },
  { label: "提案書・見積書", detail: "", included: true },
  { label: "プレゼンテーション", detail: "", included: true },
  { label: "プロジェクト管理", detail: "", included: true },
  { label: "Vercelデプロイ", detail: "", included: true },
  { label: "GitHub連携", detail: "", included: true },
];

const FAQ_ITEMS = [
  {
    q: "無料プランでもAI生成は使えますか？",
    a: "はい。無料プランでは1日5回、月30回までGPT-4o miniでUI生成できます。ご自身のAPIキーを設定すれば制限なく利用可能です。",
  },
  {
    q: "Proプランはいつでも解約できますか？",
    a: "はい。Proプランはいつでもキャンセルでき、現在の請求期間が終わるまで引き続きPro機能をご利用いただけます。",
  },
  {
    q: "支払い方法は何が使えますか？",
    a: "クレジットカード（Visa、Mastercard、JCB、American Express）に対応しています。Stripeによる安全な決済処理を行っています。",
  },
  {
    q: "BYOK（APIキー持ち込み）とは？",
    a: "ご自身のOpenAI / Anthropic / Google のAPIキーを設定すると、プラットフォームの生成回数制限に関係なく無制限にAI生成を利用できます。Free・Proどちらでも利用可能です。",
  },
];

export default function PricingPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const [loading, setLoading] = useState(false);

  const isPro = profile?.plan === "pro";

  async function handleUpgrade() {
    if (!user) {
      window.location.href = "/signup";
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error(data.error || "エラーが発生しました");
    } catch {
      toast.error("エラーが発生しました");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <header className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-6">
        <Link href="/">
          <Button variant="ghost" size="icon" aria-label="戻る">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">料金プラン</h1>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20">
        {/* Hero */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 gap-1">
            <Sparkles className="h-3 w-3" />
            シンプルな料金体系
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            あなたに合ったプランを選びましょう
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            無料で始めて、必要に応じてアップグレード。
          </p>
        </div>

        {/* Plans */}
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Free
              </CardTitle>
              <CardDescription>まずは試してみたい方に</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">¥0</span>
                <span className="text-muted-foreground">/月</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {FREE_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-start gap-2 text-sm">
                    {f.included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <span className={f.included ? "" : "text-muted-foreground/60"}>
                      {f.label}
                      {f.detail && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({f.detail})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={user ? "/chat" : "/signup"} className="w-full">
                <Button variant="outline" className="w-full">
                  {user ? "チャットを開く" : "無料で始める"}
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Crown className="h-3 w-3" />
                おすすめ
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Pro
              </CardTitle>
              <CardDescription>本格的に活用したい方に</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">¥3,980</span>
                <span className="text-muted-foreground">/月</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {PRO_FEATURE_LIST.map((f) => (
                  <li key={f.label} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span>
                      {f.label}
                      {f.detail && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({f.detail})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isPro ? (
                <Button variant="outline" className="w-full" disabled>
                  現在のプラン
                </Button>
              ) : (
                <Button
                  className="w-full gap-2"
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Crown className="h-4 w-4" />
                  Proにアップグレード
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Trust signals */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Stripeによる安全な決済
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            いつでも解約可能
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            日本語サポート
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-2xl">
          <h3 className="mb-8 text-center text-2xl font-bold">よくある質問</h3>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group rounded-lg border bg-card p-4"
              >
                <summary className="cursor-pointer font-medium">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
