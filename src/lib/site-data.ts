import type { SupabaseClient } from "@supabase/supabase-js";
import { fallbackCategories, fallbackItems, fallbackLicenses } from "./fallback-data";
import type { Category, DirectoryItem, License, ToolSelfhostGuide } from "./types";

// Everything the site renders comes from this one snapshot, both in the browser and when
// pages are prerendered at build time. `generatedAt` is the reference "now" for relative
// dates, so a prerendered page and its hydration render the same text.
export type SiteData = {
  items: DirectoryItem[];
  categories: Category[];
  licenses: License[];
  guides: ToolSelfhostGuide[];
  generatedAt: string;
};

export function fallbackSiteData(generatedAt = new Date().toISOString()): SiteData {
  return { items: fallbackItems, categories: fallbackCategories, licenses: fallbackLicenses, guides: [], generatedAt };
}

// The directory view is required; categories/licenses/guides degrade to empty so the site
// still builds against a database where those migrations haven't been applied yet.
export async function fetchSiteData(client: SupabaseClient): Promise<SiteData> {
  const [items, categories, licenses, guides] = await Promise.all([
    client.from("published_alternative_directory").select("*").order("product_name"),
    client.from("categories").select("id,slug,name_ja,parent_id,sort_order,description_ja").order("sort_order"),
    client.from("licenses").select("slug,identifier,name,kind,copyleft,summary_ja,reference_url"),
    client.from("tool_selfhost_guides").select("*, provider:vps_providers(*)").eq("status", "published"),
  ]);
  if (items.error) throw new Error(`Failed to load published_alternative_directory: ${items.error.message}`);

  return {
    items: (items.data ?? []) as DirectoryItem[],
    categories: categories.error ? [] : (categories.data as Category[]),
    licenses: licenses.error ? [] : (licenses.data as License[]),
    guides: guides.error ? [] : ((guides.data ?? []) as unknown as ToolSelfhostGuide[])
      .filter(guide => guide.provider?.is_active)
      // Fixed price-ascending order — never by affiliate payout.
      .sort((a, b) => a.provider.min_monthly_jpy - b.provider.min_monthly_jpy),
    generatedAt: new Date().toISOString(),
  };
}

export const DAY_MS = 86_400_000;

export function daysSince(value: string | null | undefined, now: number): number | null {
  if (!value) return null;
  return Math.max(0, Math.floor((now - Date.parse(value)) / DAY_MS));
}

export type CategoryNode = Category & { children: Category[] };

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const bySort = (a: Category, b: Category) => a.sort_order - b.sort_order || a.name_ja.localeCompare(b.name_ja, "ja");
  return categories
    .filter(c => !c.parent_id)
    .sort(bySort)
    .map(parent => ({ ...parent, children: categories.filter(c => c.parent_id === parent.id).sort(bySort) }));
}

// A parent category covers its own direct links plus everything under its children.
export function categoryScope(category: Category, categories: Category[]): string[] {
  return [category.slug, ...categories.filter(c => c.parent_id === category.id).map(c => c.slug)];
}

export function itemInCategories(item: DirectoryItem, slugs: string[]): boolean {
  const own = item.category_slugs?.length ? item.category_slugs : item.category_slug ? [item.category_slug] : [];
  return own.some(slug => slugs.includes(slug));
}

export function uniqueByProject(items: DirectoryItem[]): DirectoryItem[] {
  const seen = new Set<string>();
  return items.filter(item => (seen.has(item.project_slug) ? false : (seen.add(item.project_slug), true)));
}
