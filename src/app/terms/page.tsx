import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約 - 生成UI",
  description: "生成UIサービスの利用規約です。サービスの利用条件、禁止事項、免責事項等をご確認ください。",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">利用規約</h1>
      <p className="mt-2 text-sm text-muted-foreground">最終更新日: 2026年3月12日</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">第1条（適用）</h2>
          <p>
            本利用規約（以下「本規約」）は、生成UI（以下「当サービス」）の利用に関する条件を定めるものです。
            ユーザーは本規約に同意の上、当サービスをご利用ください。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">第2条（サービス内容）</h2>
          <p>当サービスは、AIを活用してUIコンポーネントを自動生成するクラウドソフトウェア（SaaS）です。主な機能は以下の通りです。</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>自然言語によるUIコンポーネント（フォーム、テーブル、チャート等）の自動生成</li>
            <li>生成したUIのエクスポート（JSON / HTML / React）</li>
            <li>テンプレート・ギャラリー機能</li>
            <li>有料プランにおける追加機能（クライアント管理、提案書生成、Vercelデプロイ等）</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">第3条（アカウント）</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>ユーザーは正確な情報を提供してアカウントを登録する必要があります。</li>
            <li>アカウントの管理責任はユーザーに帰属します。パスワードの管理は適切に行ってください。</li>
            <li>1人のユーザーが複数のアカウントを作成することは禁止します。</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">第4条（料金・支払い）</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>当サービスには無料プランと有料プラン（Proプラン）があります。</li>
            <li>Proプランの料金は月額3,980円（税込）または年額39,800円（税込）です。</li>
            <li>決済はStripeを通じたクレジットカード決済で行われます。</li>
            <li>サブスクリプションは自動更新されます。更新日の前日までに解約手続きを行ってください。</li>
            <li>日割り返金は原則として行いません。ただし、第5条の返金保証が適用される場合を除きます。</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">第5条（返金保証）</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Proプランの初回サブスクリプション開始日から30日以内であれば、全額返金いたします。</li>
            <li>返金をご希望の場合は、サポートまでメールにてご連絡ください。</li>
            <li>返金処理はStripeを通じて行われ、カード会社の処理状況により返金完了まで5〜10営業日かかる場合があります。</li>
            <li>2回目以降のサブスクリプション期間には返金保証は適用されません。</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">第6条（解約）</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>ユーザーはいつでもProプランを解約できます。</li>
            <li>解約後も、現在の請求期間の終了日まではProプランの機能を引き続きご利用いただけます。</li>
            <li>解約手続きは設定画面から行うことができます。</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">第7条（禁止事項）</h2>
          <p>ユーザーは以下の行為を行ってはなりません。</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>法令または公序良俗に反する目的での利用</li>
            <li>当サービスの運営を妨害する行為（過度なAPI呼び出し、スクレイピング等）</li>
            <li>他のユーザーの利用を妨げる行為</li>
            <li>当サービスのリバースエンジニアリング、逆コンパイル、逆アセンブル</li>
            <li>不正アクセスまたはそのおそれのある行為</li>
            <li>当サービスを利用して違法なコンテンツを生成する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">第8条（知的財産権）</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>当サービスのソフトウェア、デザイン、ロゴ等の知的財産権は当社に帰属します。</li>
            <li>ユーザーが当サービスを利用して生成したUIコンポーネントの著作権はユーザーに帰属します。</li>
            <li>ユーザーは生成したUIコンポーネントを商用・非商用を問わず自由に利用できます。</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">第9条（免責事項）</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>当サービスはAIによる自動生成を行うため、生成結果の正確性・完全性を保証するものではありません。</li>
            <li>当サービスの利用によりユーザーに生じた損害について、当社の故意または重過失による場合を除き、当社は責任を負いません。</li>
            <li>当サービスは現状有姿（AS IS）で提供されます。</li>
            <li>システムメンテナンスや障害により、サービスが一時的に利用できない場合があります。</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">第10条（サービスの変更・終了）</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>当社は、ユーザーへの事前通知なく当サービスの内容を変更できるものとします。</li>
            <li>当社は、30日前の事前通知により当サービスを終了できるものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">第11条（規約の変更）</h2>
          <p>
            当社は本規約を変更できるものとします。変更後の規約は当サービス上に掲載した時点で効力を生じます。
            重要な変更については、サービス上または登録メールアドレスへの通知により告知します。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">第12条（準拠法・管轄）</h2>
          <p>本規約は日本法に準拠し、本規約に関する紛争は東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">お問い合わせ</h2>
          <p>
            本規約に関するお問い合わせは、以下までご連絡ください。
          </p>
          <p className="mt-2">メール: support@generative-ui.com</p>
        </section>
      </div>

      <div className="mt-12 flex gap-4 text-sm">
        <Link href="/privacy" className="text-primary hover:underline">プライバシーポリシー</Link>
        <Link href="/tokushoho" className="text-primary hover:underline">特定商取引法に基づく表記</Link>
      </div>
    </div>
  );
}
