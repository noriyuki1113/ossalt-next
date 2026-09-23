-- Two-level, many-to-many categories and a license reference table.
--
-- Replaces the single free-text projects.category with categories/project_categories.
-- Existing projects.category values are migrated as each project's primary category:
-- matched by name_ja or by `aliases` (which also holds OpenAlternative's English
-- subcategory names, so imported candidates can be auto-linked); any value that matches
-- nothing becomes a leaf under "その他" so no existing categorization is lost.
begin;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name_ja text not null unique,
  parent_id uuid references public.categories(id) on delete restrict,
  sort_order integer not null default 0,
  description_ja text,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);

create function public.enforce_category_depth()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if new.parent_id is not null then
    if exists (select 1 from public.categories where id = new.parent_id and parent_id is not null) then
      raise exception 'categories can only be nested one level deep';
    end if;
    if exists (select 1 from public.categories where parent_id = new.id) then
      raise exception 'a category that has children cannot itself have a parent';
    end if;
  end if;
  return new;
end;
$$;

create trigger categories_depth before insert or update on public.categories
  for each row execute function public.enforce_category_depth();
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

create table public.project_categories (
  project_id uuid not null references public.projects(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (project_id, category_id)
);
create unique index project_categories_one_primary on public.project_categories(project_id) where is_primary;
create index project_categories_category_idx on public.project_categories(category_id);

insert into public.categories (slug, name_ja, sort_order) values
  ('ai', 'AI・機械学習', 10),
  ('collaboration', 'コラボレーション', 20),
  ('business', 'ビジネス・業務', 30),
  ('marketing-analytics', 'マーケティング・分析', 40),
  ('developer', '開発・自動化', 50),
  ('infrastructure', 'インフラ・運用', 60),
  ('design-media', 'デザイン・メディア', 70),
  ('other', 'その他', 999);

insert into public.categories (slug, name_ja, parent_id, sort_order, aliases)
select leaf.slug, leaf.name_ja, parent.id, leaf.sort_order, leaf.aliases
from (values
  ('ai-chat', 'AIチャット', 'ai', 10, array['AI Interaction & Interfaces']),
  ('ai-agent-development', 'AIエージェント開発', 'ai', 20, array['AI Development Platforms', 'Machine Learning Infrastructure']),
  ('workspace', 'ワークスペース', 'collaboration', 10, array['Note Taking & Knowledge Management']),
  ('communication', 'コミュニケーション', 'collaboration', 20, array['Collaboration & Communication']),
  ('whiteboard', 'ホワイトボード', 'collaboration', 30, array[]::text[]),
  ('file-management', 'ファイル管理', 'collaboration', 40, array['File Management & Sync']),
  ('document-management', 'ドキュメント管理', 'collaboration', 50, array['Documentation & Knowledge Base', 'Document Management & E-Signatures']),
  ('crm', 'CRM', 'business', 10, array['CRM & Sales']),
  ('project-management', 'プロジェクト管理', 'business', 20, array['Project & Work Management']),
  ('scheduling', 'スケジューリング', 'business', 30, array['Scheduling & Event Management']),
  ('forms-surveys', 'フォーム・アンケート', 'business', 40, array['Forms & Surveys']),
  ('customer-support', 'カスタマーサポート', 'business', 50, array['Customer Support & Success']),
  ('marketing', 'マーケティング', 'marketing-analytics', 10, array['Marketing & Customer Engagement']),
  ('email-marketing', 'メール配信', 'marketing-analytics', 20, array[]::text[]),
  ('analytics', '分析', 'marketing-analytics', 30, array['Web & Product Analytics']),
  ('business-intelligence', 'BI', 'marketing-analytics', 40, array['Business Intelligence & Reporting']),
  ('development', '開発', 'developer', 10, array['Version Control & Collaboration', 'IDEs & Code Editors']),
  ('api-development', 'API開発', 'developer', 20, array['API Development & Testing']),
  ('baas', 'BaaS', 'developer', 30, array['Frameworks & Platforms']),
  ('automation', '自動化', 'developer', 40, array['Automation', 'Integration Platforms']),
  ('database', 'データベース', 'infrastructure', 10, array['Databases']),
  ('monitoring', '監視', 'infrastructure', 20, array['Monitoring & Observability']),
  ('design', 'デザイン', 'design-media', 10, array['Design & Prototyping']),
  ('photo-management', '写真管理', 'design-media', 20, array['Photo & Video Editors']),
  ('media-server', 'メディアサーバー', 'design-media', 30, array['Media & Streaming'])
) as leaf(slug, name_ja, parent_slug, sort_order, aliases)
join public.categories parent on parent.slug = leaf.parent_slug;

-- Any existing value that matches no name/alias is kept as a leaf under その他.
insert into public.categories (slug, name_ja, parent_id, sort_order)
select 'other-' || substr(md5(existing.category), 1, 8), existing.category,
       (select id from public.categories where slug = 'other'), 999
from (
  select distinct btrim(category) as category from public.projects
  where category is not null and btrim(category) <> ''
) existing
where not exists (
  select 1 from public.categories c
  where c.name_ja = existing.category or existing.category = any(c.aliases)
);

insert into public.project_categories (project_id, category_id, is_primary)
select p.id, c.id, true
from public.projects p
join lateral (
  select id from public.categories c
  where c.name_ja = btrim(p.category) or btrim(p.category) = any(c.aliases)
  order by (c.name_ja = btrim(p.category)) desc
  limit 1
) c on true
where p.category is not null and btrim(p.category) <> '';

-- License reference. `identifier` is the canonical value stored in
-- projects.license_spdx (an SPDX id except for non-SPDX licenses such as n8n's);
-- `aliases` absorbs spelling variants (e.g. AGPL-3.0 vs AGPL-3.0-only).
-- kind: 'osi' = OSI-approved open source; 'source_available' = source is public but the
-- license is not OSI-approved (usage restrictions apply).
create table public.licenses (
  slug text primary key check (slug ~ '^[a-z0-9]+(?:[.-][a-z0-9]+)*$'),
  identifier text not null unique,
  aliases text[] not null default '{}',
  name text not null,
  kind text not null check (kind in ('osi', 'source_available')),
  copyleft text check (copyleft in ('none', 'weak', 'strong', 'network')),
  summary_ja text not null,
  reference_url text
);

insert into public.licenses (slug, identifier, aliases, name, kind, copyleft, summary_ja, reference_url) values
  ('mit', 'MIT', '{}', 'MIT License', 'osi', 'none',
   '著作権表示とライセンス文を残せば、商用利用・改変・再配布ができる寛容なライセンス。', 'https://spdx.org/licenses/MIT.html'),
  ('apache-2.0', 'Apache-2.0', '{}', 'Apache License 2.0', 'osi', 'none',
   'MITと同様に寛容なライセンス。特許の利用許諾が明記され、改変箇所の明示などが条件になる。', 'https://spdx.org/licenses/Apache-2.0.html'),
  ('bsd-3-clause', 'BSD-3-Clause', '{}', 'BSD 3-Clause License', 'osi', 'none',
   '著作権表示の保持などを条件に自由に利用できる寛容なライセンス。著作者名を宣伝に使うことは禁止されている。', 'https://spdx.org/licenses/BSD-3-Clause.html'),
  ('bsd-2-clause', 'BSD-2-Clause', '{}', 'BSD 2-Clause License', 'osi', 'none',
   '著作権表示の保持を条件に自由に利用できる寛容なライセンス。', 'https://spdx.org/licenses/BSD-2-Clause.html'),
  ('isc', 'ISC', '{}', 'ISC License', 'osi', 'none',
   'MITとほぼ同等の、簡潔な寛容型ライセンス。', 'https://spdx.org/licenses/ISC.html'),
  ('mpl-2.0', 'MPL-2.0', '{}', 'Mozilla Public License 2.0', 'osi', 'weak',
   'ファイル単位の弱いコピーレフト。MPL対象のファイルを改変して配布する場合は、そのファイルのソース公開が必要。', 'https://spdx.org/licenses/MPL-2.0.html'),
  ('lgpl-2.1', 'LGPL-2.1-only', '{LGPL-2.1,LGPL-2.1-or-later}', 'GNU LGPL v2.1', 'osi', 'weak',
   'ライブラリ自体を改変して配布する場合は公開が必要だが、ライブラリを利用するアプリ側には原則及ばない弱いコピーレフト。', 'https://spdx.org/licenses/LGPL-2.1-only.html'),
  ('lgpl-3.0', 'LGPL-3.0-only', '{LGPL-3.0,LGPL-3.0-or-later}', 'GNU LGPL v3.0', 'osi', 'weak',
   'ライブラリ自体を改変して配布する場合は公開が必要だが、ライブラリを利用するアプリ側には原則及ばない弱いコピーレフト。', 'https://spdx.org/licenses/LGPL-3.0-only.html'),
  ('epl-2.0', 'EPL-2.0', '{}', 'Eclipse Public License 2.0', 'osi', 'weak',
   '改変したモジュールを配布する場合にソース公開が必要な、弱いコピーレフト。', 'https://spdx.org/licenses/EPL-2.0.html'),
  ('gpl-2.0', 'GPL-2.0-only', '{GPL-2.0,GPL-2.0-or-later}', 'GNU GPL v2.0', 'osi', 'strong',
   '改変物を配布する場合、全体をGPLとしてソース公開する必要がある強いコピーレフト。', 'https://spdx.org/licenses/GPL-2.0-only.html'),
  ('gpl-3.0', 'GPL-3.0-only', '{GPL-3.0,GPL-3.0-or-later}', 'GNU GPL v3.0', 'osi', 'strong',
   '改変物を配布する場合、全体をGPLとしてソース公開する必要がある強いコピーレフト。', 'https://spdx.org/licenses/GPL-3.0-only.html'),
  ('agpl-3.0', 'AGPL-3.0-only', '{AGPL-3.0,AGPL-3.0-or-later}', 'GNU AGPL v3.0', 'osi', 'network',
   'GPLの条件に加え、改変版をネットワーク越しにサービスとして提供する場合もソース公開が必要。', 'https://spdx.org/licenses/AGPL-3.0-only.html'),
  ('elastic-2.0', 'Elastic-2.0', '{}', 'Elastic License 2.0', 'source_available', null,
   'ソースは公開されているが、マネージドサービスとしての提供などが制限される。OSI承認のオープンソースライセンスではない。', 'https://spdx.org/licenses/Elastic-2.0.html'),
  ('sspl-1.0', 'SSPL-1.0', '{}', 'Server Side Public License 1.0', 'source_available', null,
   'サービスとして提供する場合、運用に使う周辺ソフトウェアまで含めたソース公開を求める。OSI承認のオープンソースライセンスではない。', 'https://spdx.org/licenses/SSPL-1.0.html'),
  ('busl-1.1', 'BUSL-1.1', '{}', 'Business Source License 1.1', 'source_available', null,
   '一定期間後にオープンソースライセンスへ移行するが、それまでは本番利用などに制限がかかる場合がある。OSI承認のオープンソースライセンスではない。', 'https://spdx.org/licenses/BUSL-1.1.html'),
  ('sustainable-use', 'Sustainable Use License', '{}', 'Sustainable Use License', 'source_available', null,
   '社内業務での利用はできるが、有償サービスとしての再提供などが制限される。OSI承認のオープンソースライセンスではない。', null);

drop view if exists public.published_alternative_directory;

alter table public.projects drop column category;

create view public.published_alternative_directory
with (security_invoker = true) as
select
  relation.id as relation_id,
  product.slug as product_slug,
  product.name as product_name,
  product.name_ja as product_name_ja,
  product.plan_name as product_plan_name,
  product.monthly_price_jpy as product_monthly_price_jpy,
  product.pricing_source_url as product_pricing_source_url,
  product.pricing_checked_at as product_pricing_checked_at,
  project.id as project_id,
  project.slug as project_slug,
  project.name as project_name,
  project.name_ja as project_name_ja,
  project.short_description_ja,
  primary_category.name_ja as category,
  primary_category.slug as category_slug,
  coalesce(project_category_slugs.slugs, '{}') as category_slugs,
  project.official_url,
  project.repository_url,
  project.license_spdx,
  license.slug as license_slug,
  license.name as license_name,
  license.kind as license_kind,
  project.primary_language,
  project.docker_available,
  project.verification_state,
  project.verified_at,
  project.source_checked_at,
  relation.migration_difficulty,
  relation.migration_summary_ja,
  relation.strengths_ja,
  relation.constraints_ja,
  relation.recommended_for_ja,
  relation.not_recommended_for_ja,
  relation.editorial_rank,
  snapshot.stars_count,
  snapshot.last_commit_at,
  snapshot.observed_at as snapshot_observed_at,
  snapshot.forks_count,
  snapshot.open_issues_count,
  snapshot.raw_payload ->> 'owner_avatar_url' as owner_avatar_url,
  snapshot.raw_payload ->> 'repository_created_at' as repository_created_at,
  snapshot.raw_payload ->> 'latest_release_tag' as latest_release_tag,
  snapshot.raw_payload ->> 'latest_release_published_at' as latest_release_published_at,
  snapshot.raw_payload -> 'topics' as topics
from public.alternative_relations relation
join public.products product on product.id = relation.product_id
join public.projects project on project.id = relation.project_id
left join lateral (
  select c.name_ja, c.slug
  from public.project_categories pc
  join public.categories c on c.id = pc.category_id
  where pc.project_id = project.id and pc.is_primary
  limit 1
) primary_category on true
left join lateral (
  select array_agg(c.slug order by pc.is_primary desc, c.sort_order, c.slug) as slugs
  from public.project_categories pc
  join public.categories c on c.id = pc.category_id
  where pc.project_id = project.id
) project_category_slugs on true
left join lateral (
  select l.slug, l.name, l.kind
  from public.licenses l
  where l.identifier = project.license_spdx or project.license_spdx = any(l.aliases)
  limit 1
) license on true
left join lateral (
  select *
  from public.project_snapshots
  where project_id = project.id
  order by observed_at desc
  limit 1
) snapshot on true
where product.publication_state = 'published'
  and project.publication_state = 'published'
  and relation.relation_state = 'verified';

alter table public.categories enable row level security;
alter table public.project_categories enable row level security;
alter table public.licenses enable row level security;

create policy "categories readable" on public.categories for select using (true);
create policy "published project categories readable" on public.project_categories for select
  using (exists (select 1 from public.projects p where p.id = project_id and p.publication_state = 'published'));
create policy "licenses readable" on public.licenses for select using (true);

grant select on public.categories, public.project_categories, public.licenses to anon, authenticated;
grant select on public.published_alternative_directory to anon, authenticated;

commit;
