-- Curated expansion from the CC0 OpenAlternative candidate list.
-- Run after the initial schema and reviewed seed migrations.

insert into public.products (slug, name, category, description_ja, publication_state, source_checked_at)
values
  ('airtable', 'Airtable', 'データベース', 'ノーコードでデータベースと業務フローを構築するサービス。', 'published', now()),
  ('google-analytics', 'Google Analytics', '分析', 'ウェブサイトやプロダクトの利用状況を分析するサービス。', 'published', now()),
  ('google-drive', 'Google Drive', 'ファイル管理', 'ファイル保存・共有・共同編集のクラウドサービス。', 'published', now()),
  ('github', 'GitHub', '開発', 'Gitリポジトリのホスティングと開発コラボレーションのサービス。', 'published', now()),
  ('trello', 'Trello', 'プロジェクト管理', 'カード型でタスクを整理するプロジェクト管理サービス。', 'published', now()),
  ('datadog', 'Datadog', '監視', 'インフラ・アプリケーションの監視サービス。', 'published', now()),
  ('miro', 'Miro', 'ホワイトボード', '共同作業向けのオンラインホワイトボード。', 'published', now()),
  ('intercom', 'Intercom', 'カスタマーサポート', '顧客対応とメッセージングのサービス。', 'published', now()),
  ('postman', 'Postman', 'API開発', 'APIの設計・テスト・共有を行うプラットフォーム。', 'published', now()),
  ('mixpanel', 'Mixpanel', '分析', 'プロダクト分析のサービス。', 'published', now())
on conflict (slug) do update
set name = excluded.name, category = excluded.category, description_ja = excluded.description_ja,
    publication_state = excluded.publication_state, source_checked_at = excluded.source_checked_at;

insert into public.projects (slug, name, short_description_ja, category, official_url, repository_url, license_spdx, primary_language, docker_available, publication_state, verification_state, verified_at, source_checked_at)
values
  ('nocodb', 'NocoDB', 'スプレッドシート感覚で使える、セルフホスト可能なノーコードデータベース。', 'データベース', 'https://nocodb.com', 'https://github.com/nocodb/nocodb', null, 'TypeScript', true, 'published', 'reviewing', null, now()),
  ('matomo', 'Matomo', 'データ保有者が分析データを管理できる、オープンソースのウェブ解析ツール。', '分析', 'https://matomo.org', 'https://github.com/matomo-org/matomo', 'GPL-3.0-only', 'PHP', true, 'published', 'verified', now(), now()),
  ('nextcloud', 'Nextcloud', 'ファイル同期、共有、共同作業を自社環境で運用できるプラットフォーム。', 'ファイル管理', 'https://nextcloud.com', 'https://github.com/nextcloud/server', null, 'PHP', true, 'published', 'reviewing', null, now()),
  ('gitea', 'Gitea', '軽量にセルフホストできるGitサービス。', '開発', 'https://about.gitea.com', 'https://github.com/go-gitea/gitea', 'MIT', 'Go', true, 'published', 'verified', now(), now()),
  ('vikunja', 'Vikunja', 'タスク、リスト、かんばんを扱えるオープンソースのタスク管理ツール。', 'プロジェクト管理', 'https://vikunja.io', 'https://github.com/go-vikunja/vikunja', 'AGPL-3.0-only', 'Go', true, 'published', 'verified', now(), now()),
  ('grafana', 'Grafana', 'メトリクス、ログ、トレースを可視化する監視・分析プラットフォーム。', '監視', 'https://grafana.com', 'https://github.com/grafana/grafana', 'AGPL-3.0-only', 'TypeScript', true, 'published', 'verified', now(), now()),
  ('excalidraw', 'Excalidraw', '手描き風の図を共同編集できるオープンソースのホワイトボード。', 'ホワイトボード', 'https://excalidraw.com', 'https://github.com/excalidraw/excalidraw', 'MIT', 'TypeScript', false, 'published', 'verified', now(), now()),
  ('chatwoot', 'Chatwoot', '複数チャネルの顧客対応を一元管理できるカスタマーサポート基盤。', 'カスタマーサポート', 'https://www.chatwoot.com', 'https://github.com/Chatwoot/chatwoot', 'MIT', 'Ruby', true, 'published', 'verified', now(), now()),
  ('hoppscotch', 'Hoppscotch', 'ブラウザでAPIを設計・テストできるオープンソースのAPI開発ツール。', 'API開発', 'https://hoppscotch.io', 'https://github.com/hoppscotch/hoppscotch', 'MIT', 'TypeScript', true, 'published', 'verified', now(), now()),
  ('posthog', 'PostHog', 'プロダクト分析、機能フラグ、セッションリプレイを扱える開発者向け分析基盤。', '分析', 'https://posthog.com', 'https://github.com/PostHog/posthog', 'MIT', 'Python', true, 'published', 'verified', now(), now())
on conflict (slug) do update
set name = excluded.name, short_description_ja = excluded.short_description_ja, category = excluded.category,
    official_url = excluded.official_url, repository_url = excluded.repository_url, license_spdx = excluded.license_spdx,
    primary_language = excluded.primary_language, docker_available = excluded.docker_available,
    publication_state = excluded.publication_state, verification_state = excluded.verification_state,
    verified_at = excluded.verified_at, source_checked_at = excluded.source_checked_at;

insert into public.alternative_relations (product_id, project_id, relation_state, migration_difficulty, migration_summary_ja, strengths_ja, constraints_ja, source_checked_at)
select p.id, o.id, 'verified', relation.difficulty, relation.summary,
       relation.strengths::jsonb, relation.constraints::jsonb, now()
from (
 values
  ('airtable','nocodb',3,'既存ベース、添付ファイル、自動化、権限設定の移行範囲を検証してください。','["セルフホスト可能","データベースを自前で管理"]','["ライセンス条件を公式情報で確認"]'),
  ('google-analytics','matomo',3,'タグ設置、過去データの扱い、同意管理を導入前に確認してください。','["分析データの保管先を選べる","セルフホスト可能"]','["計測設計の見直しが必要"]'),
  ('google-drive','nextcloud',4,'保存容量、クライアント同期、共有権限、バックアップを先に検証してください。','["データを自社環境で管理","同期・共有機能"]','["運用とストレージ設計が必要"]'),
  ('github','gitea',3,'CI/CD、Issues、組織権限、既存リポジトリの移行手順を確認してください。','["軽量にセルフホスト可能","Gitワークフローを管理"]','["外部連携の再設定が必要"]'),
  ('trello','vikunja',2,'ボード、リスト、カード、通知設定を小規模チームで先に検証してください。','["タスク管理を自前で運用","Docker対応"]','["Power-Up相当の機能を確認"]'),
  ('datadog','grafana',4,'収集基盤、アラート、ダッシュボード、保管期間を段階的に移行してください。','["可視化を柔軟に構成","多様なデータソースに対応"]','["監視基盤の設計と運用が必要"]'),
  ('miro','excalidraw',2,'共同編集、テンプレート、既存ボードの取り扱いを確認してください。','["シンプルな共同ホワイトボード","MITライセンス"]','["高度な業務機能は個別確認"]'),
  ('intercom','chatwoot',4,'チャネル連携、顧客データ、通知、運用チームの対応フローを検証してください。','["顧客対応データを管理","Docker対応"]','["初期設定と運用設計が必要"]'),
  ('postman','hoppscotch',2,'コレクション、環境変数、認証情報の移行方法を確認してください。','["ブラウザで使える","MITライセンス"]','["チーム機能の要件を確認"]'),
  ('mixpanel','posthog',4,'イベント定義、既存ダッシュボード、保持期間、同意管理を段階的に確認してください。','["分析基盤を自前で管理","Docker対応"]','["計測・運用コストを確認"]')
) as relation(product_slug, project_slug, difficulty, summary, strengths, constraints)
join public.products p on p.slug = relation.product_slug
join public.projects o on o.slug = relation.project_slug
on conflict (product_id, project_id) do update
set relation_state = excluded.relation_state, migration_difficulty = excluded.migration_difficulty,
    migration_summary_ja = excluded.migration_summary_ja, strengths_ja = excluded.strengths_ja,
    constraints_ja = excluded.constraints_ja, source_checked_at = excluded.source_checked_at;

insert into public.evidence_sources (project_id, kind, label, url, note_ja)
select project.id, source.kind::public.evidence_kind, source.label, source.url, source.note
from (
 values
  ('nocodb','official_site','NocoDB 公式サイト','https://nocodb.com','導入情報の確認先'),('nocodb','official_repository','NocoDB GitHub','https://github.com/nocodb/nocodb','ライセンス・更新状況の確認先'),
  ('matomo','official_site','Matomo 公式サイト','https://matomo.org','導入情報の確認先'),('matomo','official_repository','Matomo GitHub','https://github.com/matomo-org/matomo','ライセンス・更新状況の確認先'),
  ('nextcloud','official_site','Nextcloud 公式サイト','https://nextcloud.com','導入情報の確認先'),('nextcloud','official_repository','Nextcloud GitHub','https://github.com/nextcloud/server','ライセンス・更新状況の確認先'),
  ('gitea','official_site','Gitea 公式サイト','https://about.gitea.com','導入情報の確認先'),('gitea','official_repository','Gitea GitHub','https://github.com/go-gitea/gitea','ライセンス・更新状況の確認先'),
  ('vikunja','official_site','Vikunja 公式サイト','https://vikunja.io','導入情報の確認先'),('vikunja','official_repository','Vikunja GitHub','https://github.com/go-vikunja/vikunja','ライセンス・更新状況の確認先'),
  ('grafana','official_site','Grafana 公式サイト','https://grafana.com','導入情報の確認先'),('grafana','official_repository','Grafana GitHub','https://github.com/grafana/grafana','ライセンス・更新状況の確認先'),
  ('excalidraw','official_site','Excalidraw 公式サイト','https://excalidraw.com','導入情報の確認先'),('excalidraw','official_repository','Excalidraw GitHub','https://github.com/excalidraw/excalidraw','ライセンス・更新状況の確認先'),
  ('chatwoot','official_site','Chatwoot 公式サイト','https://www.chatwoot.com','導入情報の確認先'),('chatwoot','official_repository','Chatwoot GitHub','https://github.com/Chatwoot/chatwoot','ライセンス・更新状況の確認先'),
  ('hoppscotch','official_site','Hoppscotch 公式サイト','https://hoppscotch.io','導入情報の確認先'),('hoppscotch','official_repository','Hoppscotch GitHub','https://github.com/hoppscotch/hoppscotch','ライセンス・更新状況の確認先'),
  ('posthog','official_site','PostHog 公式サイト','https://posthog.com','導入情報の確認先'),('posthog','official_repository','PostHog GitHub','https://github.com/PostHog/posthog','ライセンス・更新状況の確認先')
) as source(project_slug, kind, label, url, note)
join public.projects project on project.slug = source.project_slug
where not exists (
 select 1 from public.evidence_sources existing
 where existing.project_id = project.id and existing.kind = source.kind::public.evidence_kind and existing.url = source.url
);
