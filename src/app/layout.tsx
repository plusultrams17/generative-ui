import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/providers";
import { JsonLd, OrganizationJsonLd, WebSiteJsonLd } from "@/components/shared/json-ld";
import { SITE_CONFIG, PAGE_METADATA } from "@/lib/seo-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: PAGE_METADATA.home.title,
    template: "%s | 生成UI",
  },
  description: PAGE_METADATA.home.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.creator }],
  creator: SITE_CONFIG.creator,
  manifest: "/manifest.json",
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: PAGE_METADATA.home.title,
    description: PAGE_METADATA.home.description,
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_METADATA.home.title,
    description: PAGE_METADATA.home.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_CONFIG.name,
  },
  icons: [
    { rel: "apple-touch-icon", url: "/icons/icon-192.svg" },
  ],
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <JsonLd />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
