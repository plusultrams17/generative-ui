import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー - 生成UI",
  description: "生成UIサービスのプライバシーポリシーです。個人情報の取り扱い、利用目的、第三者提供等について定めています。",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">プライバシーポリシー</h1>
      <p className="mt-2 text-sm text-muted-foreground">最終更新日: 2026年3月12日</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">1. はじめに</h2>
          <p>
            生成UI（以下「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
            本プライバシーポリシーは、当サービスにおける個人情報の取り扱いについて定めるものです。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">2. 収集する情報</h2>
          <p>当サービスは、以下の情報を収集する場合があります。</p>
          <h3 className="mb-2 mt-4 font-semibold text-foreground">2.1 ユーザーが提供する情報</h3>
          <ul className="list-disc space-y-1 pl-6">
            <li>メールアドレス（アカウント登録時）</li>
            <li>パスワード（暗号化して保存）</li>
            <li>お支払い情報（Stripeを通じて処理。当社サーバーにはカード情報を保存しません）</li>
          </ul>
          <h3 className="mb-2 mt-4 font-semibold text-foreground">2.2 自動的に収集する情報</h3>
          <ul className="list-disc space-y-1 pl-6">
            <li>利用状況データ（生成回数、利用した機能、アクセス日時）</li>
            <li>デバイス情報（ブラウザ種類、OS、画面サイズ）</li>
            <li>アクセスログ（IPアドレス、リファラー情報）</li>
            <li>Vercel Analytics によるページビュー・パフォーマンスデータ</li>
          </ul>
          <h3 className="mb-2 mt-4 font-semibold text-foreground">2.3 収集しない情報</h3>
          <ul className="list-disc space-y-1 pl-6">
            <li>クレジットカード番号（Stripeが直接処理し、当社はアクセスできません）</li>
            <li>ユーザーが入力したプロンプトの内容（AIモデルへの送信後、当社サーバーには保存しません）</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">3. 情報の利用目的</h2>
          <p>収集した情報は以下の目的で利用します。</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>アカウントの作成・認証・管理</li>
            <li>サービスの提供・維持・改善</li>
            <li>お支払いの処理（Stripeを通じて）</li>
            <li>利用状況の分析によるサービス改善</li>
            <li>カスタマーサポートの提供</li>
            <li>サービスに関する重要な通知の送信</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">4. 第三者への提供</h2>
          <p>当サービスは、以下の場合を除き、個人情報を第三者に提供しません。</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく開示要求があった場合</li>
            <li>サービス提供に必要な業務委託先への提供（以下の外部サービスを利用しています）</li>
          </ul>
          <h3 className="mb-2 mt-4 font-semibold text-foreground">利用している外部サービス</h3>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong>Supabase</strong>: 認証・データベース（<a href="https://supabase.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">プライバシーポリシー</a>）</li>
            <li><strong>Stripe</strong>: 決済処理（<a href="https://stripe.com/jp/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">プライバシーポリシー</a>）</li>
            <li><strong>OpenAI / Anthropic / Google</strong>: AI生成処理（プロンプトはリアルタイム処理のみ使用し、トレーニングには使用されません）</li>
            <li><strong>Vercel</strong>: ホスティング・アナリティクス（<a href="https://vercel.com/legal/privacy-policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">プライバシーポリシー</a>）</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">5. データの保管</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>個人情報はSupabase（AWSインフラストラクチャ）上に暗号化して保管されます。</li>
            <li>パスワードはハッシュ化して保存され、平文では保管しません。</li>
            <li>アカウント削除のご依頼があった場合、30日以内に全データを削除します。</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">6. Cookieの使用</h2>
          <p>当サービスは以下のCookieを使用します。</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>認証Cookie</strong>: ログイン状態の維持に必要（必須）</li>
            <li><strong>テーマ設定Cookie</strong>: ダークモード等の表示設定の保存</li>
            <li><strong>アナリティクスCookie</strong>: Vercel Analyticsによるサイト利用状況の把握</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">7. ユーザーの権利</h2>
          <p>ユーザーは以下の権利を有します。</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>アクセス権</strong>: 保有する個人情報の開示を請求できます</li>
            <li><strong>訂正権</strong>: 個人情報の訂正を請求できます</li>
            <li><strong>削除権</strong>: アカウントおよび関連データの削除を請求できます</li>
            <li><strong>データポータビリティ</strong>: 生成したUIデータをエクスポートできます</li>
          </ul>
          <p className="mt-2">上記の権利行使をご希望の場合は、下記お問い合わせ先までご連絡ください。</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">8. 未成年者について</h2>
          <p>
            当サービスは16歳未満の方を対象としておりません。16歳未満の方が個人情報を提供されたことが判明した場合、
            速やかに当該情報を削除いたします。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">9. ポリシーの変更</h2>
          <p>
            本プライバシーポリシーは、必要に応じて変更されることがあります。重要な変更がある場合は、
            サービス上の通知または登録メールアドレスへの連絡により告知します。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">10. お問い合わせ</h2>
          <p>
            プライバシーに関するお問い合わせは、以下までご連絡ください。
          </p>
          <p className="mt-2">メール: support@generative-ui.com</p>
        </section>
      </div>

      <div className="mt-12 flex gap-4 text-sm">
        <Link href="/terms" className="text-primary hover:underline">利用規約</Link>
        <Link href="/tokushoho" className="text-primary hover:underline">特定商取引法に基づく表記</Link>
      </div>
    </div>
  );
}
