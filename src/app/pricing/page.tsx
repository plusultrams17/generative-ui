import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FAQPageJsonLd } from "@/components/shared/json-ld";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  title: "料金プラン - 生成UI",
  description:
    "生成UIの料金プラン。無料プランで月30回のAI UI生成、Proプラン(月額¥3,980)で月300回・全AIモデル対応。いつでも解約可能、30日間返金保証。",
};

const FAQ_STRUCTURED_DATA = [
  {
    question: "無料プランでもAI生成は使えますか？",
    answer:
      "はい。無料プランでは月30回までGPT-4o miniでUI生成できます。ご自身のAPIキーを設定すれば制限なく利用可能です。",
  },
  {
    question: "Proプランはいつでも解約できますか？",
    answer:
      "はい。Proプランはいつでもキャンセルでき、現在の請求期間が終わるまで引き続きPro機能をご利用いただけます。",
  },
  {
    question: "支払い方法は何が使えますか？",
    answer:
      "クレジットカード（Visa、Mastercard、JCB、American Express）に対応しています。Stripeによる安全な決済処理を行っています。",
  },
  {
    question: "BYOK（APIキー持ち込み）とは？",
    answer:
      "ご自身のOpenAI / Anthropic / Google のAPIキーを設定すると、プラットフォームの生成回数制限に関係なく無制限にAI生成を利用できます。",
  },
  {
    question: "年払いプランはありますか？",
    answer:
      "はい。年払い（¥39,800/年）を選択すると、月払いより2ヶ月分（¥7,960）おトクになります。",
  },
  {
    question: "返金保証はありますか？",
    answer:
      "はい。Proプランには30日間の返金保証があります。ご満足いただけない場合は、購入後30日以内にお問い合わせいただければ全額返金いたします。",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-200/20 blur-3xl dark:from-amber-900/10 dark:to-orange-900/10" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-200/20 blur-3xl dark:from-blue-900/10 dark:to-indigo-900/10" />
      </div>

      <FAQPageJsonLd items={FAQ_STRUCTURED_DATA} />

      <header className="relative mx-auto flex max-w-5xl items-center gap-3 px-4 py-6">
        <Link href="/">
          <Button variant="ghost" size="icon" aria-label="戻る">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">料金プラン</h1>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 pb-24">
        <PricingContent />
      </main>
    </div>
  );
}
