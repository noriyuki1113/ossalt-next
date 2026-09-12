-- Staging table for candidates discovered from curated external lists.
-- Rows here are deliberately NOT visible to site visitors.
-- Only a separately reviewed record may be promoted to projects + alternative_relations.

create type public.candidate_import_state as enum ('pending', 'enriched', 'rejected');

create table public.import_candidates (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text not null,
  source_slug text not null,
  category_path text[] not null default '{}',
  name text not null,
  description text,
  license_hint text,
  stars_hint text,
  import_state public.candidate_import_state not null default 'pending',
  imported_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  project_id uuid references public.projects(id) on delete set null,
  unique (source_name, source_slug)
);

create index import_candidates_state_idx
  on public.import_candidates (import_state, imported_at desc);

alter table public.import_candidates enable row level security;

comment on table public.import_candidates is
  'Non-public source candidates awaiting official-source verification and editorial review.';
