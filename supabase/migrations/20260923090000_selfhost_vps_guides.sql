-- Self-hosting on domestic (Japan) VPS providers: affiliate-linked how-to guides.
-- Kept structurally separate from editorial ranking (alternative_relations, editorial_rank):
-- provider order is fixed by price (min_monthly_jpy asc), never by payout, and nothing here
-- feeds alternative_relations.editorial_rank or verification_state.
begin;

create table public.vps_providers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  affiliate_url text,
  official_url text not null,
  min_monthly_jpy integer not null check (min_monthly_jpy >= 0),
  pricing_checked_at date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- tool_id references public.projects, the existing "OSS tool" entity (there is no
-- separate `tools` table in this schema) — see each project's /projects/:slug page.
create table public.tool_selfhost_guides (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.projects(id) on delete cascade,
  provider_id uuid not null references public.vps_providers(id) on delete cascade,
  method text not null check (method in ('startup_script', 'docker_compose', 'manual')),
  recommended_memory_gb numeric(5, 1) not null check (recommended_memory_gb > 0),
  steps_md text not null,
  source_url text not null,
  verified_at date not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tool_id, provider_id)
);
create index tool_selfhost_guides_tool_idx on public.tool_selfhost_guides(tool_id, status);

-- Click-through analytics only. No personal data (no IP, no user id, no user agent).
create table public.outbound_clicks (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid references public.projects(id) on delete set null,
  provider_id uuid references public.vps_providers(id) on delete set null,
  page_path text not null,
  created_at timestamptz not null default now()
);
create index outbound_clicks_created_idx on public.outbound_clicks(created_at desc);
create index outbound_clicks_provider_idx on public.outbound_clicks(provider_id, created_at desc);

create trigger vps_providers_updated_at before update on public.vps_providers
  for each row execute function public.set_updated_at();
create trigger tool_selfhost_guides_updated_at before update on public.tool_selfhost_guides
  for each row execute function public.set_updated_at();

alter table public.vps_providers enable row level security;
alter table public.tool_selfhost_guides enable row level security;
alter table public.outbound_clicks enable row level security;

-- Readable by anon/authenticated only for active providers / published guides.
-- All writes (including the initial catalog) go through the service role.
create policy "active providers readable" on public.vps_providers
  for select using (is_active);
create policy "published guides readable" on public.tool_selfhost_guides
  for select using (status = 'published');
grant select on public.vps_providers to anon, authenticated;
grant select on public.tool_selfhost_guides to anon, authenticated;

-- outbound_clicks: intentionally no anon/authenticated policy at all (default deny).
-- Rows are written only by /api/out using the service role, which bypasses RLS.

commit;
