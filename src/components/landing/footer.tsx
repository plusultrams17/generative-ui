import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = {
  product: {
    title: "プロダクト",
    links: [
      { label: "チャット", href: "/chat" },
      { label: "ギャラリー", href: "/gallery" },
      { label: "テンプレート", href: "/templates" },
      { label: "マーケットプレイス", href: "/marketplace" },
    ],
  },
  tools: {
    title: "ツール",
    links: [
      { label: "コンポーザー", href: "/composer" },
      { label: "エージェントビルダー", href: "/agent-builder" },
      { label: "オーケストレーション", href: "/orchestration" },
    ],
  },
  resources: {
    title: "リソース",
    links: [
      { label: "ヘルプ", href: "/help" },
      { label: "設定", href: "/settings" },
      { label: "統計", href: "/stats" },
    ],
  },
  legal: {
    title: "その他",
    links: [
      { label: "利用規約", href: "/help" },
      { label: "プライバシーポリシー", href: "/help" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            生成UI
          </span>
        </div>

        {/* Links grid */}
        <nav aria-label="フッターナビゲーション">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {Object.values(footerLinks).map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Copyright */}
        <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-500">
            &copy; 2026 生成UI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
