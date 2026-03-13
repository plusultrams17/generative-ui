import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo-config";

const TEMPLATE_SLUGS = [
  "login-form",
  "contact-form",
  "sales-chart",
  "pricing-cards",
  "dashboard-kpi",
  "employee-table",
  "hero-section",
  "profile-card",
];

const TOOL_SLUGS = [
  "form-generator",
  "table-generator",
  "chart-generator",
  "ui-generator",
];

const ALTERNATIVE_SLUGS = [
  "v0",
  "bolt-new",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date();

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/chat", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/gallery", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/marketplace", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/templates", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/tools", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/showcase", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/composer", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/help", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/settings", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/stats", priority: 0.3, changeFrequency: "weekly" as const },
    { path: "/pricing", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/signup", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/tokushoho", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  const templatePages = TEMPLATE_SLUGS.map((slug) => ({
    path: `/templates/${slug}`,
    priority: 0.7 as const,
    changeFrequency: "monthly" as const,
  }));

  const toolPages = TOOL_SLUGS.map((slug) => ({
    path: `/tools/${slug}`,
    priority: 0.7 as const,
    changeFrequency: "monthly" as const,
  }));

  const alternativePages = ALTERNATIVE_SLUGS.map((slug) => ({
    path: `/alternatives/${slug}`,
    priority: 0.7 as const,
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...templatePages, ...toolPages, ...alternativePages].map(
    ({ path, priority, changeFrequency }) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })
  );
}
