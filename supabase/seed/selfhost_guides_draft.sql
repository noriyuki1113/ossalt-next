-- Draft tool_selfhost_guides rows (status='draft'). NOT reviewed for publication.
-- See docs/selfhost-review.md for the candidate list, source links, and 要確認 notes.
--
-- Assumptions this seed depends on (verify before running):
--   1. `public.projects` already contains a row for every slug used in the `tool` CTE
--      below (these are drawn from data/reviewed-candidates.json — if any haven't been
--      imported into the live projects table yet, its INSERT will simply find no match
--      and be skipped by the `where tool_id is not null` guard, not error).
--   2. `public.vps_providers` already has an active row with slug = 'xserver-vps'.
--      This seed only targets that one provider (per your instruction); it does not
--      insert any vps_providers rows itself.
--   3. GitHub star counts were NOT available from the environment this was generated
--      in (api.github.com / github.com were blocked; only raw.githubusercontent.com
--      was reachable), so these are NOT ordered by star count. Order below matches
--      the existing order in data/reviewed-candidates.json. Re-rank before publishing
--      if star-count order matters to you.
--   4. method is 'docker_compose' for every row, per your instruction — no VPS
--      provider's startup-script/template offering was checked (xserver.ne.jp etc.
--      were also unreachable from this environment).
--
-- verified_at is today's date (2026-09-23) as instructed — this only means "the
-- source_url below was fetched and read on this date," not that the steps have been
-- tested end-to-end on xserver-vps. Review before flipping status to 'published'.

begin;

with tool(slug) as (
  values
    ('librechat'), ('bytechef'), ('langflow'), ('activepieces'), ('formbricks'),
    ('twenty'), ('plane'), ('umami'), ('plausible'), ('supabase'), ('appwrite'),
    ('immich'), ('jellyfin'), ('listmonk')
),
provider as (
  select id from public.vps_providers where slug = 'xserver-vps' and is_active
),
draft(tool_slug, recommended_memory_gb, steps_md, source_url) as (
  values
  ('librechat', null::numeric,
   E'1. VPSにDockerとDocker Composeをインストールする\n2. 公式リポジトリを取得する: git clone https://github.com/danny-avila/LibreChat\n3. .env.example を .env にコピーし、利用するモデルAPIキー等を設定する\n4. docker compose up -d を実行する\n5. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式要件未記載',
   'https://github.com/danny-avila/LibreChat/blob/main/docker-compose.yml'),

  ('bytechef', null::numeric,
   E'1. VPSにDockerとDocker Composeをインストールする\n2. 公式リポジトリを取得する: git clone https://github.com/bytechefhq/bytechef\n3. .env を設定する\n4. docker compose up -d を実行する\n5. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式要件未記載',
   'https://github.com/bytechefhq/bytechef/blob/master/docker-compose.yml'),

  ('langflow', null::numeric,
   E'1. VPSにDockerをインストールする\n2. 公式Dockerイメージ langflowai/langflow を使うdocker-compose.ymlを作成する（公式が配布するcompose定義は無く、READMEのdocker runコマンドを基に構成）\n3. docker compose up -d を実行する\n4. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式要件未記載',
   'https://github.com/langflow-ai/langflow/blob/master/README.md'),

  ('activepieces', null::numeric,
   E'1. VPSにDockerとDocker Composeをインストールする\n2. 公式リポジトリを取得する: git clone https://github.com/activepieces/activepieces\n3. .env を設定する\n4. docker compose up -d を実行する\n5. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式要件未記載',
   'https://github.com/activepieces/activepieces/blob/main/docker-compose.yml'),

  ('formbricks', null::numeric,
   E'1. VPSにDockerとDocker Composeをインストールする\n2. 公式のセルフホスト用compose定義を取得する: formbricks/formbricks の docker/docker-compose.yml\n3. 公式は formbricks.sh によるワンコマンドセットアップスクリプトも提供しているが、本ガイドはdocker composeベースで構成する\n4. .env を設定し docker compose up -d を実行する\n5. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式要件未記載',
   'https://github.com/formbricks/formbricks/blob/master/docker/README.md'),

  ('twenty', null::numeric,
   E'1. VPSにDockerとDocker Composeをインストールする\n2. 公式のcompose定義を取得する: twentyhq/twenty の packages/twenty-docker/docker-compose.yml\n3. .env を設定し docker compose up -d を実行する\n4. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式要件未記載',
   'https://github.com/twentyhq/twenty/blob/master/packages/twenty-docker/docker-compose.yml'),

  ('plane', null::numeric,
   E'1. VPSにDockerとDocker Composeをインストールする\n2. 公式リポジトリ（makeplane/plane、デフォルトブランチはpreview）の docker-compose.yml を取得する\n3. .env を設定し docker compose up -d を実行する\n4. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式要件未記載',
   'https://github.com/makeplane/plane/blob/preview/docker-compose.yml'),

  ('umami', null::numeric,
   E'1. VPSにDockerとDocker Composeをインストールする\n2. 公式リポジトリを取得する: git clone https://github.com/umami-software/umami\n3. .env を設定する\n4. docker compose up -d を実行する\n5. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式要件未記載',
   'https://github.com/umami-software/umami/blob/master/docker-compose.yml'),

  ('plausible', 2::numeric,
   E'1. VPSにDockerとDocker Composeをインストールする\n2. 公式セルフホストリポジトリを取得する: git clone -b <最新タグ> https://github.com/plausible/community-edition\n3. .env を作成して設定する\n4. docker compose up -d を実行する（compose.yml使用）\n5. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式ドキュメントに「ClickHouseの動作に最低2GB RAM推奨」と明記あり',
   'https://github.com/plausible/community-edition/blob/master/README.md'),

  ('supabase', null::numeric,
   E'1. VPSにDockerとDocker Composeをインストールする\n2. 公式リポジトリのdockerディレクトリを取得する: git clone https://github.com/supabase/supabase → cd supabase/docker\n3. .env.example を .env にコピーし設定する（詳細手順は公式ドキュメントsupabase.com/docs参照、本調査では外部サイト未確認）\n4. docker compose up -d を実行する\n5. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式要件未記載（詳細ドキュメントは外部サイトのため本セッションでは未確認）',
   'https://github.com/supabase/supabase/blob/master/docker/README.md'),

  ('appwrite', null::numeric,
   E'1. VPSにDockerとDocker Composeをインストールする\n2. 公式リポジトリを取得する: git clone https://github.com/appwrite/appwrite\n3. docker compose up -d を実行する\n4. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式要件未記載',
   'https://github.com/appwrite/appwrite/blob/main/docker-compose.yml'),

  ('immich', null::numeric,
   E'1. VPSにDockerとDocker Composeをインストールする\n2. 公式ドキュメントの注意事項に従い、開発ブランチではなく最新リリースのcompose定義を取得する: https://github.com/immich-app/immich/releases/latest/download/docker-compose.yml\n3. .env を設定し docker compose up -d を実行する\n4. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式要件未記載',
   'https://github.com/immich-app/immich/blob/master/docker/README.md'),

  ('jellyfin', null::numeric,
   E'1. VPSにDockerをインストールする\n2. 公式Dockerイメージ jellyfin/jellyfin を使うdocker-compose.ymlを作成する（メディア/設定用ディレクトリをボリュームマウント。公式が配布するcompose定義は無い）\n3. docker compose up -d を実行する\n4. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式要件未記載',
   'https://github.com/jellyfin/jellyfin/blob/master/README.md'),

  ('listmonk', null::numeric,
   E'1. VPSにDockerとDocker Composeをインストールする\n2. 公式リポジトリを取得する: git clone https://github.com/knadh/listmonk\n3. config.toml.sample を config.toml にコピーして設定する\n4. docker compose up -d を実行する\n5. リバースプロキシとHTTPSを設定する\n\n推奨メモリ: 公式要件未記載',
   'https://github.com/knadh/listmonk/blob/master/docker-compose.yml')
)
insert into public.tool_selfhost_guides
  (tool_id, provider_id, method, recommended_memory_gb, steps_md, source_url, verified_at, status)
select
  p.id,
  provider.id,
  'docker_compose',
  draft.recommended_memory_gb,
  draft.steps_md,
  draft.source_url,
  date '2026-09-23',
  'draft'
from draft
join tool on tool.slug = draft.tool_slug
join public.projects p on p.slug = tool.slug
cross join provider
where provider.id is not null
on conflict (tool_id, provider_id) do nothing;

commit;
