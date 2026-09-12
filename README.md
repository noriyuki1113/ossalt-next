# ossalt-next

SaaSからOSSへの移行を、日本語で探し、比較し、判断するための新しいossaltです。

## 設計方針

- SaaS製品・OSSプロジェクト・代替関係を別々に管理する
- 比較の各主張に公式情報などの根拠を持たせる
- GitHubの数値は取得日時付きのスナップショットとして保存する
- スポンサー枠は編集順位・検証状態と別テーブルに分離する
- 計測はPVではなく、検索・比較・公式リンク遷移という意思決定行動を中心にする

## ローカル起動

```bash
cp .env.example .env.local
npm install
npm run dev
```

`.env.local` に新Supabaseのanon keyを設定してください。

## Supabaseの初期化

Supabase Dashboard の SQL Editor で以下を実行します。

```
supabase/migrations/20260912070000_initial_schema.sql
```

またはSupabase CLIで新プロジェクトにリンクしてから実行します。

```bash
supabase link --project-ref acakchddmmuylifrgkbv
supabase db push
```

初期表示用の確認済みデータも投入する場合は、続けて以下をSQL Editorで実行します。

```
supabase/migrations/20260912071000_seed_reviewed_records.sql
```

## 次の工程

1. 新Supabaseに初期のSaaS製品・OSSプロジェクト・根拠URLを投入
2. 旧サイトのデータから確認済み項目だけを移行
3. GitHub更新取得と根拠確認の管理画面・Edge Functionを追加
4. Vercelなどのホスティングに環境変数を設定して公開
