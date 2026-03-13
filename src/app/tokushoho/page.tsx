import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 - 生成UI",
  description: "生成UIサービスの特定商取引法に基づく表記です。販売事業者情報、販売価格、返品・返金について記載しています。",
};

export default function TokushohoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">特定商取引法に基づく表記</h1>
      <p className="mt-2 text-sm text-muted-foreground">最終更新日: 2026年3月12日</p>

      <div className="mt-8">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            <tr>
              <td className="w-1/3 py-4 pr-4 align-top font-semibold text-foreground">販売事業者</td>
              <td className="py-4 text-muted-foreground">生成UI</td>
            </tr>
            <tr>
              <td className="py-4 pr-4 align-top font-semibold text-foreground">運営責任者</td>
              <td className="py-4 text-muted-foreground">※請求があった場合、遅滞なく開示いたします</td>
            </tr>
            <tr>
              <td className="py-4 pr-4 align-top font-semibold text-foreground">所在地</td>
              <td className="py-4 text-muted-foreground">※請求があった場合、遅滞なく開示いたします</td>
            </tr>
            <tr>
              <td className="py-4 pr-4 align-top font-semibold text-foreground">連絡先</td>
              <td className="py-4 text-muted-foreground">
                メール: support@generative-ui.com<br />
                ※お問い合わせはメールにてお願いいたします
              </td>
            </tr>
            <tr>
              <td className="py-4 pr-4 align-top font-semibold text-foreground">販売URL</td>
              <td className="py-4 text-muted-foreground">https://generative-ui-kappa.vercel.app</td>
            </tr>
            <tr>
              <td className="py-4 pr-4 align-top font-semibold text-foreground">販売価格</td>
              <td className="py-4 text-muted-foreground">
                <ul className="space-y-1">
                  <li>Freeプラン: 0円（月30回まで）</li>
                  <li>Proプラン（月額）: 3,980円（税込）</li>
                  <li>Proプラン（年額）: 39,800円（税込）</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="py-4 pr-4 align-top font-semibold text-foreground">販売価格以外の必要料金</td>
              <td className="py-4 text-muted-foreground">
                インターネット接続に必要な通信費はお客様のご負担となります。
              </td>
            </tr>
            <tr>
              <td className="py-4 pr-4 align-top font-semibold text-foreground">支払方法</td>
              <td className="py-4 text-muted-foreground">
                クレジットカード決済（Stripe経由）<br />
                対応カード: Visa, Mastercard, American Express, JCB
              </td>
            </tr>
            <tr>
              <td className="py-4 pr-4 align-top font-semibold text-foreground">支払時期</td>
              <td className="py-4 text-muted-foreground">
                月額プラン: 申込時に初回決済、以後毎月同日に自動決済<br />
                年額プラン: 申込時に一括決済、以後毎年同日に自動決済
              </td>
            </tr>
            <tr>
              <td className="py-4 pr-4 align-top font-semibold text-foreground">サービス提供時期</td>
              <td className="py-4 text-muted-foreground">
                決済完了後、即時にProプランの全機能をご利用いただけます。
              </td>
            </tr>
            <tr>
              <td className="py-4 pr-4 align-top font-semibold text-foreground">返品・返金について</td>
              <td className="py-4 text-muted-foreground">
                <ul className="space-y-2">
                  <li>
                    <strong>30日間返金保証:</strong> Proプランの初回サブスクリプション開始日から30日以内であれば、
                    理由を問わず全額返金いたします。
                  </li>
                  <li>
                    <strong>返金方法:</strong> support@generative-ui.com までメールにてご連絡ください。
                    Stripeを通じてご利用のクレジットカードへ返金処理を行います。返金完了まで5〜10営業日かかる場合があります。
                  </li>
                  <li>
                    <strong>解約:</strong> いつでも解約可能です。解約後も現在の請求期間終了日まではProプランの機能をご利用いただけます。
                    31日目以降の期間については日割り返金は行いません。
                  </li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="py-4 pr-4 align-top font-semibold text-foreground">動作環境</td>
              <td className="py-4 text-muted-foreground">
                <ul className="space-y-1">
                  <li>Google Chrome（最新版）</li>
                  <li>Firefox（最新版）</li>
                  <li>Safari（最新版）</li>
                  <li>Microsoft Edge（最新版）</li>
                </ul>
                ※ JavaScript が有効な環境が必要です
              </td>
            </tr>
            <tr>
              <td className="py-4 pr-4 align-top font-semibold text-foreground">特別条件</td>
              <td className="py-4 text-muted-foreground">
                デジタルコンテンツの性質上、サービスの提供開始後（アカウント登録・決済完了後）の返品はお受けできません。
                ただし、上記の30日間返金保証の範囲内で返金対応いたします。
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-12 flex gap-4 text-sm">
        <Link href="/terms" className="text-primary hover:underline">利用規約</Link>
        <Link href="/privacy" className="text-primary hover:underline">プライバシーポリシー</Link>
      </div>
    </div>
  );
}
