import fs from "node:fs";

const sourcePath = new URL("../data/reviewed-candidates.json", import.meta.url);
const readmePath = new URL("../README.md", import.meta.url);
const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const uniqueRecords = [...new Map(data.records.map((record) => [record.project.slug, record])).values()]
  .sort((a, b) =>
    a.project.category.localeCompare(b.project.category, "ja") ||
    a.project.name.localeCompare(b.project.name),
  );

const groups = new Map();
for (const record of uniqueRecords) {
  const category = record.project.category;
  if (!groups.has(category)) groups.set(category, []);
  groups.get(category).push(record);
}

const products = new Set(data.records.map((record) => record.product.slug));
const anchor = (value) =>
  value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

const toc = [...groups.keys()].map((category) => `- [${category}](#${anchor(category)})`).join("\n");
const sections = [...groups.entries()].map(([category, rows]) => {
  const lines = rows.map((record) => {
    const { project, product, relation } = record;
    const license = project.license_spdx ? ` \`${project.license_spdx}\`` : " `License要確認`";
    return `- **[${project.name}](https://ossalt-next.vercel.app/projects/${project.slug})** — ${project.short_description_ja}${license} · ${product.name} の代替 · 移行難易度 \`${relation.migration_difficulty ?? "—"}/5\` · [GitHub](${project.repository_url})`;
  }).join("\n");
  return `## ${category}\n\n${lines}`;
}).join("\n\n");

const readme = `# ossalt

**SaaSからOSSへの移行を、日本語で探し、比較し、判断するためのディレクトリ。**

[Webサイトを見る](https://ossalt-next.vercel.app) · [レビュー基準](docs/candidate-review.md)

ossalt は、単に「代替OSSを見つける」だけではなく、**移行難易度・ライセンス・セルフホスト可否・運用負担・失う機能**まで確認して、実際に乗り換えられるかを判断するためのプロジェクトです。

> 探索力は OpenAlternative のような優れたOSSディレクトリから学びつつ、ossalt は「日本語での移行判断」に重点を置いています。

## Directory

現在のレビュー済みデータ:

- **OSS:** ${uniqueRecords.length}
- **代替元SaaS:** ${products.size}
- **カテゴリ:** ${groups.size}
- **レビュー基準日:** ${data.reviewed_at}

## Contents

${toc}

${sections}

## ossalt で見るポイント

各OSSの詳細ページでは、GitHubの活動状況だけでなく、実際の導入判断に必要な情報をまとめます。

- Stars / Forks / Open Issues / Last commit / Latest release
- License / Primary language / Self-host
- 向いているケース / 向いていないケース
- 主な機能 / 技術的な確認点
- SaaSからの移行時に失う可能性があるもの
- 導入・更新・バックアップ・監視の運用負担
- Alternative to / Similar OSS
- GitHub snapshot と公式情報の確認日時

## Data flow

公開データと候補データを分離し、レビュー済みのものだけを公開します。

\`\`\`text
Open-source candidate sources
        ↓
import_candidates (private)
        ↓
human review / approve / reject
        ↓
products + projects + alternative_relations
        ↓
published_alternative_directory
        ↓
ossalt web
\`\`\`

GitHub の Stars、Forks、Issues、Last commit、Release などは定期ジョブでスナップショットとして保存します。

## Development

\`\`\`bash
cp .env.example .env.local
npm install
npm run dev
\`\`\`

主要コマンド:

\`\`\`bash
npm run build
npm run import:openalternative
npm run review:candidate
npm run sync:github-snapshots
npm run generate:readme
\`\`\`

\`.env.local\` にはブラウザ公開可能な Supabase anon key のみを設定します。Service Role Key は GitHub Actions などサーバー側だけで利用します。

## Supabase

マイグレーションは \`supabase/migrations/\` にあります。新しい環境では順番に適用してください。

\`\`\`bash
supabase link --project-ref acakchddmmuylifrgkbv
supabase db push
\`\`\`

## Contributing

掲載候補や内容の修正は Issue / Pull Request で歓迎します。

候補は「有名だから」ではなく、**公式情報を確認でき、代替関係と移行上の注意を説明できること**を重視します。ライセンスが曖昧な場合は推測せず \`要確認\` のまま扱います。

レビュー済み候補の一覧は \`data/reviewed-candidates.json\` がソースです。README はこのJSONから生成できます。

## Acknowledgements

候補探索の入口として [OpenAlternative](https://openalternative.co/) の公開OSSリストを参照しています。ossalt では候補をそのまま公開せず、独自のレビュー・移行情報を加えて掲載します。

---

**Last reviewed:** ${data.reviewed_at}
`;

fs.writeFileSync(readmePath, readme);
console.log(`README generated: ${uniqueRecords.length} projects / ${groups.size} categories / ${products.size} SaaS products`);
