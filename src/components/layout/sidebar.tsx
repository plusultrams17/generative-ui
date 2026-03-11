"use client";

import { useSidebarStore } from "@/stores/sidebar-store";
import { SidebarNavItem } from "./sidebar-nav-item";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  LayoutGrid,
  Globe,
  Store,
  FileText,
  Bot,
  GitBranch,
  Layers,
  FolderOpen,
  Users,
  FileCheck,
  Presentation,
  BarChart3,
  Settings,
  Shield,
  HelpCircle,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type NavSection = {
  title: string;
  items: {
    href: string;
    icon: typeof MessageSquare;
    label: string;
  }[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: "メイン",
    items: [
      { href: "/chat", icon: MessageSquare, label: "チャット" },
      { href: "/gallery", icon: LayoutGrid, label: "ギャラリー" },
      { href: "/showcase", icon: Globe, label: "ショーケース" },
      { href: "/marketplace", icon: Store, label: "マーケットプレイス" },
    ],
  },
  {
    title: "ツール",
    items: [
      { href: "/templates", icon: FileText, label: "テンプレート" },
      { href: "/agent-builder", icon: Bot, label: "エージェントビルダー" },
      { href: "/orchestration", icon: GitBranch, label: "オーケストレーション" },
      { href: "/composer", icon: Layers, label: "コンポーザー" },
    ],
  },
  {
    title: "管理",
    items: [
      { href: "/projects", icon: FolderOpen, label: "プロジェクト" },
      { href: "/clients", icon: Users, label: "クライアント" },
      { href: "/proposals", icon: FileCheck, label: "提案書" },
      { href: "/presentations", icon: Presentation, label: "プレゼンテーション" },
    ],
  },
  {
    title: "システム",
    items: [
      { href: "/stats", icon: BarChart3, label: "統計" },
      { href: "/settings", icon: Settings, label: "設定" },
      { href: "/admin", icon: Shield, label: "管理者" },
      { href: "/help", icon: HelpCircle, label: "ヘルプ" },
    ],
  },
];

export function Sidebar() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const toggleCollapse = useSidebarStore((s) => s.toggleCollapse);

  return (
    <aside
      className={`flex h-full flex-col border-r bg-background transition-all duration-200 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            {!isCollapsed && (
              <h3 className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {section.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t px-2 py-2">
        <Button
          variant="ghost"
          size="sm"
          className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start gap-2"}`}
          onClick={toggleCollapse}
        >
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span className="text-xs">折りたたむ</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
