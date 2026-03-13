"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useUpgradeStore } from "@/stores/upgrade-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Crown,
  Check,
  Rocket,
  Lock,
  Sparkles,
  Zap,
  ArrowRight,
  Shield,
  Settings,
  Loader2,
} from "lucide-react";

/* ─── 定数 ─── */
const LIMITS = { free: 30, pro: 300 } as const;

/* ─── コンテキスト別ヘッダー ─── */
function ModalHeader({ trigger, context }: {
  trigger: string;
  context: { attemptedPrompt?: string; lockedModelName?: string; remaining?: number };
}) {
  switch (trigger) {
    case "quota_exhausted":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
              0
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              あなたのアイデア、ここで止めないで
            </h2>
            {context.attemptedPrompt ? (
              <p className="mt-2 text-sm text-muted-foreground">
                「
                <span className="font-medium text-foreground">
                  {context.attemptedPrompt.length > 50
                    ? context.attemptedPrompt.slice(0, 50) + "..."
                    : context.attemptedPrompt}
                </span>
                」を形にするために — あと一歩です。
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                今月の無料生成枠を使い切りました。<br />
                あなたの創造力は、まだまだ止まりません。
              </p>
            )}
          </div>
        </div>
      );

    case "model_locked":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {context.lockedModelName}で、次のレベルへ
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              修正ゼロの高品質UIを一発生成。<br />
              手直しに費やす時間を、新しい創造に使えます。
            </p>
          </div>
        </div>
      );

    case "quota_warning":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              素晴らしいUIが完成しました！
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              残り<span className="font-semibold text-amber-600 dark:text-amber-400">{context.remaining ?? 0}回</span>
              — もっと自由に作りたくなったら。
            </p>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Proプランで、すべてを解放しよう
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              あなたの生産性を10倍にする、プロフェッショナルツール。
            </p>
          </div>
        </div>
      );
  }
}

/* ─── 使用量プログレスバー ─── */
function UsageProgress({ used, limit }: { used: number; limit: number }) {
  const ratio = Math.min(used / limit, 1);
  const pct = Math.round(ratio * 100);

  const barColor =
    ratio >= 0.9
      ? "bg-gradient-to-r from-red-500 to-rose-500"
      : ratio >= 0.7
        ? "bg-gradient-to-r from-amber-500 to-orange-500"
        : "bg-gradient-to-r from-blue-500 to-indigo-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">今月の使用量</span>
        <span className="font-medium">
          {used} / {limit}回
          {ratio >= 1 && (
            <span className="ml-1.5 text-red-500">（上限到達）</span>
          )}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── トリガー別ベネフィット ─── */
function BenefitsList({ trigger, modelName }: { trigger: string; modelName?: string }) {
  if (trigger === "model_locked") {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Proで解放される力
        </p>
        {/* Model comparison */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-dashed p-3 opacity-60">
            <p className="text-[11px] font-medium text-muted-foreground">Free</p>
            <p className="mt-1 text-sm font-medium">GPT-4o mini</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">シンプルなUI向き</p>
          </div>
          <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center gap-1">
              <p className="text-[11px] font-medium text-primary">Pro</p>
              <Crown className="h-3 w-3 text-amber-500" />
            </div>
            <p className="mt-1 text-sm font-bold">{modelName || "全AIモデル"}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">プロ品質を一発で</p>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <BenefitRow icon={<Zap className="h-3.5 w-3.5" />}>
            修正に費やす1時間 → Proなら<strong>一発で完成</strong>
          </BenefitRow>
          <BenefitRow icon={<ArrowRight className="h-3.5 w-3.5" />}>
            月300回 — 毎日10回使っても余裕
          </BenefitRow>
        </div>
      </div>
    );
  }

  if (trigger === "quota_warning") {
    return (
      <div className="space-y-1.5">
        <BenefitRow icon={<Zap className="h-3.5 w-3.5" />}>
          月300回で、毎日自由に生成
        </BenefitRow>
        <BenefitRow icon={<Sparkles className="h-3.5 w-3.5" />}>
          Claude Sonnet・GPT-4o・Geminiで最高品質
        </BenefitRow>
      </div>
    );
  }

  // quota_exhausted / general
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Proにすると、こう変わります
      </p>
      <div className="space-y-1.5">
        <TransformRow
          from="月30回まで"
          to="月300回 — 毎日10回使っても余裕"
        />
        <TransformRow
          from="GPT-4o mini のみ"
          to="Claude Sonnet 4.6 + GPT-4o + Gemini"
        />
        <TransformRow
          from="基本機能"
          to="Vercelデプロイ・GitHub連携"
        />
      </div>
    </div>
  );
}

function BenefitRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 shrink-0 text-emerald-500">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function TransformRow({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="shrink-0 text-red-400 line-through decoration-red-400/50">{from}</span>
      <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
      <span className="font-medium text-emerald-600 dark:text-emerald-400">{to}</span>
    </div>
  );
}

/* ─── 価格セクション ─── */
function PriceSection() {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-muted/30 to-muted/60 p-4 text-center">
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-3xl font-extrabold tracking-tight">¥3,980</span>
        <span className="text-sm text-muted-foreground">/月</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        1日わずか<strong className="text-foreground">約130円</strong> — コンビニコーヒー1杯以下
      </p>
    </div>
  );
}

/* ─── 信頼シグナル ─── */
function TrustSignals() {
  return (
    <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        いつでもキャンセル可能
      </span>
      <span className="flex items-center gap-1">
        <Check className="h-3 w-3" />
        30日間返金保証
      </span>
    </div>
  );
}

/* ─── メインモーダル ─── */
export function UpgradeModal() {
  const open = useUpgradeStore((s) => s.open);
  const trigger = useUpgradeStore((s) => s.trigger);
  const context = useUpgradeStore((s) => s.context);
  const closeUpgrade = useUpgradeStore((s) => s.closeUpgrade);
  const profile = useAuthStore((s) => s.profile);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const plan = (profile?.plan as "free" | "pro") || "free";
  const limit = LIMITS[plan];
  const used = context.used ?? profile?.generation_count_month ?? 0;

  const isQuotaTrigger = trigger === "quota_exhausted" || trigger === "quota_warning";
  const isSoftNudge = trigger === "quota_warning";

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = "/pricing";
      }
    } catch {
      window.location.href = "/pricing";
    } finally {
      setCheckoutLoading(false);
    }
  }

  // CTA text varies by trigger
  const ctaText =
    trigger === "model_locked"
      ? `${context.lockedModelName || "全モデル"}を解放する`
      : trigger === "quota_warning"
        ? "Proプランを見てみる"
        : "今すぐProで続きを作る";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeUpgrade()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[440px]">
        {/* Decorative top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

        <div className="space-y-5 px-6 pb-6 pt-5">
          {/* Header */}
          <ModalHeader trigger={trigger} context={context} />

          {/* Progress bar (quota triggers only) */}
          {isQuotaTrigger && (
            <UsageProgress used={used} limit={limit} />
          )}

          {/* Benefits */}
          <BenefitsList
            trigger={trigger}
            modelName={context.lockedModelName}
          />

          {/* Price (not for soft nudge) */}
          {!isSoftNudge && <PriceSection />}

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-amber-500/40"
              onClick={isSoftNudge ? () => { closeUpgrade(); window.location.href = "/pricing"; } : handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  処理中...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4" />
                  {ctaText}
                </>
              )}
            </Button>

            {!isSoftNudge && (
              <button
                onClick={() => { closeUpgrade(); window.location.href = "/settings"; }}
                className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Settings className="h-3 w-3" />
                APIキー持ち込み（BYOK）で続ける
              </button>
            )}
          </div>

          {/* Trust signals (not for soft nudge) */}
          {!isSoftNudge && <TrustSignals />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
