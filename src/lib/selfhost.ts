import { useMemo } from "react";
import { useSiteData } from "@/lib/site-context";
import type { ToolSelfhostGuide } from "@/lib/types";

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

// Published guides for one tool, already in fixed price-ascending order (see fetchSiteData).
export function useSelfhostGuides(toolId: string): ToolSelfhostGuide[] {
  const { guides } = useSiteData();
  return useMemo(() => guides.filter(guide => guide.tool_id === toolId), [guides, toolId]);
}
