export const TOOL_LABELS: Record<string, string> = {
  showForm: "フォーム",
  showTable: "テーブル",
  showChart: "チャート",
  generateCustomComponent: "カスタム",
};

export function escapeJsx(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/'/g, "\\'");
}

export function generateLayout(title: string): string {
  const escaped = title.replace(/"/g, '\\"');
  return `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${escaped}",
  description: "Generated UI Component",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
`;
}
