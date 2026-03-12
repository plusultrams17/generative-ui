import Link from "next/link";
import { ArrowRight, Check, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PricingPreview() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            シンプルな料金プラン
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            無料で始めて、ビジネスに合わせてアップグレード
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Free</h3>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold">¥0</span>
              <span className="text-muted-foreground">/月</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-500" />
                AI生成 月30回（GPT-4o mini）
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-500" />
                APIキー持ち込みで無制限
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-500" />
                テンプレート・エクスポート
              </li>
            </ul>
            <Link href="/signup" className="mt-6 block">
              <Button variant="outline" className="w-full">
                無料で始める
              </Button>
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-xl border-2 border-primary bg-card p-6 shadow-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Crown className="h-3 w-3" />
                おすすめ
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">Pro</h3>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold">¥3,980</span>
              <span className="text-muted-foreground">/月</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-500" />
                全AIモデル対応・月300回生成
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-500" />
                クライアント管理・提案書生成
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-500" />
                Vercelデプロイ・GitHub連携
              </li>
            </ul>
            <Link href="/signup" className="mt-6 block">
              <Button className="w-full gap-1.5">
                Proで始める
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/pricing"
            className="text-sm text-primary hover:underline"
          >
            詳しい料金プランを見る →
          </Link>
        </div>
      </div>
    </section>
  );
}
