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

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/icons/icon-512.svg`,
    description: SITE_CONFIG.description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    inLanguage: "ja",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/chat?prompt={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQPageJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
