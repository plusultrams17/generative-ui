import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/seo-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ogTitle = "共有UI";
  const ogDescription = "生成UIで作成された共有UIコンポーネント";
  const ogUrl = `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(ogTitle)}&description=${encodeURIComponent(ogDescription)}`;

  return {
    title: `共有UI | 生成UI`,
    description: "生成UIで作成された共有UIコンポーネント。AIに話しかけるだけでUIが生まれる。",
    openGraph: {
      title: `共有UI | 生成UI`,
      description: "生成UIで作成された共有UIコンポーネント",
      url: `${SITE_CONFIG.url}/share/${id}`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: "共有UI - 生成UI" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `共有UI | 生成UI`,
      description: "生成UIで作成された共有UIコンポーネント",
      images: [ogUrl],
    },
  };
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
