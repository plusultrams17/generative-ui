"use client";

import { useAuthStore } from "@/stores/auth-store";
import { hasFeatureAccess, type Feature } from "@/lib/feature-gates";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type ProGateProps = {
  feature: Feature;
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
};

export function ProGate({
  feature,
  children,
  fallbackTitle,
  fallbackDescription,
}: ProGateProps) {
  const profile = useAuthStore((s) => s.profile);
  const loading = useAuthStore((s) => s.loading);

  // While loading, show nothing (avoid flash)
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const plan = profile?.plan || "free";

  if (hasFeatureAccess(feature, plan)) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="relative">
        <div className="rounded-full bg-gradient-to-br from-amber-100 to-orange-100 p-6 dark:from-amber-900/30 dark:to-orange-900/30">
          <Crown className="h-12 w-12 text-amber-500" />
        </div>
        <div className="absolute -right-1 -top-1 rounded-full bg-primary p-1.5">
          <Sparkles className="h-3 w-3 text-primary-foreground" />
        </div>
      </div>

      <div className="max-w-md space-y-2">
        <h3 className="text-xl font-bold">
          {fallbackTitle || "Pro限定機能"}
        </h3>
        <p className="text-muted-foreground">
          {fallbackDescription ||
            "この機能はProプランでご利用いただけます。アップグレードして全機能をお楽しみください。"}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Link href="/pricing">
          <Button size="lg" className="gap-2">
            <Crown className="h-4 w-4" />
            Proにアップグレード — ¥3,980/月
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground">
          全AIモデル · 月300回生成 · 業務管理機能
        </p>
      </div>
    </div>
  );
}
