import type { Category, DirectoryItem, License } from "./types";

// Used only when Supabase isn't configured (local dev without env vars). Mirrors a small
// slice of the real schema, including the category/license taxonomy from
// supabase/migrations/20260923110000_categories_and_licenses.sql.

export const fallbackItems: DirectoryItem[] = [
  {
    relation_id: "demo-notion-appflowy", product_slug: "notion", product_name: "Notion", product_name_ja: null,
    project_id: "demo-appflowy", project_slug: "appflowy", project_name: "AppFlowy", project_name_ja: null,
    short_description_ja: "ドキュメントとタスクをまとめて扱える、ローカルファーストのワークスペース。",
    category: "ワークスペース", category_slug: "workspace", category_slugs: ["workspace"],
    official_url: "https://appflowy.io", repository_url: "https://github.com/AppFlowy-IO/AppFlowy",
    license_spdx: "AGPL-3.0", license_slug: "agpl-3.0", license_name: "GNU AGPL v3.0", license_kind: "osi",
    primary_language: "Rust", docker_available: true, verification_state: "verified",
    verified_at: null, source_checked_at: null, migration_difficulty: 3, migration_summary_ja: "Notionから移る際は、ブロック構成と共同編集の要件を確認してください。",
    strengths_ja: ["セルフホスト可能", "ローカルファースト"], constraints_ja: ["既存データの移行を事前確認"],
    stars_count: null, last_commit_at: null, snapshot_observed_at: null,
  },
  {
    relation_id: "demo-slack-mattermost", product_slug: "slack", product_name: "Slack", product_name_ja: null,
    project_id: "demo-mattermost", project_slug: "mattermost", project_name: "Mattermost", project_name_ja: null,
    short_description_ja: "チームコミュニケーションを自社環境で運用できるオープンソースのメッセージング基盤。",
    category: "コミュニケーション", category_slug: "communication", category_slugs: ["communication"],
    official_url: "https://mattermost.com", repository_url: "https://github.com/mattermost/mattermost",
    license_spdx: "AGPL-3.0", license_slug: "agpl-3.0", license_name: "GNU AGPL v3.0", license_kind: "osi",
    primary_language: "Go", docker_available: true, verification_state: "verified",
    verified_at: null, source_checked_at: null, migration_difficulty: 3, migration_summary_ja: "チャンネル設計、通知、過去ログの移行範囲を先に決めるのが安全です。",
    strengths_ja: ["データの保管先を選べる", "Docker対応"], constraints_ja: ["運用担当が必要"],
    stars_count: null, last_commit_at: null, snapshot_observed_at: null,
  },
  {
    relation_id: "demo-zapier-n8n", product_slug: "zapier", product_name: "Zapier", product_name_ja: null,
    project_id: "demo-n8n", project_slug: "n8n", project_name: "n8n", project_name_ja: null,
    short_description_ja: "ワークフローを可視化して自動化する、セルフホスト可能な自動化ツール。",
    category: "自動化", category_slug: "automation", category_slugs: ["automation"],
    official_url: "https://n8n.io", repository_url: "https://github.com/n8n-io/n8n",
    license_spdx: "Sustainable Use License", license_slug: "sustainable-use", license_name: "Sustainable Use License", license_kind: "source_available",
    primary_language: "TypeScript", docker_available: true, verification_state: "needs_review",
    verified_at: null, source_checked_at: null, migration_difficulty: 2, migration_summary_ja: "利用条件とクラウド版・セルフホスト版の違いを公式情報で確認してください。",
    strengths_ja: ["ワークフローを自前で管理", "Docker対応"], constraints_ja: ["ライセンス条件を確認"],
    stars_count: null, last_commit_at: null, snapshot_observed_at: null,
  },
];

export const fallbackCategories: Category[] = [
  { id: "c-collaboration", slug: "collaboration", name_ja: "コラボレーション", parent_id: null, sort_order: 20, description_ja: null },
  { id: "c-developer", slug: "developer", name_ja: "開発・自動化", parent_id: null, sort_order: 50, description_ja: null },
  { id: "c-workspace", slug: "workspace", name_ja: "ワークスペース", parent_id: "c-collaboration", sort_order: 10, description_ja: null },
  { id: "c-communication", slug: "communication", name_ja: "コミュニケーション", parent_id: "c-collaboration", sort_order: 20, description_ja: null },
  { id: "c-automation", slug: "automation", name_ja: "自動化", parent_id: "c-developer", sort_order: 40, description_ja: null },
];

export const fallbackLicenses: License[] = [
  {
    slug: "agpl-3.0", identifier: "AGPL-3.0-only", name: "GNU AGPL v3.0", kind: "osi", copyleft: "network",
    summary_ja: "GPLの条件に加え、改変版をネットワーク越しにサービスとして提供する場合もソース公開が必要。",
    reference_url: "https://spdx.org/licenses/AGPL-3.0-only.html",
  },
  {
    slug: "sustainable-use", identifier: "Sustainable Use License", name: "Sustainable Use License", kind: "source_available", copyleft: null,
    summary_ja: "社内業務での利用はできるが、有償サービスとしての再提供などが制限される。OSI承認のオープンソースライセンスではない。",
    reference_url: null,
  },
];
