import fs from "node:fs";

const SOURCE =
  "https://raw.githubusercontent.com/piotrkulpinski/open-source-alternatives/main/README.md";
const OUTPUT = new URL("../docs/openalternative-catalog.md", import.meta.url);

const response = await fetch(SOURCE);
if (!response.ok) {
  throw new Error(`Failed to fetch upstream README: ${response.status}`);
}

const markdown = await response.text();
const lines = markdown.split("\n");
const excluded = new Set(["Sponsors", "Contents", "Contributing", "Footnotes"]);

const sections = [];
let currentMajor = null;
let currentSub = null;

for (const line of lines) {
  if (line.startsWith("## ")) {
    const title = line.slice(3).trim();
    currentMajor = excluded.has(title) ? null : title;
    currentSub = null;
    if (currentMajor) sections.push({ level: 2, title: currentMajor, parent: null, items: [] });
    continue;
  }

  if (line.startsWith("### ")) {
    if (!currentMajor) continue;
    currentSub = line.slice(4).trim();
    sections.push({ level: 3, title: currentSub, parent: currentMajor, items: [] });
    continue;
  }

  if (!currentMajor || !line.startsWith("- ")) continue;

  const match = line.match(
    /^- \*{0,2}\[([^\]]+)\]\((https?:\/\/[^)]+)\)\*{0,2}\s*-\s*(.*)$/,
  );
  if (!match) continue;

  const [, rawName, url, rest] = match;
  const licenseMatch = rest.match(
    /`([^`]*?(?:MIT|GPL|AGPL|Apache|BSD|MPL|Elastic|SSPL|FSL|ISC|Unlicense|other)[^`]*)`/i,
  );
  const starsMatch = rest.match(/`⭐\s*([^`]+)`/);

  const item = {
    name: rawName.trim(),
    url,
    license: licenseMatch?.[1]?.trim() ?? null,
    stars: starsMatch?.[1]?.trim() ?? null,
  };

  const target =
    currentSub
      ? [...sections].reverse().find((section) => section.level === 3 && section.title === currentSub && section.parent === currentMajor)
      : [...sections].reverse().find((section) => section.level === 2 && section.title === currentMajor);

  target?.items.push(item);
}

const majorSections = sections.filter((section) => section.level === 2);
const subSections = sections.filter((section) => section.level === 3);
const uniqueProjects = new Set(sections.flatMap((section) => section.items.map((item) => item.name)));
const listedEntries = sections.reduce((sum, section) => sum + section.items.length, 0);

const anchor = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");

let output = `# OpenAlternative Full Catalog

OpenAlternative の公開 README を、ossalt の候補レビュー用に整理したカタログです。

- Source: ${SOURCE}
- Major categories: **${majorSections.length}**
- Subcategories: **${subSections.length}**
- Listed entries: **${listedEntries}**
- Unique project names: **${uniqueProjects.size}**

> 同じOSSが複数カテゴリに掲載される場合は、そのカテゴリごとに残します。説明文は転載せず、候補名・掲載先・ライセンス・Starsなどの事実情報だけを整理します。

## Contents

`;

for (const major of majorSections) {
  output += `- [${major.title}](#${anchor(major.title)})\n`;
  for (const sub of subSections.filter((section) => section.parent === major.title)) {
    output += `  - [${sub.title}](#${anchor(sub.title)})\n`;
  }
}

output += "\n";

for (const major of majorSections) {
  output += `## ${major.title}\n\n`;

  for (const item of major.items) {
    output += `- [${item.name}](${item.url})${item.license ? ` · \`${item.license}\`` : ""}${item.stars ? ` · ⭐ ${item.stars}` : ""}\n`;
  }

  if (major.items.length) output += "\n";

  for (const sub of subSections.filter((section) => section.parent === major.title)) {
    output += `### ${sub.title}\n\n`;

    for (const item of sub.items) {
      output += `- [${item.name}](${item.url})${item.license ? ` · \`${item.license}\`` : ""}${item.stars ? ` · ⭐ ${item.stars}` : ""}\n`;
    }

    output += "\n";
  }
}

output += `---\n\nGenerated from the upstream README for candidate discovery. Review official sources before publishing a project on ossalt.\n`;

fs.writeFileSync(OUTPUT, output);
console.log(
  `Generated OpenAlternative catalog: ${listedEntries} entries / ${uniqueProjects.size} unique names / ${subSections.length} subcategories`,
);
