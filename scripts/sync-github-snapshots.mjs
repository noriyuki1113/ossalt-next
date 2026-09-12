import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const githubToken = process.env.GITHUB_TOKEN;

if (!supabaseUrl || !serviceRole) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function parseGithubRepo(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const [owner, repo] = parsed.pathname.replace(/^\/+|\/+$/g, "").split("/");
    if (!owner || !repo) return null;
    return { owner, repo: repo.replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "ossalt-snapshot-sync",
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status} for ${path}: ${body.slice(0, 300)}`);
  }
  return response.json();
}

const { data: projects, error } = await supabase
  .from("projects")
  .select("id,name,repository_url")
  .eq("publication_state", "published")
  .not("repository_url", "is", null)
  .order("name");

if (error) throw error;

let inserted = 0;
let skipped = 0;
let failed = 0;

for (const project of projects ?? []) {
  const repo = parseGithubRepo(project.repository_url);
  if (!repo) {
    skipped += 1;
    console.log(`Skip non-GitHub repository: ${project.name}`);
    continue;
  }

  try {
    const metadata = await github(`/repos/${repo.owner}/${repo.repo}`);
    let lastCommitAt = metadata.pushed_at ?? null;
    let latestRelease = null;

    try {
      latestRelease = await github(`/repos/${repo.owner}/${repo.repo}/releases/latest`);
    } catch {
      latestRelease = null;
    }

    try {
      const commits = await github(`/repos/${repo.owner}/${repo.repo}/commits?per_page=1`);
      lastCommitAt = commits?.[0]?.commit?.committer?.date ?? commits?.[0]?.commit?.author?.date ?? lastCommitAt;
    } catch (commitError) {
      console.warn(`Could not fetch latest commit for ${repo.owner}/${repo.repo}: ${commitError.message}`);
    }

    const observedAt = new Date().toISOString();
    const { error: insertError } = await supabase.from("project_snapshots").insert({
      project_id: project.id,
      observed_at: observedAt,
      stars_count: metadata.stargazers_count ?? null,
      forks_count: metadata.forks_count ?? null,
      open_issues_count: metadata.open_issues_count ?? null,
      last_commit_at: lastCommitAt,
      source_url: metadata.html_url ?? project.repository_url,
      raw_payload: {
        archived: metadata.archived ?? null,
        default_branch: metadata.default_branch ?? null,
        pushed_at: metadata.pushed_at ?? null,
        updated_at: metadata.updated_at ?? null,
        owner_avatar_url: metadata.owner?.avatar_url ?? null,
        homepage: metadata.homepage ?? null,
        repository_created_at: metadata.created_at ?? null,
        repository_updated_at: metadata.updated_at ?? null,
        watchers_count: metadata.subscribers_count ?? metadata.watchers_count ?? null,
        topics: metadata.topics ?? [],
        latest_release_tag: latestRelease?.tag_name ?? null,
        latest_release_name: latestRelease?.name ?? null,
        latest_release_published_at: latestRelease?.published_at ?? null,
      },
    });

    if (insertError) throw insertError;
    inserted += 1;
    console.log(`Synced ${project.name}: ★${metadata.stargazers_count ?? 0}, forks ${metadata.forks_count ?? 0}`);
  } catch (syncError) {
    failed += 1;
    console.error(`Failed ${project.name}: ${syncError.message}`);
  }
}

console.log(`GitHub snapshot sync complete. inserted=${inserted} skipped=${skipped} failed=${failed}`);
if (failed > 0) process.exitCode = 1;
