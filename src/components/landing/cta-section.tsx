import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-20" aria-label="今すぐ始める">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900" />
      <div
        className="absolute inset-0 -z-10 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          今すぐAIでUIを作り始めましょう
        </h2>
        <p className="mt-4 text-lg text-blue-100">
          面倒なコーディングは不要。AIに話しかけるだけで、あなたのアイデアがUIになります。
        </p>
        <div className="mt-10">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl active:scale-[0.98]"
          >
            30秒でUIを生成する
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <p className="mt-4 text-sm text-blue-200">
          無料プランあり · クレジットカード不要 · 30秒で開始
        </p>
      </div>
    </section>
  );
}
