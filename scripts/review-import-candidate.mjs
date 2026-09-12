import { appendFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const requiredBase = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missingBase = requiredBase.filter((key) => !process.env[key]);
if (missingBase.length) {
  throw new Error(`Missing required environment variable(s): ${missingBase.join(", ")}`);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const operation = (process.env.REVIEW_OPERATION || "queue").trim();
const reviewer = (process.env.REVIEWER || "github-actions").trim();

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required input: ${name}`);
  return value;
}

function optional(name) {
  const value = process.env[name]?.trim();
  return value || null;
}

function assertSlug(value, label) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error(`${label} must be a lowercase kebab-case slug.`);
  }
}

function assertHttps(value, label) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error(`${label} must use https://`);
}

async function writeSummary(markdown) {
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
  }
}

async function withRetry(label, operation, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await operation();
      if (!result?.error) return result;
      lastError = result.error;
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts) {
      const delayMs = 1500 * attempt;
      console.warn(`${label} failed on attempt ${attempt}/${attempts}; retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

async function queue() {
  const { data } = await withRetry("Load review queue", () =>
    supabase
      .from("import_candidates")
      .select("id,name,description,source_url,source_slug,category_path,license_hint,stars_hint,imported_at")
      .eq("import_state", "pending")
      .order("imported_at", { ascending: true })
      .limit(20),
  );

  console.log(`Pending review candidates shown: ${data.length}`);
  for (const row of data) {
    console.log(`${row.id} | ${row.name} | ${row.source_url}`);
  }

  const rows = data.map((row) => {
    const category = Array.isArray(row.category_path) ? row.category_path.join(" / ") : "";
    const description = (row.description || "").replace(/\|/g, "\\|").slice(0, 140);
    return `| \`${row.id}\` | ${row.name.replace(/\|/g, "\\|")} | ${category.replace(/\|/g, "\\|")} | ${description} | [source](${row.source_url}) |`;
  }).join("\n");

  await writeSummary(
    `## Pending candidate review queue\n\nShowing the oldest ${data.length} pending candidates.\n\n| Candidate ID | Name | Category | Description | Source |\n|---|---|---|---|---|\n${rows}\n`,
  );
}

async function reject() {
  const candidateId = required("CANDIDATE_ID");
  const { data, error } = await supabase
    .from("import_candidates")
    .update({
      import_state: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewer,
    })
    .eq("id", candidateId)
    .select("id,name")
    .single();

  if (error) throw error;
  console.log(`Rejected candidate: ${data.name} (${data.id})`);
  await writeSummary(`## Candidate rejected\n\n- **Name:** ${data.name}\n- **Candidate ID:** \`${data.id}\`\n- **Reviewer:** ${reviewer}\n`);
}

async function approve() {
  const candidateId = required("CANDIDATE_ID");
  const productSlug = required("PRODUCT_SLUG");
  const projectSlug = required("PROJECT_SLUG");
  const officialUrl = required("OFFICIAL_URL");
  const repositoryUrl = required("REPOSITORY_URL");
  const shortDescriptionJa = required("SHORT_DESCRIPTION_JA");
  const migrationSummaryJa = required("MIGRATION_SUMMARY_JA");
  const difficulty = Number(required("MIGRATION_DIFFICULTY"));
  const licenseSpdx = optional("LICENSE_SPDX");

  assertSlug(productSlug, "PRODUCT_SLUG");
  assertSlug(projectSlug, "PROJECT_SLUG");
  assertHttps(officialUrl, "OFFICIAL_URL");
  assertHttps(repositoryUrl, "REPOSITORY_URL");
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
    throw new Error("MIGRATION_DIFFICULTY must be an integer from 1 to 5.");
  }

  const { data: candidate, error: candidateError } = await supabase
    .from("import_candidates")
    .select("*")
    .eq("id", candidateId)
    .single();
  if (candidateError) throw candidateError;
  if (candidate.import_state === "rejected") {
    throw new Error("Rejected candidates cannot be approved without first resetting their state.");
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,slug,name")
    .eq("slug", productSlug)
    .single();
  if (productError) throw new Error(`Product slug "${productSlug}" was not found. Create/review the SaaS product first.`);

  const now = new Date().toISOString();
  const category = Array.isArray(candidate.category_path) && candidate.category_path.length
    ? candidate.category_path[candidate.category_path.length - 1]
    : null;

  const projectPayload = {
    slug: projectSlug,
    name: candidate.name,
    short_description_ja: shortDescriptionJa,
    category,
    official_url: officialUrl,
    repository_url: repositoryUrl,
    license_spdx: licenseSpdx,
    publication_state: "published",
    verification_state: "verified",
    verified_at: now,
    verified_by: reviewer,
    source_checked_at: now,
  };

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .upsert(projectPayload, { onConflict: "slug" })
    .select("id,slug,name")
    .single();
  if (projectError) throw projectError;

  const { data: relation, error: relationError } = await supabase
    .from("alternative_relations")
    .upsert({
      product_id: product.id,
      project_id: project.id,
      relation_state: "verified",
      migration_difficulty: difficulty,
      migration_summary_ja: migrationSummaryJa,
      source_checked_at: now,
    }, { onConflict: "product_id,project_id" })
    .select("id")
    .single();
  if (relationError) throw relationError;

  const evidence = [
    { project_id: project.id, kind: "official_site", label: `${project.name} 公式サイト`, url: officialUrl, note_ja: "公開前レビューで確認" },
    { project_id: project.id, kind: "official_repository", label: `${project.name} GitHub`, url: repositoryUrl, note_ja: "公開前レビューで確認" },
  ];
  for (const item of evidence) {
    const { data: existing, error: findError } = await supabase
      .from("evidence_sources")
      .select("id")
      .eq("project_id", project.id)
      .eq("kind", item.kind)
      .eq("url", item.url)
      .maybeSingle();
    if (findError) throw findError;
    if (!existing) {
      const { error: evidenceError } = await supabase.from("evidence_sources").insert(item);
      if (evidenceError) throw evidenceError;
    }
  }

  const { error: candidateUpdateError } = await supabase
    .from("import_candidates")
    .update({
      import_state: "enriched",
      reviewed_at: now,
      reviewed_by: reviewer,
      project_id: project.id,
    })
    .eq("id", candidate.id);
  if (candidateUpdateError) throw candidateUpdateError;

  console.log(`Approved and published: ${candidate.name} as alternative for ${product.name}`);
  await writeSummary(
    `## Candidate approved and published\n\n- **Project:** ${project.name} (\`${project.slug}\`)\n- **Alternative for:** ${product.name} (\`${product.slug}\`)\n- **Candidate ID:** \`${candidate.id}\`\n- **Relation ID:** \`${relation.id}\`\n- **Reviewer:** ${reviewer}\n- **Official URL:** ${officialUrl}\n- **Repository:** ${repositoryUrl}\n`,
  );
}

if (operation === "queue") await queue();
else if (operation === "approve") await approve();
else if (operation === "reject") await reject();
else throw new Error(`Unknown REVIEW_OPERATION: ${operation}`);
