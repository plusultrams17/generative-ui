"use client";

import { useSidebarStore } from "@/stores/sidebar-store";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon, Sparkles } from "lucide-react";
import Link from "next/link";

export function TopBar() {
  const toggle = useSidebarStore((s) => s.toggle);
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggle}
          aria-label="メニュー"
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="テーマ切替"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}
