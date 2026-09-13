# ossalt

**SaaSからOSSへの移行を、日本語で探し、比較し、判断するためのディレクトリ。**

[Webサイトを見る](https://ossalt-next.vercel.app) · [レビュー基準](docs/candidate-review.md)

ossalt は、単に「代替OSSを見つける」だけではなく、**移行難易度・ライセンス・セルフホスト可否・運用負担・失う機能**まで確認して、実際に乗り換えられるかを判断するためのプロジェクトです。

> 探索力は OpenAlternative のような優れたOSSディレクトリから学びつつ、ossalt は「日本語での移行判断」に重点を置いています。

## Directory

現在のレビュー済みデータ:

- **OSS:** 19
- **代替元SaaS:** 14
- **カテゴリ:** 14
- **レビュー基準日:** 2026-09-12

## Contents

- [AIエージェント開発](#aiエージェント開発)
- [AIチャット](#aiチャット)
- [BaaS](#baas)
- [BI](#bi)
- [CRM](#crm)
- [スケジューリング](#スケジューリング)
- [フォーム・アンケート](#フォーム-アンケート)
- [プロジェクト管理](#プロジェクト管理)
- [マーケティング](#マーケティング)
- [メール配信](#メール配信)
- [メディアサーバー](#メディアサーバー)
- [自動化](#自動化)
- [写真管理](#写真管理)
- [分析](#分析)

## AIエージェント開発

- **[Dify](https://ossalt-next.vercel.app/projects/dify)** — エージェント、RAG、ワークフロー、モデル管理をまとめて扱えるセルフホスト対応のLLMアプリ開発プラットフォーム。 `License要確認` · Microsoft Copilot Studio の代替 · 移行難易度 `4/5` · [GitHub](https://github.com/langgenius/dify)
- **[Langflow](https://ossalt-next.vercel.app/projects/langflow)** — ドラッグ&ドロップでAIエージェント、RAGアプリ、MCPサーバーを構築・デプロイできるオープンソースのローコード開発ツール。 `MIT` · Microsoft Copilot Studio の代替 · 移行難易度 `4/5` · [GitHub](https://github.com/langflow-ai/langflow)
- **[Letta](https://ossalt-next.vercel.app/projects/letta)** — 長期記憶と継続的な状態を持つAIエージェントを構築・運用できる、セルフホスト対応のオープンソース基盤。 `Apache-2.0` · Microsoft Copilot Studio の代替 · 移行難易度 `4/5` · [GitHub](https://github.com/letta-ai/letta)

## AIチャット

- **[LibreChat](https://ossalt-next.vercel.app/projects/librechat)** — 複数のAIモデルを切り替えて利用できる、セルフホスト対応のオープンソースAIチャットUI。 `MIT` · ChatGPT の代替 · 移行難易度 `3/5` · [GitHub](https://github.com/danny-avila/LibreChat)

## BaaS

- **[Appwrite](https://ossalt-next.vercel.app/projects/appwrite)** — 認証、データベース、ストレージ、Functions、Realtimeなどを提供するセルフホスト対応BaaS。 `BSD-3-Clause` · Firebase の代替 · 移行難易度 `3/5` · [GitHub](https://github.com/appwrite/appwrite)
- **[Supabase](https://ossalt-next.vercel.app/projects/supabase)** — PostgreSQLを中心に認証、ストレージ、リアルタイム、Edge Functionsなどを提供するオープンソースBaaS。 `Apache-2.0` · Firebase の代替 · 移行難易度 `4/5` · [GitHub](https://github.com/supabase/supabase)

## BI

- **[Metabase](https://ossalt-next.vercel.app/projects/metabase)** — SQLを書かずに質問やダッシュボードを作成でき、セルフホストも可能なBI・データ可視化ツール。 `License要確認` · Tableau の代替 · 移行難易度 `3/5` · [GitHub](https://github.com/metabase/metabase)

## CRM

- **[Twenty](https://ossalt-next.vercel.app/projects/twenty)** — 顧客、商談、企業情報を管理し、カスタマイズ可能なセルフホスト型CRM。 `AGPL-3.0` · Salesforce の代替 · 移行難易度 `4/5` · [GitHub](https://github.com/twentyhq/twenty)

## スケジューリング

- **[Cal.com](https://ossalt-next.vercel.app/projects/cal-com)** — 予約ページ、チームスケジュール、ルーティングなどを提供するセルフホスト対応のスケジューリング基盤。 `License要確認` · Calendly の代替 · 移行難易度 `2/5` · [GitHub](https://github.com/calcom/cal.com)

## フォーム・アンケート

- **[Formbricks](https://ossalt-next.vercel.app/projects/formbricks)** — アンケート、プロダクト内調査、顧客フィードバックを扱えるプライバシー重視のセルフホスト対応プラットフォーム。 `AGPL-3.0` · Typeform の代替 · 移行難易度 `3/5` · [GitHub](https://github.com/formbricks/formbricks)

## プロジェクト管理

- **[Plane](https://ossalt-next.vercel.app/projects/plane)** — Issues、Cycles、Modules、Viewsなどを備えたセルフホスト対応のプロジェクト管理プラットフォーム。 `AGPL-3.0` · Jira の代替 · 移行難易度 `3/5` · [GitHub](https://github.com/makeplane/plane)

## マーケティング

- **[Mautic](https://ossalt-next.vercel.app/projects/mautic)** — コンタクト管理、メール、フォーム、キャンペーン自動化を提供するセルフホスト対応マーケティングオートメーション基盤。 `GPL-3.0` · HubSpot の代替 · 移行難易度 `4/5` · [GitHub](https://github.com/mautic/mautic)

## メール配信

- **[Listmonk](https://ossalt-next.vercel.app/projects/listmonk)** — 大量配信、リスト管理、テンプレート、分析を提供する高速なセルフホスト型ニュースレター配信ツール。 `AGPL-3.0` · Mailchimp の代替 · 移行難易度 `3/5` · [GitHub](https://github.com/knadh/listmonk)

## メディアサーバー

- **[Jellyfin](https://ossalt-next.vercel.app/projects/jellyfin)** — 映画、テレビ、音楽などを自分のサーバーから配信できるオープンソースのメディアサーバー。 `GPL-2.0` · Plex の代替 · 移行難易度 `2/5` · [GitHub](https://github.com/jellyfin/jellyfin)

## 自動化

- **[Activepieces](https://ossalt-next.vercel.app/projects/activepieces)** — ノーコードで多数のサービスを連携し、セルフホストもできるワークフロー自動化プラットフォーム。 `MIT` · Zapier の代替 · 移行難易度 `3/5` · [GitHub](https://github.com/activepieces/activepieces)
- **[ByteChef](https://ossalt-next.vercel.app/projects/bytechef)** — AIエージェントとワークフロー自動化を組み合わせられる、セルフホスト対応のオープンコア自動化プラットフォーム。 `Apache-2.0` · Zapier の代替 · 移行難易度 `4/5` · [GitHub](https://github.com/bytechefhq/bytechef)

## 写真管理

- **[Immich](https://ossalt-next.vercel.app/projects/immich)** — 写真と動画を自分のサーバーへバックアップし、タイムライン、検索、共有を利用できるセルフホスト型写真管理サービス。 `AGPL-3.0` · Google Photos の代替 · 移行難易度 `3/5` · [GitHub](https://github.com/immich-app/immich)

## 分析

- **[Plausible](https://ossalt-next.vercel.app/projects/plausible)** — プライバシー重視で軽量なウェブ解析を提供する、セルフホスト可能なオープンソース分析ツール。 `AGPL-3.0` · Google Analytics の代替 · 移行難易度 `2/5` · [GitHub](https://github.com/plausible/analytics)
- **[Umami](https://ossalt-next.vercel.app/projects/umami)** — 軽量でプライバシー重視のセルフホスト対応ウェブ解析ツール。 `MIT` · Google Analytics の代替 · 移行難易度 `2/5` · [GitHub](https://github.com/umami-software/umami)

## ossalt で見るポイント

各OSSの詳細ページでは、GitHubの活動状況だけでなく、実際の導入判断に必要な情報をまとめます。

- Stars / Forks / Open Issues / Last commit / Latest release
- License / Primary language / Self-host
- 向いているケース / 向いていないケース
- 主な機能 / 技術的な確認点
- SaaSからの移行時に失う可能性があるもの
- 導入・更新・バックアップ・監視の運用負担
- Alternative to / Similar OSS
- GitHub snapshot と公式情報の確認日時

## Data flow

公開データと候補データを分離し、レビュー済みのものだけを公開します。

```text
Open-source candidate sources
        ↓
import_candidates (private)
        ↓
human review / approve / reject
        ↓
products + projects + alternative_relations
        ↓
published_alternative_directory
        ↓
ossalt web
```

GitHub の Stars、Forks、Issues、Last commit、Release などは定期ジョブでスナップショットとして保存します。

## Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

主要コマンド:

```bash
npm run build
npm run import:openalternative
npm run review:candidate
npm run sync:github-snapshots
npm run generate:readme
```

`.env.local` にはブラウザ公開可能な Supabase anon key のみを設定します。Service Role Key は GitHub Actions などサーバー側だけで利用します。

## Supabase

マイグレーションは `supabase/migrations/` にあります。新しい環境では順番に適用してください。

```bash
supabase link --project-ref acakchddmmuylifrgkbv
supabase db push
```

## Contributing

掲載候補や内容の修正は Issue / Pull Request で歓迎します。

候補は「有名だから」ではなく、**公式情報を確認でき、代替関係と移行上の注意を説明できること**を重視します。ライセンスが曖昧な場合は推測せず `要確認` のまま扱います。

レビュー済み候補の一覧は `data/reviewed-candidates.json` がソースです。README はこのJSONから生成できます。

## Acknowledgements

候補探索の入口として [OpenAlternative](https://openalternative.co/) の公開OSSリストを参照しています。ossalt では候補をそのまま公開せず、独自のレビュー・移行情報を加えて掲載します。

---

**Last reviewed:** 2026-09-12
