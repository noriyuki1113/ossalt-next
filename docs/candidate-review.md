# Candidate review workflow

Imported OpenAlternative records are staging-only. They remain in `public.import_candidates` behind RLS until a reviewer explicitly approves or rejects them.

## Review queue

Open **Actions → Review imported candidates → Run workflow**, choose `queue`, and run it. The job summary shows up to 30 oldest pending candidates with IDs and source links.

## Approve

Before approving, independently verify the project's official site, official repository, license (if supplied), and that it is a reasonable alternative for an existing SaaS product.

Run the same workflow with `approve` and provide:

- candidate UUID
- existing product slug
- project slug
- official URL
- repository URL
- SPDX license if verified
- reviewed Japanese short description
- reviewed Japanese migration note
- migration difficulty from 1 to 5

Approval publishes/updates the project, creates a verified alternative relation, records official-site/repository evidence, and marks the staging candidate as `enriched`.

The project's primary category is set from the candidate's OpenAlternative subcategory (e.g. `CRM & Sales`) by matching it against `public.categories.aliases`. If nothing matches, the project is left uncategorized and the job logs a warning — add the English name to the right category's `aliases` (or link the project in `public.project_categories` directly) and it will be picked up.

## Reject

Run with `reject` and the candidate UUID. The candidate is marked `rejected` with reviewer and timestamp.

## Security

`SUPABASE_SERVICE_ROLE_KEY` is only consumed by GitHub Actions in the protected `production` environment. It is never exposed to Vite/browser code. Public users can only read records allowed by existing RLS policies and the published directory view.
