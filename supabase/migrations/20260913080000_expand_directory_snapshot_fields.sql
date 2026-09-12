begin;

drop view if exists public.published_alternative_directory;

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
  select *
  from public.project_snapshots
  where project_id = project.id
  order by observed_at desc
  limit 1
) snapshot on true
where product.publication_state = 'published'
  and project.publication_state = 'published'
  and relation.relation_state = 'verified';

grant select on public.published_alternative_directory to anon, authenticated;

commit;
