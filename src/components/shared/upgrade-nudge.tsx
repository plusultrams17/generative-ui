"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Crown, X } from "lucide-react";

type UpgradeNudgeProps = {
  message?: string;
  compact?: boolean;
};

export function UpgradeNudge({
  message = "Proプランにアップグレードして全機能を解放しましょう",
  compact = false,
}: UpgradeNudgeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-800 dark:bg-amber-950/30">
        <Crown className="h-4 w-4 shrink-0 text-amber-500" />
        <span className="flex-1 text-amber-800 dark:text-amber-200">
          {message}
        </span>
        <Link href="/pricing">
          <Button size="sm" variant="outline" className="h-7 text-xs">
            詳しく見る
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-background/50"
        aria-label="閉じる"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/50">
          <Crown className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-amber-900 dark:text-amber-100">
            {message}
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            月額¥3,980で全AIモデル・業務管理機能が使い放題
          </p>
          <Link href="/pricing" className="mt-3 inline-block">
            <Button size="sm" className="gap-1.5">
              <Crown className="h-3.5 w-3.5" />
              プランを見る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
