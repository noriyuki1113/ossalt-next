import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useJsonLd } from "@/lib/head";
import { SELFHOST_METHOD_LABEL, parseSelfhostSteps, useSelfhostGuides } from "@/lib/selfhost";
import type { ToolSelfhostGuide } from "@/lib/types";

function GuideCard({ toolId, guide }: { toolId: string; guide: ToolSelfhostGuide }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const steps = parseSelfhostSteps(guide.steps_md);
  const outboundHref = `/api/out?p=${encodeURIComponent(guide.provider.slug)}&t=${encodeURIComponent(toolId)}&from=${encodeURIComponent(pathname)}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold">{guide.provider.name}</h3>
              <Badge>{SELFHOST_METHOD_LABEL[guide.method] ?? guide.method}</Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-500">推奨メモリ {guide.recommended_memory_gb != null ? `${guide.recommended_memory_gb}GB〜` : "公式要件未記載"}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">月額{guide.provider.min_monthly_jpy.toLocaleString()}円〜</p>
            <p className="text-[11px] text-zinc-400">料金確認日 {guide.provider.pricing_checked_at}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-violet-600"
          aria-expanded={open}
        >
          <ChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
          手順を{open ? "閉じる" : "見る"}
        </button>
        {open && (
          <ol className="space-y-2 border-l border-zinc-200 pl-4 text-sm leading-7 text-zinc-600">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        )}
        <p className="text-[11px] text-zinc-400">
          手順確認日 {guide.verified_at} ・{" "}
          <a className="underline hover:text-zinc-600" href={guide.source_url} target="_blank" rel="noreferrer">
            根拠情報
          </a>
        </p>
        <Button asChild size="sm">
          <a href={outboundHref} target="_blank" rel="sponsored nofollow noopener">
            {guide.provider.name}を申し込む <ArrowUpRight size={13} />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export function SelfHostSection({ toolId, toolName }: { toolId: string; toolName: string }) {
  const guides = useSelfhostGuides(toolId);
  useJsonLd(
    `selfhost-howto-${toolId}`,
    guides.length === 0
      ? null
      : {
          "@context": "https://schema.org",
          "@graph": guides.map(guide => ({
            "@type": "HowTo",
            name: `${toolName}を${guide.provider.name}で動かす（${SELFHOST_METHOD_LABEL[guide.method] ?? guide.method}）`,
            step: parseSelfhostSteps(guide.steps_md).map((text, index) => ({ "@type": "HowToStep", position: index + 1, text })),
          })),
        },
  );

  if (guides.length === 0) return null;

  return (
    <section id="selfhost" className="mt-8 scroll-mt-32">
      <p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-600">Self-hosting</p>
      <h2 className="mt-2 text-2xl font-bold">{toolName}を国内VPSで動かす</h2>
      <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-800">
        このセクションにはアフィリエイトリンクを含みます（PR）。掲載順・評価には影響しません。
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {guides.map(guide => (
          <GuideCard key={guide.id} toolId={toolId} guide={guide} />
        ))}
      </div>
    </section>
  );
}
