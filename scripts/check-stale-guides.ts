// Lists self-host guides whose steps or provider pricing haven't been re-verified
// recently. Run with `npm run check:stale-guides` (needs SUPABASE_URL +
// SUPABASE_SERVICE_ROLE_KEY). Always exits 0 — it's a report, not a gate — but prints a
// machine-readable `STALE_COUNT=<n>` line the calling workflow can key off of.
import { createClient } from "@supabase/supabase-js";

const STEPS_MAX_AGE_DAYS = 120;
const PRICING_MAX_AGE_DAYS = 90;

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Row = {
  id: string;
  status: string;
  verified_at: string;
  tool: { slug: string; name: string } | null;
  provider: { slug: string; name: string; pricing_checked_at: string } | null;
};

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

async function main() {
  const { data, error } = await supabase
    .from("tool_selfhost_guides")
    .select("id, status, verified_at, tool:projects(slug, name), provider:vps_providers(slug, name, pricing_checked_at)");

  if (error) {
    throw new Error(`Failed to load tool_selfhost_guides: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as Row[];
  const findings: string[] = [];

  for (const row of rows) {
    const toolLabel = row.tool ? `${row.tool.name} (${row.tool.slug})` : row.id;
    const providerLabel = row.provider ? `${row.provider.name} (${row.provider.slug})` : "unknown provider";

    const stepsAge = daysSince(row.verified_at);
    if (stepsAge > STEPS_MAX_AGE_DAYS) {
      findings.push(`[steps stale] ${toolLabel} x ${providerLabel} — verified_at ${row.verified_at} (${stepsAge}d ago, status=${row.status})`);
    }

    if (row.provider) {
      const pricingAge = daysSince(row.provider.pricing_checked_at);
      if (pricingAge > PRICING_MAX_AGE_DAYS) {
        findings.push(`[pricing stale] ${providerLabel} — pricing_checked_at ${row.provider.pricing_checked_at} (${pricingAge}d ago) via ${toolLabel}`);
      }
    }
  }

  if (findings.length === 0) {
    console.log("No stale self-host guides or provider pricing found.");
  } else {
    console.log(`Found ${findings.length} stale item(s):`);
    for (const line of findings) console.log(`- ${line}`);
  }
  console.log(`STALE_COUNT=${findings.length}`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
