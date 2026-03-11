"use client";

import Link from "next/link";
import { Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const mockMessages = [
  "ログインフォームを作って",
  "売上チャートを表示して",
  "料金プランを3つ作って",
];

function TypingAnimation() {
  const [text, setText] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = mockMessages[msgIndex];
    if (!deleting && charIndex < current.length) {
      const timer = setTimeout(() => {
        setText(current.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 80);
      return () => clearTimeout(timer);
    }
    if (!deleting && charIndex === current.length) {
      const timer = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(timer);
    }
    if (deleting && charIndex > 0) {
      const timer = setTimeout(() => {
        setText(current.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, 40);
      return () => clearTimeout(timer);
    }
    if (deleting && charIndex === 0) {
      setDeleting(false);
      setMsgIndex((msgIndex + 1) % mockMessages.length);
    }
  }, [charIndex, deleting, msgIndex]);

  return (
    <div className="relative mx-auto mt-12 max-w-lg">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>AI Chat</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800">
          <span className="text-sm text-gray-800 dark:text-gray-200">
            {text}
          </span>
          <span className="inline-block h-5 w-0.5 animate-pulse bg-blue-500" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            UI生成中...
          </span>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-lg dark:border-blue-800 dark:from-blue-950/50 dark:to-indigo-950/50">
        <div className="space-y-2">
          <div className="h-3 w-3/4 animate-pulse rounded bg-blue-200 dark:bg-blue-700" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-blue-200 dark:bg-blue-700" style={{ animationDelay: "150ms" }} />
          <div className="h-8 w-full animate-pulse rounded-lg bg-blue-200 dark:bg-blue-700" style={{ animationDelay: "300ms" }} />
          <div className="h-8 w-1/3 animate-pulse rounded-lg bg-blue-300 dark:bg-blue-600" style={{ animationDelay: "450ms" }} />
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient + grid */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
            <Sparkles className="h-4 w-4" />
            AI-Powered UI Generator
          </div>
        </div>

        {/* Heading */}
        <h1 className="mt-8 text-center text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
          AIに話しかけるだけで、
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            UIが生まれる
          </span>
        </h1>

        {/* Sub copy */}
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-gray-600 dark:text-gray-400">
          フォーム、テーブル、チャート、カスタムUI
          &#8212;
          自然言語で説明するだけで、プロ品質のUIコンポーネントを即座に生成
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
          >
            今すぐ無料で始める
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98] dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800"
          >
            機能を見る
          </a>
        </div>

        {/* Hero mockup */}
        <TypingAnimation />
      </div>
    </section>
  );
}
