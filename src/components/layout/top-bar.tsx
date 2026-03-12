"use client";

import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, Sun, Moon, Sparkles, LogOut, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function TopBar() {
  const isOpen = useSidebarStore((s) => s.isOpen);
  const toggle = useSidebarStore((s) => s.toggle);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const initialize = useAuthStore((s) => s.initialize);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    initialize();
  }, [initialize]);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const displayName =
    profile?.display_name || user?.email?.split("@")[0] || "";
  const initial = displayName.charAt(0).toUpperCase();
  const isPro = profile?.plan === "pro";

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggle}
          aria-label="メニュー"
          aria-expanded={isOpen}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/chat" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold">生成UI</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <>
            {isPro ? (
              <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                <Crown className="h-3 w-3" />
                Pro
              </Badge>
            ) : (
              <Link href="/pricing">
                <Badge
                  variant="outline"
                  className="cursor-pointer gap-1 transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Crown className="h-3 w-3" />
                  Free
                </Badge>
              </Link>
            )}
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="テーマ切替"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {user && (
          <>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary"
              title={displayName}
            >
              {initial}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              aria-label="ログアウト"
              title="ログアウト"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
