import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Vercel serverless function (not a Next.js route — this repo is a Vite SPA; Vercel's
// zero-config /api convention works for any framework). Resolves an affiliate outbound
// click, records it, and redirects. Uses the service role key server-side only — never
// exposed to the client bundle (no VITE_ prefix).

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function isSafeAbsoluteUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method && req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).send("Method not allowed");
    return;
  }

  const providerSlug = firstParam(req.query.p);
  const toolId = firstParam(req.query.t);
  const pagePath = firstParam(req.query.from);

  if (!providerSlug) {
    res.status(400).send("Missing provider");
    return;
  }
  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).send("Server misconfigured");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: provider, error } = await supabase
    .from("vps_providers")
    .select("id, affiliate_url, official_url, is_active")
    .eq("slug", providerSlug)
    .maybeSingle();

  if (error || !provider || !provider.is_active) {
    res.status(404).send("Unknown provider");
    return;
  }

  const destination = provider.affiliate_url || provider.official_url;
  if (!isSafeAbsoluteUrl(destination)) {
    res.status(500).send("Invalid destination");
    return;
  }

  // Best-effort logging — a failed insert should never block the redirect.
  try {
    await supabase.from("outbound_clicks").insert({
      tool_id: toolId,
      provider_id: provider.id,
      page_path: pagePath || "/",
    });
  } catch {
    // ignore
  }

  res.setHeader("Cache-Control", "no-store");
  res.writeHead(302, { Location: destination });
  res.end();
}
