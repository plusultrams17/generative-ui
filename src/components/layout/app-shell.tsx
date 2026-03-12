"use client";

import { useEffect, useRef } from "react";
import { useSidebarStore } from "@/stores/sidebar-store";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const isOpen = useSidebarStore((s) => s.isOpen);
  const setOpen = useSidebarStore((s) => s.setOpen);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Esc key to close mobile sidebar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen]);

  // Focus trap: move focus into sidebar when opened
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const focusable = sidebarRef.current.querySelector<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }
  }, [isOpen]);

  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile overlay sidebar */}
        {isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="ナビゲーションメニュー"
            className="lg:hidden"
          >
            <div
              className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200"
              onClick={() => setOpen(false)}
            />
            <div
              ref={sidebarRef}
              className="fixed inset-y-0 left-0 z-50 animate-in slide-in-from-left duration-200"
            >
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
