"use client";

import Link from "next/link";
import {
  LogIn,
  Mail,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  BarChart3,
  User,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { TEMPLATES, type Template } from "@/lib/templates";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LogIn,
  Mail,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  BarChart3,
  User,
  HelpCircle,
};

const categoryColors: Record<
  Template["category"],
  { bg: string; text: string }
> = {
  form: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-700 dark:text-blue-300",
  },
  table: {
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-700 dark:text-green-300",
  },
  chart: {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-700 dark:text-amber-300",
  },
  custom: {
    bg: "bg-purple-100 dark:bg-purple-900/40",
    text: "text-purple-700 dark:text-purple-300",
  },
};

const categoryLabels: Record<Template["category"], string> = {
  form: "フォーム",
  table: "テーブル",
  chart: "チャート",
  custom: "カスタム",
};

function TemplateCard({ template }: { template: Template }) {
  const Icon = ICON_MAP[template.icon];
  const colors = categoryColors[template.category];

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between">
        <div className="inline-flex rounded-xl bg-gray-100 p-2.5 dark:bg-gray-800">
          {Icon ? (
            <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <div className="h-5 w-5" />
          )}
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
        >
          {categoryLabels[template.category]}
        </span>
      </div>
      <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
        {template.title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {template.description}
      </p>
    </div>
  );
}

export function TemplateGallery() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            テンプレートから始めよう
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            人気テンプレートをワンクリックで。カスタマイズも自在。
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98] dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            テンプレートを使って始める
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
