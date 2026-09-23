import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ToolSelfhostGuide, VpsProvider } from "@/lib/types";

export type GuideWithProvider = ToolSelfhostGuide & { provider: VpsProvider };

export const SELFHOST_METHOD_LABEL: Record<string, string> = {
  startup_script: "ワンクリック",
  docker_compose: "Docker",
  manual: "手動",
};

// steps_md is plain admin-authored Markdown (one step per line, "- " / "1. " / bare
// lines all accepted). Rendered as plain text — never dangerouslySetInnerHTML — so no
// HTML from the field can execute, and the same list feeds HowTo JSON-LD.
export function parseSelfhostSteps(md: string): string[] {
  return md
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.replace(/^[-*]\s+/, "").replace(/^\d+[.)]\s+/, "").replace(/^#+\s+/, "").trim())
    .filter(Boolean);
}

export function useSelfhostGuides(toolId: string) {
  const [guides, setGuides] = useState<GuideWithProvider[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setGuides(null);
    if (!supabase) {
      setGuides([]);
      return;
    }
    supabase
      .from("tool_selfhost_guides")
      .select("*, provider:vps_providers(*)")
      .eq("tool_id", toolId)
      .eq("status", "published")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setGuides([]);
          return;
        }
        const rows = (data as unknown as GuideWithProvider[])
          .filter(row => row.provider && row.provider.is_active)
          // Fixed price-ascending order — never by affiliate payout.
          .sort((a, b) => a.provider.min_monthly_jpy - b.provider.min_monthly_jpy);
        setGuides(rows);
      });
    return () => {
      cancelled = true;
    };
  }, [toolId]);

  return guides;
}
