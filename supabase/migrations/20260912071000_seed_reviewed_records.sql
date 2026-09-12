-- Initial reviewed records for ossalt-next.
-- Run after 20260912070000_initial_schema.sql.

insert into public.products (slug, name, category, description_ja, publication_state, source_checked_at)
values
  ('notion', 'Notion', 'ワークスペース', 'ドキュメント、データベース、タスクをまとめて扱うワークスペースサービス。', 'published', now()),
  ('slack', 'Slack', 'コミュニケーション', 'チーム向けのメッセージング・コラボレーションサービス。', 'published', now()),
  ('figma', 'Figma', 'デザイン', '共同編集に対応したブラウザベースのデザインツール。', 'published', now())
on conflict (slug) do update
set name = excluded.name, category = excluded.category, description_ja = excluded.description_ja,
    publication_state = excluded.publication_state, source_checked_at = excluded.source_checked_at;

insert into public.projects (slug, name, short_description_ja, category, official_url, repository_url, license_spdx, primary_language, docker_available, publication_state, verification_state, verified_at, source_checked_at)
values
  ('appflowy', 'AppFlowy', 'ローカルファーストで、ドキュメントとタスクをまとめて扱えるオープンソースのワークスペース。', 'ワークスペース', 'https://appflowy.io', 'https://github.com/AppFlowy-IO/AppFlowy', 'AGPL-3.0-only', 'Rust', true, 'published', 'verified', now(), now()),
  ('mattermost', 'Mattermost', 'チームコミュニケーションを自社環境で運用できるオープンソースのメッセージング基盤。', 'コミュニケーション', 'https://mattermost.com', 'https://github.com/mattermost/mattermost', 'AGPL-3.0-only', 'Go', true, 'published', 'verified', now(), now()),
  ('penpot', 'Penpot', 'ブラウザ上で共同編集できる、デザインとプロトタイピングのためのオープンソースツール。', 'デザイン', 'https://penpot.app', 'https://github.com/penpot/penpot', 'MPL-2.0', 'Clojure', true, 'published', 'verified', now(), now())
on conflict (slug) do update
set name = excluded.name, short_description_ja = excluded.short_description_ja, category = excluded.category,
    official_url = excluded.official_url, repository_url = excluded.repository_url, license_spdx = excluded.license_spdx,
    primary_language = excluded.primary_language, docker_available = excluded.docker_available,
    publication_state = excluded.publication_state, verification_state = excluded.verification_state,
    verified_at = excluded.verified_at, source_checked_at = excluded.source_checked_at;

insert into public.alternative_relations (product_id, project_id, relation_state, migration_difficulty, migration_summary_ja, strengths_ja, constraints_ja, source_checked_at)
select p.id, o.id, 'verified', relation.migration_difficulty, relation.migration_summary_ja,
       relation.strengths_ja::jsonb, relation.constraints_ja::jsonb, now()
from (
  values
    ('notion', 'appflowy', 3, '既存データの移行範囲と共同編集の要件を、導入前に公式情報で確認してください。', '["セルフホスト可能","ローカルファースト"]', '["既存データの移行を事前確認"]'),
    ('slack', 'mattermost', 3, 'チャンネル設計、通知、過去ログの移行範囲を先に決めてから検証してください。', '["データの保管先を選べる","Docker対応"]', '["運用担当が必要"]'),
    ('figma', 'penpot', 3, 'デザインファイルの移行可否、共同編集、既存プラグインの利用条件を検証してください。', '["共同編集に対応","セルフホスト可能"]', '["デザイン資産の移行を確認"]')
) as relation(product_slug, project_slug, migration_difficulty, migration_summary_ja, strengths_ja, constraints_ja)
join public.products p on p.slug = relation.product_slug
join public.projects o on o.slug = relation.project_slug
on conflict (product_id, project_id) do update
set relation_state = excluded.relation_state, migration_difficulty = excluded.migration_difficulty,
    migration_summary_ja = excluded.migration_summary_ja, strengths_ja = excluded.strengths_ja,
    constraints_ja = excluded.constraints_ja, source_checked_at = excluded.source_checked_at;

insert into public.evidence_sources (project_id, kind, label, url, note_ja)
select project.id, source.kind::public.evidence_kind, source.label, source.url, source.note_ja
from (
  values
    ('appflowy', 'official_site', 'AppFlowy 公式サイト', 'https://appflowy.io', '導入情報の確認先'),
    ('appflowy', 'official_repository', 'AppFlowy GitHub', 'https://github.com/AppFlowy-IO/AppFlowy', 'ライセンス・更新状況の確認先'),
    ('mattermost', 'official_site', 'Mattermost 公式サイト', 'https://mattermost.com', '導入情報の確認先'),
    ('mattermost', 'official_repository', 'Mattermost GitHub', 'https://github.com/mattermost/mattermost', 'ライセンス・更新状況の確認先'),
    ('penpot', 'official_site', 'Penpot 公式サイト', 'https://penpot.app', '導入情報の確認先'),
    ('penpot', 'official_repository', 'Penpot GitHub', 'https://github.com/penpot/penpot', 'ライセンス・更新状況の確認先')
) as source(project_slug, kind, label, url, note_ja)
join public.projects project on project.slug = source.project_slug
where not exists (
  select 1 from public.evidence_sources existing
  where existing.project_id = project.id and existing.kind = source.kind::public.evidence_kind and existing.url = source.url
);
