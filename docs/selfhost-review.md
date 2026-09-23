# Self-host guide draft — review checklist

Generated for `supabase/seed/selfhost_guides_draft.sql`. All rows are `status='draft'`;
nothing here is public until you flip a row to `published` after checking it.

## What this environment could and couldn't verify

- **Reachable**: `raw.githubusercontent.com` (repo README/compose file contents).
- **Blocked**: `api.github.com`, `github.com` itself, and every VPS provider site
  (xserver.ne.jp, conoha.jp, sakura.ad.jp), plus most project docs domains
  (supabase.com, docs.langflow.org, docs.twenty.com, mautic.org, n8n.io, …).

Two consequences, per your decisions:

1. **No GitHub star counts** — the list below is *not* ranked by stars. It's in the
   same order as `data/reviewed-candidates.json`. Re-order before publishing if star
   rank matters.
2. **`method` is `docker_compose` for all 14 rows** — no VPS provider's startup-script
   template offering was checked (their sites are unreachable from here), so nothing
   was set to `startup_script`, per your instruction to default to `docker_compose`
   rather than guess.

## Candidates excluded (and why)

| Slug | Reason |
|---|---|
| `dify` | `license_spdx` is already `null` in `data/reviewed-candidates.json` — not confirmed OSS |
| `cal-com` | same — `license_spdx` is `null` |
| `metabase` | same — `license_spdx` is `null` |
| `letta` | **Data-quality finding, not just a self-host issue**: `letta-ai/letta`'s own README says the active codebase moved to `letta-ai/letta-code`, and the old API server is now on an `archive` branch. Your existing catalog entry for `letta` points at the retired repo — worth checking whether `projects`/`data/reviewed-candidates.json` needs updating independent of this guide work. |
| `mautic` | No official Docker image or compose file found in `mautic/mautic`, and `mautic.org` (where their self-host docs presumably live) is unreachable from here to check further |

## Included — 14 rows, 要確認 column flags weak sourcing

| Slug | License | source_url | 要確認 |
|---|---|---|---|
| librechat | MIT | [docker-compose.yml](https://github.com/danny-avila/LibreChat/blob/main/docker-compose.yml) | — |
| bytechef | Apache-2.0 | [docker-compose.yml](https://github.com/bytechefhq/bytechef/blob/master/docker-compose.yml) | — |
| langflow | MIT | [README.md](https://github.com/langflow-ai/langflow/blob/master/README.md) | **Yes** — no official compose file, only a `docker run` command with the official `langflowai/langflow` image; the compose.yml in steps_md is one I wrote around it, not something the project ships |
| activepieces | MIT | [docker-compose.yml](https://github.com/activepieces/activepieces/blob/main/docker-compose.yml) | — |
| formbricks | AGPL-3.0 | [docker/README.md](https://github.com/formbricks/formbricks/blob/master/docker/README.md) | — |
| twenty | AGPL-3.0 | [docker-compose.yml](https://github.com/twentyhq/twenty/blob/master/packages/twenty-docker/docker-compose.yml) | — |
| plane | AGPL-3.0 | [docker-compose.yml](https://github.com/makeplane/plane/blob/preview/docker-compose.yml) | **Yes** — default branch is `preview`, not `main`/`master`; double-check that's still current before publishing |
| umami | MIT | [docker-compose.yml](https://github.com/umami-software/umami/blob/master/docker-compose.yml) | — |
| plausible | AGPL-3.0 | [README.md](https://github.com/plausible/community-edition/blob/master/README.md) | **Yes** — the real self-host packaging lives in `plausible/community-edition`, a *different* repo from `plausible/analytics` (the one in `data/reviewed-candidates.json`). Only entry with a stated memory requirement: "at least 2 GB of RAM is recommended" (for ClickHouse). |
| supabase | Apache-2.0 | [docker/README.md](https://github.com/supabase/supabase/blob/master/docker/README.md) | **Yes** — the in-repo doc defers full setup detail to `supabase.com/docs/guides/self-hosting/docker`, which was unreachable from here to check |
| appwrite | BSD-3-Clause | [docker-compose.yml](https://github.com/appwrite/appwrite/blob/main/docker-compose.yml) | — |
| immich | AGPL-3.0 | [docker/README.md](https://github.com/immich-app/immich/blob/master/docker/README.md) | — (this doc explicitly warns to use the versioned release's compose file, not the branch HEAD one — steps_md reflects that) |
| jellyfin | GPL-2.0 | [README.md](https://github.com/jellyfin/jellyfin/blob/master/README.md) | **Yes** — same situation as langflow: official Docker Hub image (`jellyfin/jellyfin`), no official compose file |
| listmonk | AGPL-3.0 | [docker-compose.yml](https://github.com/knadh/listmonk/blob/master/docker-compose.yml) | — |

## Before publishing any row

1. Seed `vps_providers` with a real `xserver-vps` row if it doesn't already exist —
   the seed script depends on it and silently inserts nothing if that provider is
   missing (see the comment header in the seed file).
2. Confirm each of these 14 slugs actually exists in the live `projects` table —
   they weren't in this repo's own migration seed data, so they may still be sitting
   in the import/review pipeline (`docs/candidate-review.md`) rather than published.
3. For the 5 rows flagged 要確認 above, look them over by hand before flipping
   `status` to `published`.
4. None of this was tested against a real VPS — steps are grounded in each project's
   own docs, not hands-on verification on `xserver-vps`.
