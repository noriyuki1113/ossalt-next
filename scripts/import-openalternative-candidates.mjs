import { createClient } from "@supabase/supabase-js";

const SOURCE_NAME = "openalternative-awesome-list";
const SOURCE_README_URL =
  "https://raw.githubusercontent.com/piotrkulpinski/open-source-alternatives/main/README.md";

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function stripMarkdown(value) {
  return value
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function toSlug(sourceUrl) {
  return new URL(sourceUrl).pathname.replace(/^\/+|\/+$/g, "");
}

function parseReadme(markdown) {
  const records = [];
  let category = [];

  for (const rawLine of markdown.split(/\r?\n/)) {
    if (rawLine.startsWith("## ")) {
      const heading = stripMarkdown(rawLine.slice(3));
      if (heading !== "Sponsors" && heading !== "Contents") category = [heading];
      continue;
    }

    if (rawLine.startsWith("### ")) {
      const heading = stripMarkdown(rawLine.slice(4));
      category = [category[0] || "Other", heading];
      continue;
    }

    const match = rawLine.match(
      /^-\s+(?:\*\*)?\[([^\]]+)\]\((https:\/\/openalternative\.co\/[^)]+)\)(?:\*\*)?\s+-\s+(.+)$/,
    );

    if (!match || category.length === 0) continue;

    const [, name, sourceUrl, remainder] = match;
    const hints = [...remainder.matchAll(/\`([^\`]+)\`/g)].map((item) => item[1].trim());
    const description = stripMarkdown(remainder.replace(/\s*\`[^\`]+\`/g, ""));

    records.push({
      source_name: SOURCE_NAME,
      source_url: sourceUrl,
      source_slug: toSlug(sourceUrl),
      category_path: category,
      name: stripMarkdown(name),
      description: description || null,
      license_hint: hints.find((hint) => !hint.startsWith("⭐")) || null,
      stars_hint: hints.find((hint) => hint.startsWith("⭐"))?.replace(/^⭐\s*/, "") || null,
      import_state: "pending",
    });
  }

  return [...new Map(records.map((item) => [
    `${item.source_name}:${item.source_slug}`,
    item,
  ])).values()];
}

const response = await fetch(SOURCE_README_URL, {
  headers: { "User-Agent": "ossalt-next-candidate-importer" },
});

if (!response.ok) {
  throw new Error(`Could not download source list: ${response.status} ${response.statusText}`);
}

const candidates = parseReadme(await response.text());

if (!candidates.length) {
  throw new Error("No candidates could be parsed; the upstream format may have changed.");
}

for (let start = 0; start < candidates.length; start += 100) {
  const batch = candidates.slice(start, start + 100);
  const { error } = await supabase
    .from("import_candidates")
    .upsert(batch, { onConflict: "source_name,source_slug" });

  if (error) throw error;
}

console.log(`Imported or refreshed ${candidates.length} private candidates from OpenAlternative.`);
