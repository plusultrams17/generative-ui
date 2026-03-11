import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date();

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/chat", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/gallery", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/marketplace", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/templates", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/showcase", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/composer", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/help", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/settings", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/stats", priority: 0.3, changeFrequency: "weekly" as const },
  ];

  return staticPages.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
