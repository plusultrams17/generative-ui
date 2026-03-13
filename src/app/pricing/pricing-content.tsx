"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Crown,
  Sparkles,
  Zap,
  Shield,
  RefreshCw,
  ChevronDown,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

/* ─── Types ─── */
type BillingPeriod = "monthly" | "annual";

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const featureItem = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

/* ─── Feature Data ─── */
const FEATURES = [
  { label: "AI UI生成", free: "月30回", pro: "月300回" },
  { label: "AIモデル", free: "GPT-4o mini", pro: "全4モデル対応" },
  { label: "BYOK（APIキー持ち込み）", free: true, pro: true },
  { label: "ギャラリー・テンプレート", free: true, pro: true },
  { label: "エクスポート", free: true, pro: true },
  { label: "クライアント管理", free: false, pro: true },
  { label: "提案書・見積書", free: false, pro: true },
  { label: "プレゼンテーション", free: false, pro: true },
  { label: "プロジェクト管理", free: false, pro: true },
  { label: "Vercelデプロイ", free: false, pro: true },
  { label: "GitHub連携", free: false, pro: true },
] as const;

const FAQ_ITEMS = [
  {
    q: "無料プランでもAI生成は使えますか？",
    a: "はい。無料プランでは月30回までGPT-4o miniでUI生成できます。ご自身のAPIキーを設定すれば制限なく利用可能です。",
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
    a: "ご自身のOpenAI / Anthropic / Google のAPIキーを設定すると、プラットフォームの生成回数制限に関係なく無制限にAI生成を利用できます。",
  },
  {
    q: "年払いプランはありますか？",
    a: "はい。年払い（¥39,800/年）を選択すると、月払いより2ヶ月分（¥7,960）おトクになります。",
  },
  {
    q: "返金保証はありますか？",
    a: "はい。Proプランには30日間の返金保証があります。ご満足いただけない場合は、購入後30日以内にお問い合わせいただければ全額返金いたします。",
  },
];

/* ─── Sub-components ─── */

function BillingToggle({
  period,
  onChange,
}: {
  period: BillingPeriod;
  onChange: (p: BillingPeriod) => void;
}) {
  return (
    <motion.div
      custom={2}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-center"
    >
      <div className="relative flex items-center rounded-full border bg-muted/50 p-1">
        {/* Sliding indicator */}
        <motion.div
          className="absolute inset-y-1 rounded-full bg-background shadow-sm"
          animate={{
            x: period === "monthly" ? 0 : "100%",
            width: period === "monthly" ? "50%" : "50%",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          style={{ left: 4 }}
        />
        <button
          onClick={() => onChange("monthly")}
          className={`relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            period === "monthly" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          月払い
        </button>
        <button
          onClick={() => onChange("annual")}
          className={`relative z-10 flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            period === "annual" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          年払い
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
            2ヶ月無料
          </span>
        </button>
      </div>
    </motion.div>
  );
}

function FreePlanCard({ period }: { period: BillingPeriod }) {
  const user = useAuthStore((s) => s.user);

  return (
    <motion.div
      custom={3}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative flex flex-col rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Zap className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold">Free</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          まずは試してみたい方に
        </p>
      </div>

      <div className="mb-6">
        <span className="text-5xl font-extrabold tracking-tight">¥0</span>
        <span className="ml-1 text-muted-foreground">/月</span>
      </div>

      <Link href={user ? "/chat" : "/signup"} className="mb-8">
        <Button variant="outline" className="w-full" size="lg">
          {user ? "チャットを開く" : "無料で始める"}
        </Button>
      </Link>

      <motion.ul className="flex-1 space-y-3" variants={stagger} initial="hidden" animate="visible">
        {FEATURES.map((f) => {
          const value = f.free;
          const included = value === true || typeof value === "string";
          return (
            <motion.li key={f.label} variants={featureItem} className="flex items-start gap-2.5 text-sm">
              {included ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/30" />
              )}
              <span className={included ? "" : "text-muted-foreground/40"}>
                {f.label}
                {typeof value === "string" && (
                  <span className="ml-1 text-xs text-muted-foreground">({value})</span>
                )}
              </span>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.div>
  );
}

function ProPlanCard({ period }: { period: BillingPeriod }) {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const isPro = profile?.plan === "pro";
  const [loading, setLoading] = useState(false);

  const price = period === "annual" ? "¥39,800" : "¥3,980";
  const suffix = period === "annual" ? "/年" : "/月";
  const perDay = period === "annual" ? "約109円" : "約130円";

  async function handleUpgrade() {
    if (!user) {
      window.location.href = "/signup";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingPeriod: period }),
      });
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
    <motion.div
      custom={4}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="relative flex flex-col rounded-2xl border-2 border-primary/20 bg-card p-8 shadow-xl shadow-primary/5"
    >
      {/* Gradient glow behind card */}
      <div className="pointer-events-none absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-rose-500/20 blur-xl" />

      {/* Badge */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
        <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-amber-500/25">
          <Crown className="h-3 w-3" />
          おすすめ
        </Badge>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold">Pro</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          本格的に活用したいプロフェッショナルに
        </p>
      </div>

      {/* Price */}
      <div className="mb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <span className="text-5xl font-extrabold tracking-tight">{price}</span>
            <span className="ml-1 text-muted-foreground">{suffix}</span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mb-6 flex items-center gap-2">
        <p className="text-xs text-muted-foreground">
          1日あたり<strong className="text-foreground">{perDay}</strong>
        </p>
        {period === "annual" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
          >
            ¥7,960おトク
          </motion.span>
        )}
      </div>

      {/* CTA */}
      <motion.div className="mb-8" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        {isPro ? (
          <Button variant="outline" className="w-full" size="lg" disabled>
            現在のプラン
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-amber-500/40"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crown className="h-4 w-4" />
            )}
            {loading ? "処理中..." : "Proにアップグレード"}
          </Button>
        )}
      </motion.div>

      {/* Features */}
      <motion.ul className="flex-1 space-y-3" variants={stagger} initial="hidden" animate="visible">
        {FEATURES.map((f) => {
          const value = f.pro;
          return (
            <motion.li key={f.label} variants={featureItem} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>
                {f.label}
                {typeof value === "string" && (
                  <span className="ml-1 text-xs font-medium text-primary">({value})</span>
                )}
              </span>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.div>
  );
}

function TrustSignals() {
  const items = [
    { icon: Shield, label: "Stripeによる安全な決済" },
    { icon: Check, label: "いつでも解約可能" },
    { icon: RefreshCw, label: "30日間返金保証" },
  ];

  return (
    <motion.div
      custom={5}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
          <item.icon className="h-4 w-4" />
          {item.label}
        </div>
      ))}
    </motion.div>
  );
}

function ValueComparison() {
  return (
    <motion.div
      custom={6}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-2xl"
    >
      <div className="rounded-2xl border bg-gradient-to-br from-muted/30 to-muted/60 p-6 sm:p-8">
        <h3 className="mb-4 text-center text-lg font-bold">
          Proは「時間の投資」で元が取れます
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "手直しの時間",
              free: "平均30分/回",
              pro: "ほぼゼロ",
              detail: "高品質AIが一発で完成",
            },
            {
              label: "使えるAIモデル",
              free: "1種類",
              pro: "4種類",
              detail: "用途に合わせて最適選択",
            },
            {
              label: "月の生成回数",
              free: "30回",
              pro: "300回",
              detail: "10倍のアウトプット",
            },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-sm text-red-400 line-through">{item.free}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{item.pro}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <motion.div
      custom={7}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-2xl"
    >
      <h3 className="mb-8 text-center text-2xl font-bold">よくある質問</h3>
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <div key={item.q} className="overflow-hidden rounded-xl border bg-card">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left font-medium transition-colors hover:bg-muted/50"
            >
              <span className="pr-4">{item.q}</span>
              <motion.div
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <p className="border-t px-5 py-4 text-sm text-muted-foreground">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function BottomCTA() {
  const user = useAuthStore((s) => s.user);

  return (
    <motion.div
      custom={8}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-lg text-center"
    >
      <div className="rounded-2xl border bg-gradient-to-br from-amber-50 to-orange-50 p-8 dark:from-amber-950/20 dark:to-orange-950/20">
        <Sparkles className="mx-auto mb-3 h-8 w-8 text-amber-500" />
        <h3 className="text-xl font-bold">
          まずは無料で体験してみませんか？
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          30回分の無料生成で、AIがあなたの仕事をどう変えるか体験できます。
        </p>
        <Link href={user ? "/chat" : "/signup"} className="mt-5 inline-block">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" className="gap-2 px-8">
              <Zap className="h-4 w-4" />
              {user ? "今すぐ生成する" : "無料で始める"}
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─── */
export function PricingContent() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="text-center">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <Badge className="mb-4 gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
            <Sparkles className="h-3 w-3" />
            シンプルな料金体系
          </Badge>
        </motion.div>
        <motion.h2
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-3xl font-extrabold tracking-tight sm:text-5xl"
        >
          あなたに合ったプランを
          <br className="hidden sm:block" />
          選びましょう
        </motion.h2>
        <motion.p
          custom={1.5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-4 max-w-md text-lg text-muted-foreground"
        >
          無料で始めて、価値を実感してからアップグレード。
          <br />
          いつでもキャンセル可能です。
        </motion.p>
      </div>

      {/* Billing Toggle */}
      <BillingToggle period={period} onChange={setPeriod} />

      {/* Plan Cards */}
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        <FreePlanCard period={period} />
        <ProPlanCard period={period} />
      </div>

      {/* Trust */}
      <TrustSignals />

      {/* Value comparison */}
      <ValueComparison />

      {/* FAQ */}
      <FAQSection />

      {/* Bottom CTA */}
      <BottomCTA />
    </div>
  );
}
