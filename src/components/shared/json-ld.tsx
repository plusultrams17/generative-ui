import { SITE_CONFIG } from "@/lib/seo-config";

type JsonLdProps = {
  type?: "WebApplication" | "WebPage";
  name?: string;
  description?: string;
  url?: string;
};

export function JsonLd({ type = "WebApplication", name, description, url }: JsonLdProps) {
  const data = type === "WebApplication"
    ? {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: name || SITE_CONFIG.name,
        description: description || SITE_CONFIG.description,
        url: url || SITE_CONFIG.url,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "JPY",
        },
        featureList: [
          "AIによるUI自動生成",
          "フォーム、テーブル、チャート生成",
          "マルチAIモデル対応（GPT-4o, Claude, Gemini）",
          "リアルタイムストリーミング",
          "テンプレートシステム",
          "共有・エクスポート機能",
        ],
        inLanguage: "ja",
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: name || SITE_CONFIG.name,
        description: description || SITE_CONFIG.description,
        url: url || SITE_CONFIG.url,
        inLanguage: "ja",
      };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
