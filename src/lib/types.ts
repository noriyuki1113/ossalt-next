export type DirectoryItem = {
  relation_id: string;
  product_slug: string;
  product_name: string;
  product_name_ja: string | null;
  product_plan_name?: string | null;
  product_monthly_price_jpy?: number | null;
  product_pricing_source_url?: string | null;
  product_pricing_checked_at?: string | null;
  project_id: string;
  project_slug: string;
  project_name: string;
  project_name_ja: string | null;
  short_description_ja: string | null;
  category: string | null;
  official_url: string | null;
  repository_url: string | null;
  license_spdx: string | null;
  primary_language: string | null;
  docker_available: boolean | null;
  verification_state: "unverified" | "reviewing" | "verified" | "needs_review";
  verified_at: string | null;
  source_checked_at: string | null;
  migration_difficulty: number | null;
  migration_summary_ja: string | null;
  strengths_ja: string[];
  constraints_ja: string[];
  stars_count: number | null;
  forks_count?: number | null;
  open_issues_count?: number | null;
  owner_avatar_url?: string | null;
  repository_created_at?: string | null;
  latest_release_tag?: string | null;
  latest_release_published_at?: string | null;
  topics?: string[] | null;
  last_commit_at: string | null;
  snapshot_observed_at: string | null;
};

export type SelfhostMethod = "startup_script" | "docker_compose" | "manual";

export type VpsProvider = {
  id: string;
  slug: string;
  name: string;
  affiliate_url: string | null;
  official_url: string;
  min_monthly_jpy: number;
  pricing_checked_at: string;
  is_active: boolean;
};

export type ToolSelfhostGuide = {
  id: string;
  tool_id: string;
  provider_id: string;
  method: SelfhostMethod;
  recommended_memory_gb: number | null;
  steps_md: string;
  source_url: string;
  verified_at: string;
  status: "draft" | "published";
  provider: VpsProvider;
};
