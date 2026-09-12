-- ossalt-next: initial database for the OSS migration navigator
create extension if not exists pgcrypto;

create type public.publication_state as enum ('draft', 'published', 'archived');
create type public.verification_state as enum ('unverified', 'reviewing', 'verified', 'needs_review');
create type public.relation_state as enum ('candidate', 'verified', 'rejected');
create type public.evidence_kind as enum ('official_site', 'official_docs', 'official_repository', 'license', 'release_note', 'security_score', 'editorial_note');
create type public.decision_event_name as enum ('search_submitted', 'alternative_opened', 'tool_opened', 'official_link_opened', 'github_link_opened', 'compare_opened', 'guide_opened', 'newsletter_submitted', 'sponsor_opened');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  name_ja text,
  website_url text,
  category text,
  description_ja text,
  migration_summary_ja text,
  publication_state public.publication_state not null default 'draft',
  source_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  name_ja text,
  short_description_ja text,
  category text,
  official_url text,
  repository_url text,
  license_spdx text,
  primary_language text,
  docker_available boolean,
  publication_state public.publication_state not null default 'draft',
  verification_state public.verification_state not null default 'unverified',
  verified_at timestamptz,
  verified_by text,
  source_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index projects_repository_url_unique on public.projects(repository_url) where repository_url is not null;

create table public.alternative_relations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  relation_state public.relation_state not null default 'candidate',
  migration_difficulty smallint check (migration_difficulty between 1 and 5),
  migration_summary_ja text,
  strengths_ja jsonb not null default '[]'::jsonb,
  constraints_ja jsonb not null default '[]'::jsonb,
  recommended_for_ja jsonb not null default '[]'::jsonb,
  not_recommended_for_ja jsonb not null default '[]'::jsonb,
  editorial_rank integer check (editorial_rank is null or editorial_rank > 0),
  source_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, project_id)
);
create index alternative_relations_product_idx on public.alternative_relations(product_id, relation_state, editorial_rank);

create table public.evidence_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  relation_id uuid references public.alternative_relations(id) on delete cascade,
  kind public.evidence_kind not null,
  label text not null,
  url text not null,
  observed_at timestamptz not null default now(),
  expires_at timestamptz,
  note_ja text,
  created_at timestamptz not null default now(),
  check(num_nonnulls(project_id, product_id, relation_id) = 1)
);
create index evidence_sources_lookup_idx on public.evidence_sources(project_id, product_id, relation_id, kind);

create table public.project_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  observed_at timestamptz not null default now(),
  stars_count integer check(stars_count is null or stars_count >= 0),
  forks_count integer check(forks_count is null or forks_count >= 0),
  open_issues_count integer check(open_issues_count is null or open_issues_count >= 0),
  last_commit_at timestamptz,
  scorecard_score numeric(4,2) check(scorecard_score is null or scorecard_score between 0 and 10),
  source_url text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  unique(project_id, observed_at)
);
create index project_snapshots_latest_idx on public.project_snapshots(project_id, observed_at desc);

-- Paid placements are structurally separate from editorial records.
create table public.sponsor_placements (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  destination_url text not null,
  placement_kind text not null check(placement_kind in ('category', 'guide', 'related_service', 'newsletter')),
  target_key text,
  disclosure_label text not null default 'スポンサー',
  starts_at timestamptz not null,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.decision_events (
  id uuid primary key default gen_random_uuid(),
  event_name public.decision_event_name not null,
  occurred_at timestamptz not null default now(),
  product_id uuid references public.products(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  relation_id uuid references public.alternative_relations(id) on delete set null,
  sponsor_placement_id uuid references public.sponsor_placements(id) on delete set null,
  session_hash text,
  referrer_host text,
  metadata jsonb not null default '{}'::jsonb
);
create index decision_events_analysis_idx on public.decision_events(event_name, occurred_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger relations_updated_at before update on public.alternative_relations for each row execute function public.set_updated_at();
create trigger placements_updated_at before update on public.sponsor_placements for each row execute function public.set_updated_at();

create view public.published_alternative_directory
with (security_invoker = true) as
select
  relation.id as relation_id,
  product.slug as product_slug,
  product.name as product_name,
  product.name_ja as product_name_ja,
  project.id as project_id,
  project.slug as project_slug,
  project.name as project_name,
  project.name_ja as project_name_ja,
  project.short_description_ja,
  project.category,
  project.official_url,
  project.repository_url,
  project.license_spdx,
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
  snapshot.observed_at as snapshot_observed_at
from public.alternative_relations relation
join public.products product on product.id = relation.product_id
join public.projects project on project.id = relation.project_id
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

alter table public.products enable row level security;
alter table public.projects enable row level security;
alter table public.alternative_relations enable row level security;
alter table public.evidence_sources enable row level security;
alter table public.project_snapshots enable row level security;
alter table public.sponsor_placements enable row level security;
alter table public.decision_events enable row level security;

create policy "published products readable" on public.products for select using(publication_state = 'published');
create policy "published projects readable" on public.projects for select using(publication_state = 'published');
create policy "verified relations readable" on public.alternative_relations for select using(relation_state = 'verified');
create policy "published snapshots readable" on public.project_snapshots for select using(exists(select 1 from public.projects p where p.id = project_id and p.publication_state = 'published'));
create policy "active placements readable" on public.sponsor_placements for select using(is_active and starts_at <= now() and (ends_at is null or ends_at > now()));

-- Analytics is public write-only. All editorial writes use the service role in a server-side job or Edge Function.
create policy "public event insert" on public.decision_events for insert with check(event_name is not null);
