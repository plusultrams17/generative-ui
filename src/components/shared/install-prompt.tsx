"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShowPrompt(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  if (!showPrompt) return null;

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 mx-4 mb-2 flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-lg">
      <Download className="h-5 w-5 shrink-0 text-primary" />
      <span className="flex-1 text-sm font-medium">
        生成UIをインストール
      </span>
      <Button size="sm" onClick={handleInstall}>
        インストール
      </Button>
      <Button size="sm" variant="ghost" onClick={handleDismiss}>
        <X className="h-4 w-4" />
        <span className="sr-only">後で</span>
      </Button>
    </div>
  );
}
