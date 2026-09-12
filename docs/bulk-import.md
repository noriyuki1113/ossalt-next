# OpenAlternative候補の一括取込

この仕組みは、[OpenAlternativeのAwesome List](https://github.com/piotrkulpinski/open-source-alternatives) を**候補発見用**に取り込みます。

取り込まれるのは非公開の `import_candidates` テーブルだけです。サイトの一覧、検索結果、比較ページには自動で表示されません。

## 公開までのルール

1. 候補を一括取込する
2. 公式サイト・公式リポジトリ・ライセンス・セルフホスト可否を確認する
3. 根拠URLと確認日を保存する
4. `projects` と `alternative_relations` にレビュー済みとして登録する
5. 初めて公開ディレクトリに表示される

スポンサー料金や広告契約は、この手順・通常の並び順・評価に影響しません。

## 初回設定

1. Supabase SQL Editor で `20260912074000_create_import_candidates.sql` を実行する。
2. GitHub リポジトリの **Settings → Secrets and variables → Actions → New repository secret** を開く。
3. 名前を `SUPABASE_SERVICE_ROLE_KEY` にし、Supabase Dashboard の **Settings → API** にある service_role キーを直接入力して保存する。
4. GitHub の **Actions → Import OpenAlternative candidates → Run workflow** を押す。

> service_role キーはデータベース全体を操作できる管理キーです。チャット、Issue、README、Vercel環境変数には絶対に貼り付けません。GitHub Secret にだけ保存してください。

## 更新

元リストの更新を候補一覧にも反映したいときは、同じ Actions ワークフローを再実行します。既存候補は `source_name + source_slug` で更新され、重複しません。
