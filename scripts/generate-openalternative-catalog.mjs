import fs from "node:fs";

const SOURCE =
  "https://raw.githubusercontent.com/piotrkulpinski/open-source-alternatives/main/README.md";

const res = await fetch(SOURCE, {
  headers: { "User-Agent": "ossalt-next-catalog-generator" },
});
if (!res.ok) throw new Error(`Failed to fetch upstream README: ${res.status}`);

const markdown = await res.text();
const lines = markdown.split(/\r?\n/);

const excluded = new Set(["Sponsors", "Contents", "Contributing", "Footnotes"]);
const majors = new Map();
let major = null;
let sub = null;

for (const line of lines) {
  if (line.startsWith("## ")) {
    const title = line.slice(3).trim();
    major = excluded.has(title) ? null : title;
    sub = null;
    if (major && !majors.has(major)) majors.set(major, new Map());
    continue;
  }

  if (line.startsWith("### ")) {
    if (!major) continue;
    sub = line.slice(4).trim();
    const subMap = majors.get(major);
    if (!subMap.has(sub)) subMap.set(sub, []);
    continue;
  }

  if (!major || !sub || !line.startsWith("- ")) continue;

  const match = line.match(
    /^-\s+(?:\*\*)?\[([^\]]+)\]\((https:\/\/openalternative\.co\/[^)]+)\)(?:\*\*)?\s+-\s+(.+)$/,
  );
  if (!match) continue;

  const [, rawName, sourceUrl, tail] = match;
  const hints = [...tail.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());

  majors.get(major).get(sub).push({
    name: rawName.trim(),
    sourceUrl,
    license: hints.find((hint) => !hint.startsWith("⭐")) ?? null,
    stars: hints.find((hint) => hint.startsWith("⭐"))?.replace(/^⭐\s*/, "") ?? null,
  });
}

const unique = new Set();
let listed = 0;
for (const subMap of majors.values()) {
  for (const items of subMap.values()) {
    for (const item of items) {
      listed += 1;
      unique.add(item.sourceUrl);
    }
  }
}

const anchor = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");

let out = `# OpenAlternative Candidate Catalog

OpenAlternative の公開 README を、ossalt の候補レビュー用に整理したカタログです。

- Source: ${SOURCE}
- Major categories: **${majors.size}**
- Listed entries: **${listed}**
- Unique projects: **${unique.size}**

> 候補探索用の一覧です。ossalt 本体へ掲載する前に、公式情報・ライセンス・代替関係・移行上の注意を個別レビューします。

## Contents

`;

for (const [majorTitle, subMap] of majors) {
  out += `- [${majorTitle}](#${anchor(majorTitle)})\n`;
  for (const subTitle of subMap.keys()) {
    out += `  - [${subTitle}](#${anchor(subTitle)})\n`;
  }
}

out += "\n";

for (const [majorTitle, subMap] of majors) {
  out += `## ${majorTitle}\n\n`;

  for (const [subTitle, items] of subMap) {
    out += `### ${subTitle}\n\n`;

    const sorted = [...items].sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
    );

    for (const item of sorted) {
      const license = item.license ? ` · \`${item.license}\`` : "";
      const stars = item.stars ? ` · ⭐ ${item.stars}` : "";
      out += `- [${item.name}](${item.sourceUrl})${license}${stars}\n`;
    }

    out += "\n";
  }
}

out += `---\n\nGenerated from the upstream public README for candidate discovery. Project descriptions are intentionally omitted.\n`;

const output = new URL("../docs/openalternative-catalog.md", import.meta.url);
fs.mkdirSync(new URL("../docs/", import.meta.url), { recursive: true });
fs.writeFileSync(output, out);

console.log(
  `Generated ${listed} entries across ${majors.size} major categories (${unique.size} unique projects).`,
);
