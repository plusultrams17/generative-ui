"use client";

import { useSidebarStore } from "@/stores/sidebar-store";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const isOpen = useSidebarStore((s) => s.isOpen);
  const setOpen = useSidebarStore((s) => s.setOpen);

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
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <Sidebar />
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
