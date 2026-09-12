-- Allow the browser client to read only the public directory contract.
-- The view is security_invoker, therefore the underlying RLS policies still apply.
grant select on public.published_alternative_directory to anon, authenticated;
