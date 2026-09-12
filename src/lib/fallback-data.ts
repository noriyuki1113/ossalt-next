import type { DirectoryItem } from "./types";

export const fallbackItems: DirectoryItem[] = [
  {
    relation_id: "demo-notion-appflowy", product_slug: "notion", product_name: "Notion", product_name_ja: null,
    project_id: "demo-appflowy", project_slug: "appflowy", project_name: "AppFlowy", project_name_ja: null,
    short_description_ja: "ドキュメントとタスクをまとめて扱える、ローカルファーストのワークスペース。",
    category: "ワークスペース", official_url: "https://appflowy.io", repository_url: "https://github.com/AppFlowy-IO/AppFlowy",
    license_spdx: "AGPL-3.0", primary_language: "Rust", docker_available: true, verification_state: "verified",
    verified_at: null, source_checked_at: null, migration_difficulty: 3, migration_summary_ja: "Notionから移る際は、ブロック構成と共同編集の要件を確認してください。",
    strengths_ja: ["セルフホスト可能", "ローカルファースト"], constraints_ja: ["既存データの移行を事前確認"],
    stars_count: null, last_commit_at: null, snapshot_observed_at: null,
  },
  {
    relation_id: "demo-slack-mattermost", product_slug: "slack", product_name: "Slack", product_name_ja: null,
    project_id: "demo-mattermost", project_slug: "mattermost", project_name: "Mattermost", project_name_ja: null,
    short_description_ja: "チームコミュニケーションを自社環境で運用できるオープンソースのメッセージング基盤。",
    category: "コミュニケーション", official_url: "https://mattermost.com", repository_url: "https://github.com/mattermost/mattermost",
    license_spdx: "AGPL-3.0", primary_language: "Go", docker_available: true, verification_state: "verified",
    verified_at: null, source_checked_at: null, migration_difficulty: 3, migration_summary_ja: "チャンネル設計、通知、過去ログの移行範囲を先に決めるのが安全です。",
    strengths_ja: ["データの保管先を選べる", "Docker対応"], constraints_ja: ["運用担当が必要"],
    stars_count: null, last_commit_at: null, snapshot_observed_at: null,
  },
  {
    relation_id: "demo-zapier-n8n", product_slug: "zapier", product_name: "Zapier", product_name_ja: null,
    project_id: "demo-n8n", project_slug: "n8n", project_name: "n8n", project_name_ja: null,
    short_description_ja: "ワークフローを可視化して自動化する、セルフホスト可能な自動化ツール。",
    category: "自動化", official_url: "https://n8n.io", repository_url: "https://github.com/n8n-io/n8n",
    license_spdx: "Sustainable Use License", primary_language: "TypeScript", docker_available: true, verification_state: "needs_review",
    verified_at: null, source_checked_at: null, migration_difficulty: 2, migration_summary_ja: "利用条件とクラウド版・セルフホスト版の違いを公式情報で確認してください。",
    strengths_ja: ["ワークフローを自前で管理", "Docker対応"], constraints_ja: ["ライセンス条件を確認"],
    stars_count: null, last_commit_at: null, snapshot_observed_at: null,
  },
];
