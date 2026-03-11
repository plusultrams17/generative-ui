"use client";

import {
  FileText,
  Table2,
  BarChart3,
  Palette,
  Cpu,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
};

const features: Feature[] = [
  {
    icon: FileText,
    title: "フォーム生成",
    description:
      "ログイン、お問い合わせ、アンケート... 説明するだけで完成",
    color: "blue",
  },
  {
    icon: Table2,
    title: "テーブル生成",
    description:
      "データテーブルをサンプルデータ付きで自動生成",
    color: "green",
  },
  {
    icon: BarChart3,
    title: "チャート生成",
    description:
      "売上推移、比較チャートをデータから即座に可視化",
    color: "amber",
  },
  {
    icon: Palette,
    title: "カスタムUI",
    description:
      "料金プラン、プロフィール、KPIカード等自由自在",
    color: "purple",
  },
  {
    icon: Cpu,
    title: "マルチモデル",
    description:
      "GPT-4o、Claude、Gemini — 最適なAIを選択",
    color: "rose",
  },
  {
    icon: Zap,
    title: "リアルタイム",
    description:
      "ストリーミング生成でリアルタイムにUIが現れる",
    color: "orange",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "group-hover:border-blue-200 dark:group-hover:border-blue-800",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-600 dark:text-green-400",
    border: "group-hover:border-green-200 dark:group-hover:border-green-800",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
    border: "group-hover:border-amber-200 dark:group-hover:border-amber-800",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-600 dark:text-purple-400",
    border: "group-hover:border-purple-200 dark:group-hover:border-purple-800",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-600 dark:text-rose-400",
    border: "group-hover:border-rose-200 dark:group-hover:border-rose-800",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-600 dark:text-orange-400",
    border: "group-hover:border-orange-200 dark:group-hover:border-orange-800",
  },
};

function FeatureCard({ feature }: { feature: Feature }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = feature.icon;
  const colors = colorMap[feature.color];

  return (
    <div
      className={`group cursor-default rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${colors.border} ${
        isHovered ? "scale-[1.03] shadow-xl" : "shadow-sm"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`mb-4 inline-flex rounded-xl p-3 ${colors.bg}`}
      >
        <Icon className={`h-6 w-6 ${colors.text}`} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {feature.description}
      </p>
    </div>
  );
}

export function FeatureShowcase() {
  return (
    <section
      id="features"
      className="bg-gray-50/50 py-20 dark:bg-gray-950/50"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            あらゆるUIを、AIが生成
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            必要なUIを言葉で伝えるだけ。あとはAIにおまかせ。
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
