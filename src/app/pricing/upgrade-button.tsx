"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";

export function UpgradeButton() {
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

  if (isPro) {
    return (
      <Button variant="outline" className="w-full" disabled>
        現在のプラン
      </Button>
    );
  }

  return (
    <Button
      className="w-full gap-2"
      onClick={handleUpgrade}
      disabled={loading}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      <Crown className="h-4 w-4" />
      Proにアップグレード
    </Button>
  );
}

export function FreeButton() {
  const user = useAuthStore((s) => s.user);

  return (
    <Link href={user ? "/chat" : "/signup"} className="w-full">
      <Button variant="outline" className="w-full">
        {user ? "チャットを開く" : "無料で始める"}
      </Button>
    </Link>
  );
}
