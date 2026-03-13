# 生成UI ローンチチェックリスト

## P0: ローンチ必須（これがないと収益が発生しない）

### 1. Stripe 本番化
- [ ] Stripe ダッシュボードで本番モード（Live Mode）を有効化
- [ ] 本番 API キーを取得: `sk_live_...`, `pk_live_...`
- [ ] 月額プラン Price を作成（¥3,980/月）→ `STRIPE_PRO_PRICE_ID`
- [ ] 年額プラン Price を作成（¥39,800/年）→ `STRIPE_PRO_ANNUAL_PRICE_ID`
- [ ] Webhook エンドポイント登録: `https://your-domain.com/api/stripe/webhook`
  - イベント: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
- [ ] Webhook Signing Secret を取得 → `STRIPE_WEBHOOK_SECRET`
- [ ] Vercel の環境変数を本番キーに差し替え

### 2. カスタムドメイン
- [ ] ドメインを取得（例: generative-ui.com, seisei-ui.com 等）
- [ ] Vercel にカスタムドメインを追加
- [ ] `NEXT_PUBLIC_SITE_URL` を更新
- [ ] 特商法ページの「販売URL」を更新

### 3. メールアドレス
- [ ] `support@your-domain.com` を実際に受信可能にする
  - Google Workspace、Zoho Mail、独自メールサーバー等
- [ ] プライバシーポリシー・利用規約のメールアドレスを更新

### 4. AI API キー設定
- [ ] `OPENAI_API_KEY` が Vercel に設定されていることを確認
- [ ] `ANTHROPIC_API_KEY` を取得して Vercel に設定
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY` を取得して Vercel に設定
- [ ] 各プロバイダーで利用上限（spending limit）を設定

### 5. Supabase マイグレーション
- [ ] Supabase SQL Editor で `supabase-setup.sql` を実行（初回のみ）
- [ ] Supabase SQL Editor で `supabase-migration-v2.sql` を実行
- [ ] テーブルが作成されたことを確認（generated_uis, shared_uis, feedback_comments）

---

## P1: ローンチ前に強く推奨

### 6. Sentry エラー監視
- [ ] https://sentry.io でプロジェクト作成
- [ ] `NEXT_PUBLIC_SENTRY_DSN` を Vercel に設定
- [ ] (任意) `SENTRY_AUTH_TOKEN` でソースマップアップロード設定

### 7. Google ソーシャルログイン
- [ ] Google Cloud Console でOAuth 2.0 クライアントを作成
  - Authorized redirect URI: `https://your-supabase-project.supabase.co/auth/v1/callback`
- [ ] Supabase Dashboard > Authentication > Providers > Google を有効化
  - Client ID と Client Secret を設定
- [ ] テスト: Google ログインが動作することを確認

### 8. ビルド確認
- [ ] `npm run build` がエラーなしで完了すること
- [ ] Vercel にデプロイしてプレビューで動作確認

---

## P2: ローンチ後早期に対応

### 9. コンバージョン計測
- [ ] Google Analytics 4 を設定
- [ ] Stripe → GA4 の連携設定（購入イベント）
- [ ] UTM パラメータの計測設定

### 10. トランザクションメール
- [ ] Supabase のメールテンプレートをカスタマイズ
  - 確認メール、パスワードリセット
- [ ] (任意) Resend 等で welcome メール・支払い確認メールを追加

### 11. バックアップ
- [ ] Supabase の自動バックアップが有効であることを確認
- [ ] (任意) pg_dump による定期バックアップスクリプト

---

## 設定ファイル参照

- 環境変数テンプレート: `.env.production.example`
- DB スキーマ: `supabase-setup.sql` + `supabase-migration-v2.sql`
- Sentry 設定: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
