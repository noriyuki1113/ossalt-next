-- Real vps_providers data, confirmed directly by the site owner (not fetched — VPS
-- provider sites are unreachable from the environment this was authored in).
-- Upsert on slug so re-running this after a price update is safe.

insert into public.vps_providers
  (slug, name, affiliate_url, official_url, min_monthly_jpy, pricing_checked_at, is_active)
values
  ('xserver-vps', 'Xserver VPS', null, 'https://vps.xserver.ne.jp/', 968, date '2026-09-23', true)
on conflict (slug) do update set
  name = excluded.name,
  affiliate_url = excluded.affiliate_url,
  official_url = excluded.official_url,
  min_monthly_jpy = excluded.min_monthly_jpy,
  pricing_checked_at = excluded.pricing_checked_at,
  is_active = excluded.is_active;
