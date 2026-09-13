import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { Activity, ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, CircleDot, Clock3, GitFork, Github, Menu, Search, ShieldCheck, SlidersHorizontal, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { fallbackItems } from "@/lib/fallback-data";
import { productGuides } from "@/lib/product-guides";
import { projectProfiles } from "@/lib/project-profiles";
import type { DirectoryItem } from "@/lib/types";

const SITE_URL = "https://ossalt-next.vercel.app";

function usePageMeta(title: string, description: string, path = "/") {
  useEffect(() => {
    document.title = title;
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement("meta");
      descriptionMeta.setAttribute("name", "description");
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.setAttribute("content", description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${SITE_URL}${path}`);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    ogTitle?.setAttribute("content", title);
    ogDescription?.setAttribute("content", description);
    ogUrl?.setAttribute("content", `${SITE_URL}${path}`);
  }, [title, description, path]);
}

function useDirectoryItems() {
  const [items, setItems] = useState<DirectoryItem[]>(fallbackItems);
  useEffect(() => {
    if (!supabase) return;
    supabase.from("published_alternative_directory").select("*").order("product_name").then(({ data, error }) => {
      if (!error && data?.length) setItems(data as DirectoryItem[]);
    });
  }, []);
  return items;
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link className="flex items-center gap-2 font-extrabold tracking-tight text-zinc-950" to="/">
          <span className="grid size-8 place-items-center rounded-xl bg-zinc-950 text-sm text-white">O</span>
          <span className="text-lg">ossalt</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-zinc-600 md:flex">
          <Link className="hover:text-zinc-950" to="/categories">カテゴリ</Link>
          <Link className="hover:text-zinc-950" to="/collections">コレクション</Link>
          <a className="hover:text-zinc-950" href="/#method">選び方</a>
          <a className="inline-flex items-center gap-1.5 hover:text-zinc-950" href="https://github.com/noriyuki1113/ossalt-next" target="_blank" rel="noreferrer"><Github size={15}/> GitHub</a>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(v => !v)} aria-label="メニュー">{open ? <X/> : <Menu/>}</button>
      </div>
      {open && <div className="motion-panel border-t border-zinc-200 bg-white px-5 py-4 md:hidden">
        <div className="flex flex-col gap-4 text-sm text-zinc-700">
          <Link to="/categories">カテゴリ</Link><Link to="/collections">コレクション</Link><a href="/#method">選び方</a>
        </div>
      </div>}
    </header>
  );
}

function TrustMark({ item }: { item: DirectoryItem }) {
  const verified = item.verification_state === "verified";
  return <Badge className={verified ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}><CheckCircle2 size={12}/>{verified ? "確認済み" : "要確認"}</Badge>;
}

function relativeDate(value: string | null) {
  if (!value) return "更新日不明";
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));
  if (days === 0) return "今日更新";
  if (days === 1) return "昨日更新";
  if (days < 30) return `${days}日前`;
  if (days < 365) return `${Math.floor(days / 30)}か月前`;
  return `${Math.floor(days / 365)}年前`;
}

const projectLogoOverrides: Record<string, string> = {
  appflowy: "https://github.com/AppFlowy-IO.png?size=128",
  mattermost: "https://github.com/mattermost.png?size=128",
  activepieces: "https://github.com/activepieces.png?size=128",
  appwrite: "https://github.com/appwrite.png?size=128",
  bytechef: "https://github.com/bytechefhq.png?size=128",
  "cal-com": "https://github.com/calcom.png?size=128",
  dify: "https://github.com/langgenius.png?size=128",
  formbricks: "https://github.com/formbricks.png?size=128",
  immich: "https://github.com/immich-app.png?size=128",
  jellyfin: "https://github.com/jellyfin.png?size=128",
  langflow: "https://github.com/langflow-ai.png?size=128",
  letta: "https://github.com/letta-ai.png?size=128",
  librechat: "https://raw.githubusercontent.com/danny-avila/LibreChat/main/client/public/assets/logo.svg",
  listmonk: "https://github.com/knadh.png?size=128",
  mautic: "https://github.com/mautic.png?size=128",
  metabase: "https://github.com/metabase.png?size=128",
  plane: "https://github.com/makeplane.png?size=128",
  plausible: "https://github.com/plausible.png?size=128",
  supabase: "https://github.com/supabase.png?size=128",
  twenty: "https://github.com/twentyhq.png?size=128",
  umami: "https://github.com/umami-software.png?size=128",
};

function ProjectMark({ item }: { item: DirectoryItem }) {
  const src = projectLogoOverrides[item.project_slug];
  if (src) {
    return <img src={src} alt={`${item.project_name} logo`} loading="lazy" className="size-11 shrink-0 rounded-xl border border-zinc-200 bg-white object-contain p-1 shadow-sm" />;
  }
  return <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-100 text-sm font-extrabold text-zinc-700 shadow-sm">{item.project_name.slice(0, 2).toUpperCase()}</div>;
}

function DirectoryCard({ item }: { item: DirectoryItem }) {
  return (
    <Card className="motion-card group relative flex h-full cursor-pointer flex-col overflow-hidden hover:border-violet-300 hover:shadow-lg hover:shadow-zinc-200/50">
      <Link
        to={`/projects/${item.project_slug}`}
        aria-label={`${item.project_name} の詳細を見る`}
        className="absolute inset-0 z-0"
      />
      <CardHeader className="relative z-10 pointer-events-none">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <ProjectMark item={item}/>
            <div><p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">{item.product_name} の代替</p><h3 className="mt-1 text-2xl font-bold tracking-tight">{item.project_name}</h3></div>
          </div>
          <TrustMark item={item}/>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 flex-1 pointer-events-none">
        <p className="text-sm leading-7 text-zinc-600">{item.short_description_ja}</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-[10px] text-zinc-400">移行難易度</span><b className="mt-1 block text-sm">{item.migration_difficulty ? `${item.migration_difficulty}/5` : "—"}</b></div>
          <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-[10px] text-zinc-400">ライセンス</span><b className="mt-1 block truncate text-sm">{item.license_spdx || "要確認"}</b></div>
          <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-[10px] text-zinc-400">セルフホスト</span><b className="mt-1 block text-sm">{item.docker_available ? "対応" : "要確認"}</b></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.category && <Badge>{item.category}</Badge>}
          {item.primary_language && <Badge>{item.primary_language}</Badge>}
        </div>
        <div className="mt-4 flex items-center gap-4 text-[11px] text-zinc-500">
          {item.stars_count != null && <span className="inline-flex items-center gap-1"><Star size={12}/>{item.stars_count.toLocaleString()}</span>}
          {item.forks_count != null && <span className="inline-flex items-center gap-1"><GitFork size={12}/>{item.forks_count.toLocaleString()}</span>}
          {item.open_issues_count != null && <span className="inline-flex items-center gap-1"><CircleDot size={12}/>{item.open_issues_count.toLocaleString()}</span>}
          <span className="inline-flex items-center gap-1"><Clock3 size={12}/>{relativeDate(item.last_commit_at)}</span>
          {item.last_commit_at && Date.now() - new Date(item.last_commit_at).getTime() < 1000*60*60*24*45 && <span className="inline-flex items-center gap-1 text-emerald-600"><Activity size={12}/>Active</span>}
        </div>
      </CardContent>
      <CardFooter className="relative z-10 gap-2 border-t border-zinc-100 pt-4 pointer-events-none">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600">詳細へ <ArrowRight size={13} className="motion-arrow"/></span>
        {item.repository_url && <Button asChild size="sm" variant="ghost" className="pointer-events-auto"><a href={item.repository_url} target="_blank" rel="noreferrer"><Github size={13}/> GitHub</a></Button>}
      </CardFooter>
    </Card>
  );
}

const CATEGORY_GROUPS: { label: string; categories: string[] }[] = [
  { label: "ワークスペース・コラボレーション", categories: ["ワークスペース", "コミュニケーション", "ドキュメント管理", "AIチャット"] },
  { label: "自動化・開発者向け", categories: ["自動化", "BaaS", "AIエージェント開発"] },
  { label: "ビジネス・マーケティング", categories: ["CRM", "マーケティング", "分析", "BI", "メール配信"] },
  { label: "業務・コンテンツ", categories: ["プロジェクト管理", "スケジューリング", "フォーム・アンケート", "写真管理", "メディアサーバー"] },
];

function HomePage() {
  usePageMeta("ossalt — OSS移行ナビ", "SaaSからOSSへの移行を、日本語で探し、比べ、判断する。移行難易度・ライセンス・運用負担まで比較できます。", "/");
  const items = useDirectoryItems();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("すべて");
  const [selfHostOnly, setSelfHostOnly] = useState(false);
  const [collection, setCollection] = useState<"all" | "latest" | "active" | "easy">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const categoryGroups = useMemo(() => {
    const present = Array.from(new Set(items.map(i => i.category).filter(Boolean) as string[]));
    const grouped = new Set<string>();
    const groups = CATEGORY_GROUPS
      .map(group => ({ label: group.label, categories: group.categories.filter(name => present.includes(name)) }))
      .filter(group => group.categories.length > 0);
    groups.forEach(group => group.categories.forEach(name => grouped.add(name)));
    const rest = present.filter(name => !grouped.has(name)).sort((a,b) => a.localeCompare(b, "ja"));
    if (rest.length) groups.push({ label: "その他", categories: rest });
    return groups;
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(item => {
      const text = [item.product_name,item.project_name,item.category,item.license_spdx].filter(Boolean).join(" ").toLowerCase();
      const matchesCollection =
        collection === "all" ||
        (collection === "easy" && (item.migration_difficulty ?? 9) <= 2) ||
        (collection === "active" && !!item.last_commit_at && Date.now() - new Date(item.last_commit_at).getTime() < 1000*60*60*24*45) ||
        (collection === "latest" && !!item.last_commit_at && Date.now() - new Date(item.last_commit_at).getTime() < 1000*60*60*24*120);
      return (!q || text.includes(q)) &&
        (category === "すべて" || item.category === category) &&
        (!selfHostOnly || item.docker_available) &&
        matchesCollection;
    });
  }, [items, query, category, selfHostOnly, collection]);

  useEffect(() => { setPage(1); }, [query, category, selfHostOnly, collection]);
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const pagedItems = visible.slice((page - 1) * pageSize, page * pageSize);

  const stats = {
    products: new Set(items.map(i => i.product_slug)).size,
    projects: new Set(items.map(i => i.project_slug)).size,
    verified: items.filter(i => i.verification_state === "verified").length,
  };

  return (
    <>
      <section className="motion-fade-up border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <Badge className="border-violet-200 bg-violet-50 text-violet-700">OPEN SOURCE ALTERNATIVES, FOR JAPAN</Badge>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
                いつものSaaSに、<span className="text-violet-600">もうひとつの選択肢を。</span>
              </h1>
              <p className="mt-3 text-sm leading-7 text-zinc-500">SaaS名からOSS代替候補を探し、ライセンス・運用負担・移行難易度まで比較できます。</p>
            </div>
            <div className="w-full lg:w-[28rem]">
              <label className="flex h-14 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 shadow-sm focus-within:border-violet-400">
                <Search size={18} className="text-zinc-400"/>
                <input className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400" value={query} onChange={e => setQuery(e.target.value)} placeholder="Notion、Slack、Firebase..." />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Notion","Slack","Zapier","Firebase","Google Analytics"].map(name => <Button key={name} variant="outline" size="sm" onClick={() => setQuery(name)}>{name}</Button>)}
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 border-t border-zinc-100 pt-6 text-sm text-zinc-500">
            <span><b className="text-zinc-950">{stats.products}</b> SaaS</span>
            <span><b className="text-zinc-950">{stats.projects}</b> OSS候補</span>
            <span><b className="text-zinc-950">{stats.verified}</b> レビュー済み</span>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-5 lg:px-8">
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            {["Notion","Slack","Zapier","Firebase","Google Analytics","Salesforce","Jira","Mailchimp"].map(name => <button key={name} onClick={() => { setQuery(name); document.getElementById("directory")?.scrollIntoView({behavior:"smooth"}); }} className="text-sm font-semibold text-zinc-300 transition hover:text-violet-300">{name} <span className="text-zinc-600">→</span></button>)}
          </div>
        </div>
      </section>

      <section id="collections" className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Collections</p><h2 className="mt-1 text-2xl font-bold tracking-tight">目的から探す</h2></div>
            <Link to="/collections" className="text-sm font-medium text-violet-600">すべてのコレクションを見る →</Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              ["セルフホスト","自社環境で運用",() => { setSelfHostOnly(true); setCollection("all"); }],
              ["最近更新","120日以内に更新",() => { setSelfHostOnly(false); setCollection("latest"); }],
              ["活発に開発中","45日以内に更新",() => { setSelfHostOnly(false); setCollection("active"); }],
              ["移行しやすい","難易度2以下",() => { setSelfHostOnly(false); setCollection("easy"); }],
            ].map(([title,body,action]) => <button key={title as string} onClick={() => { (action as () => void)(); document.getElementById("directory")?.scrollIntoView({behavior:"smooth"}); }} className="group rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-left transition hover:border-violet-300 hover:bg-violet-50/40">
              <h3 className="font-bold">{title as string}</h3><p className="mt-1 text-xs text-zinc-500">{body as string}</p><ArrowUpRight className="mt-6 text-zinc-400 transition group-hover:text-violet-600" size={17}/>
            </button>)}
          </div>
        </div>
      </section>

      <section id="directory" className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Directory</p><h2 className="mt-1 text-3xl font-bold tracking-tight">OSS代替候補</h2><p className="mt-2 text-sm text-zinc-500">{visible.length} 件を表示中</p></div>
          <button className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 lg:hidden" onClick={() => setFiltersOpen(v => !v)}><SlidersHorizontal size={14}/> フィルター</button>
        </div>

        <div className="mt-7 grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className={`shrink-0 space-y-6 lg:block ${filtersOpen ? "motion-panel block" : "hidden"}`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">コレクション</p>
              <div className="mt-3 flex flex-col gap-1">
                {([
                  ["all","すべて"],
                  ["latest","最近更新"],
                  ["active","Active"],
                  ["easy","移行しやすい"],
                ] as const).map(([key,label]) => <button key={key} onClick={() => setCollection(key)} className={`rounded-lg px-3 py-2 text-left text-sm transition ${collection === key ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}>{label}</button>)}
              </div>
            </div>

            <div className="border-t border-zinc-200 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">カテゴリ</p>
              <div className="mt-3 flex flex-col gap-1">
                <button onClick={() => setCategory("すべて")} className={`rounded-lg px-3 py-2 text-left text-sm transition ${category === "すべて" ? "bg-violet-600 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}>すべて</button>
              </div>
              <div className="mt-4 space-y-4">
                {categoryGroups.map(group => <div key={group.label}>
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{group.label}</p>
                  <div className="mt-1 flex flex-col gap-1">
                    {group.categories.map(name => <button key={name} onClick={() => setCategory(name)} className={`rounded-lg px-3 py-2 text-left text-sm transition ${category === name ? "bg-violet-600 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}>{name}</button>)}
                  </div>
                </div>)}
              </div>
            </div>

            <div className="border-t border-zinc-200 pt-5">
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input type="checkbox" checked={selfHostOnly} onChange={e => setSelfHostOnly(e.target.checked)} className="size-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500" />
                セルフホストのみ
              </label>
            </div>
          </aside>

          <div>
            <div key={`${query}-${category}-${selfHostOnly}-${collection}-${page}`} className="motion-result grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{pagedItems.map(item => <DirectoryCard key={item.relation_id} item={item}/>)}</div>
            {pageCount > 1 && <div className="mt-10 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1,p-1))}>前へ</Button>
              <span className="text-xs text-zinc-500">{page} / {pageCount}</span>
              <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(p => Math.min(pageCount,p+1))}>次へ</Button>
            </div>}
          </div>
        </div>
      </section>

      <section id="method" className="bg-zinc-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Ossalt method</p>
          <div className="mt-3 grid gap-8 lg:grid-cols-2"><h2 className="text-4xl font-bold tracking-tight">「OSSだから」ではなく、<br/>移行できるかで選ぶ。</h2><p className="max-w-xl text-sm leading-7 text-zinc-400">発見よりも意思決定。乗り換えた後に困らないための情報を優先します。</p></div>
          <div className="mt-9 grid overflow-hidden rounded-2xl border border-zinc-800 md:grid-cols-3">
            {[["01","移行難易度","データ移行、設定再構築、運用変更の大きさを5段階で整理。"],["02","失うもの","既存SaaS固有の機能や連携で、代替できない可能性を明記。"],["03","運用責任","監視、更新、バックアップまで含めて判断。"]].map(([n,t,b],i) => <div key={n} className={`bg-zinc-900 p-6 ${i ? "border-t border-zinc-800 md:border-l md:border-t-0" : ""}`}><span className="text-xs text-violet-300">{n}</span><h3 className="mt-10 text-xl font-bold">{t}</h3><p className="mt-2 text-sm leading-7 text-zinc-400">{b}</p></div>)}
          </div>
        </div>
      </section>
    </>
  );
}

function DiscoveryCard({ title, description, count, to }: { title: string; description: string; count: number; to: string }) {
  return <Link to={to} className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg hover:shadow-zinc-200/40">
    <p className="text-xs font-medium uppercase tracking-[.12em] text-zinc-400">{count} projects</p>
    <div className="mt-7 flex items-end justify-between gap-4">
      <div><h3 className="text-xl font-bold tracking-tight">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p></div>
      <ArrowUpRight size={18} className="shrink-0 text-zinc-400 transition group-hover:text-violet-600"/>
    </div>
  </Link>;
}

function CategoriesPage() {
  usePageMeta("OSSカテゴリ一覧 | ossalt", "用途・カテゴリからオープンソース代替候補を探せます。", "/categories");
  const items = useDirectoryItems();
  const groups = Array.from(new Map(
    items.filter(i => i.category).map(i => [i.category!, items.filter(x => x.category === i.category)])
  ).entries()).sort((a,b) => b[1].length - a[1].length);

  return <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
    <Badge className="border-violet-200 bg-violet-50 text-violet-700">BROWSE BY CATEGORY</Badge>
    <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.7fr] lg:items-end">
      <h1 className="text-5xl font-extrabold tracking-[-.055em] lg:text-6xl">カテゴリから<br/>OSSを探す。</h1>
      <p className="text-sm leading-7 text-zinc-500">用途が決まっているなら、SaaS名よりカテゴリから探す方が早いことがあります。公開済みの候補だけを表示します。</p>
    </div>
    <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {groups.map(([category, rows]) => <DiscoveryCard key={category} title={category} description={`${category}領域のOSS候補を比較`} count={rows.length} to={`/categories/${encodeURIComponent(category)}`}/>)}
    </div>
  </section>;
}

function CategoryPage() {
  const { slug } = useParams();
  const items = useDirectoryItems();
  const category = decodeURIComponent(slug || "");
  const rows = items.filter(i => i.category === category);
  usePageMeta(`${category || "カテゴリ"}のOSS | ossalt`, `${category || "このカテゴリ"}で公開・レビュー済みのOSS代替候補を比較できます。`, `/categories/${encodeURIComponent(category)}`);

  return <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
    <Link className="inline-flex items-center gap-1 text-sm text-zinc-500" to="/categories"><ArrowLeft size={14}/> カテゴリ一覧</Link>
    <div className="mt-8 border-b border-zinc-200 pb-8">
      <Badge>{rows.length} PROJECTS</Badge>
      <h1 className="mt-4 text-5xl font-extrabold tracking-[-.055em]">{category}</h1>
      <p className="mt-4 text-sm leading-7 text-zinc-500">このカテゴリで公開・レビュー済みのOSS候補です。</p>
    </div>
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map(item => <DirectoryCard key={item.relation_id} item={item}/>)}</div>
  </section>;
}

const collectionDefinitions = {
  "self-hosted": { title: "セルフホスト", description: "自社環境で運用できるOSS", test: (i: DirectoryItem) => !!i.docker_available },
  active: { title: "活発に開発中", description: "45日以内にコミットが確認できるOSS", test: (i: DirectoryItem) => !!i.last_commit_at && Date.now() - new Date(i.last_commit_at).getTime() < 1000*60*60*24*45 },
  latest: { title: "最近更新", description: "120日以内に更新が確認できるOSS", test: (i: DirectoryItem) => !!i.last_commit_at && Date.now() - new Date(i.last_commit_at).getTime() < 1000*60*60*24*120 },
  easy: { title: "移行しやすい", description: "移行難易度2以下の候補", test: (i: DirectoryItem) => (i.migration_difficulty ?? 9) <= 2 },
} as const;

function CollectionsPage() {
  usePageMeta("OSSコレクション | ossalt", "セルフホスト、更新が活発、移行しやすいなどの条件からOSSを探せます。", "/collections");
  const items = useDirectoryItems();
  return <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
    <Badge className="border-violet-200 bg-violet-50 text-violet-700">CURATED COLLECTIONS</Badge>
    <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.7fr] lg:items-end">
      <h1 className="text-5xl font-extrabold tracking-[-.055em] lg:text-6xl">条件から<br/>OSSを探す。</h1>
      <p className="text-sm leading-7 text-zinc-500">運用方針や移行のしやすさから候補を絞れます。ossalt独自の「移行判断」軸です。</p>
    </div>
    <div className="mt-10 grid gap-3 md:grid-cols-2">
      {Object.entries(collectionDefinitions).map(([key, def]) => {
        const count = items.filter(def.test).length;
        return <DiscoveryCard key={key} title={def.title} description={def.description} count={count} to={`/collections/${key}`}/>;
      })}
    </div>
  </section>;
}

function CollectionPage() {
  const { key } = useParams();
  const items = useDirectoryItems();
  const def = key ? collectionDefinitions[key as keyof typeof collectionDefinitions] : undefined;
  if (!def) return <Navigate to="/collections" replace/>;
  const rows = items.filter(def.test);
  usePageMeta(`${def.title}のOSS | ossalt`, def.description, `/collections/${key}`);

  return <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
    <Link className="inline-flex items-center gap-1 text-sm text-zinc-500" to="/collections"><ArrowLeft size={14}/> コレクション一覧</Link>
    <div className="mt-8 border-b border-zinc-200 pb-8">
      <Badge>{rows.length} PROJECTS</Badge>
      <h1 className="mt-4 text-5xl font-extrabold tracking-[-.055em]">{def.title}</h1>
      <p className="mt-4 text-sm leading-7 text-zinc-500">{def.description}</p>
    </div>
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map(item => <DirectoryCard key={item.relation_id} item={item}/>)}</div>
  </section>;
}

function repositoryAge(value?: string | null) {
  if (!value) return "要確認";
  const years = Math.max(0, (Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  if (years < 1) return `${Math.max(1, Math.round(years * 12))}か月`;
  return `${years.toFixed(1)}年`;
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return <div>
    <div className="flex items-center justify-between text-sm"><span className="text-zinc-600">{label}</span><span className="font-semibold">{value}/5</span></div>
    <div className="mt-2 flex gap-1">{[1,2,3,4,5].map(i => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= value ? "bg-zinc-900" : "bg-zinc-200"}`}/>)}</div>
  </div>;
}

function ProjectPage() {
  const { slug } = useParams();
  const items = useDirectoryItems();
  const relations = items.filter(i => i.project_slug === slug);
  const item = relations[0];
  const profile = slug ? projectProfiles[slug] : undefined;

  if (!item) return <section className="mx-auto max-w-3xl px-5 py-28 text-center"><p>このOSSページは準備中です。</p><Button asChild className="mt-5"><Link to="/">トップへ戻る</Link></Button></section>;

  const operational = profile?.operations ?? { setup: 3, updates: 3, backups: 3, monitoring: 3 };
  const relatedProducts = Array.from(new Map(relations.map(r => [r.product_slug, r])).values());
  usePageMeta(`${item.project_name} — OSS詳細 | ossalt`, profile?.summary || item.short_description_ja || `${item.project_name}のOSS詳細と移行情報。`, `/projects/${item.project_slug}`);

  const similarProjects = items
    .filter(i => i.project_slug !== item.project_slug && i.category === item.category)
    .filter((row, index, all) => all.findIndex(x => x.project_slug === row.project_slug) === index)
    .sort((a,b) => (b.stars_count ?? 0) - (a.stars_count ?? 0))
    .slice(0, 3);

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
      <Link className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-950" to="/"><ArrowLeft size={14}/> ディレクトリへ</Link>

      <div className="mt-9 grid gap-8 border-b border-zinc-200 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex items-start gap-4">
            <ProjectMark item={item}/>
            <div>
              <div className="flex flex-wrap items-center gap-2"><Badge>{item.category || "OSS"}</Badge><TrustMark item={item}/></div>
              <h1 className="mt-3 text-5xl font-extrabold tracking-[-0.055em] lg:text-7xl">{item.project_name}</h1>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-600">{profile?.summary || item.short_description_ja}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.official_url && <Button asChild><a href={item.official_url} target="_blank" rel="noreferrer">公式サイト <ArrowUpRight size={14}/></a></Button>}
          {item.repository_url && <Button asChild variant="outline"><a href={item.repository_url} target="_blank" rel="noreferrer"><Github size={14}/> GitHub</a></Button>}
        </div>
      </div>

      <div className="sticky top-16 z-30 -mx-5 border-b border-zinc-200 bg-[#f7f7f5]/95 px-5 py-3 backdrop-blur lg:mx-0 lg:rounded-xl lg:border lg:px-4">
        <nav className="flex gap-5 overflow-x-auto whitespace-nowrap text-xs font-medium text-zinc-500">
          <a href="#overview" className="hover:text-zinc-950">概要</a>
          <a href="#fit" className="hover:text-zinc-950">向いている人</a>
          <a href="#operations" className="hover:text-zinc-950">運用負担</a>
          <a href="#alternatives" className="hover:text-zinc-950">代替SaaS</a>
          <a href="#similar" className="hover:text-zinc-950">似ているOSS</a>
        </nav>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="border-zinc-900 bg-zinc-950 text-white">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-300">Decision snapshot</p>
            <h2 className="mt-3 text-2xl font-bold">{profile?.bestFor?.[0] ? `${profile.bestFor[0]}なら有力候補` : "導入条件を確認して判断"}</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-300">{profile?.operationsNote || item.migration_summary_ja || "機能だけでなく、運用負担と移行コストまで確認して判断してください。"}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge className="border-zinc-700 bg-zinc-900 text-zinc-200">{item.docker_available ? "Self-hosted" : "Hosting要確認"}</Badge>
              <Badge className="border-zinc-700 bg-zinc-900 text-zinc-200">{item.license_spdx || "License要確認"}</Badge>
              <Badge className="border-zinc-700 bg-zinc-900 text-zinc-200">{item.last_commit_at ? relativeDate(item.last_commit_at) : "更新日要確認"}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-600">Data freshness</p><h2 className="mt-2 text-xl font-bold">情報の鮮度</h2></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-zinc-500">GitHub snapshot</span><b>{item.snapshot_observed_at ? relativeDate(item.snapshot_observed_at) : "未取得"}</b></div>
            <div className="flex justify-between gap-4"><span className="text-zinc-500">公式情報確認</span><b>{item.source_checked_at ? relativeDate(item.source_checked_at) : "要確認"}</b></div>
            <div className="flex justify-between gap-4"><span className="text-zinc-500">レビュー状態</span><b>{item.verification_state === "verified" ? "確認済み" : "要確認"}</b></div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Card><CardContent><p className="text-xs text-zinc-400">Stars</p><p className="mt-2 text-2xl font-bold">{item.stars_count?.toLocaleString() ?? "—"}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-zinc-400">Forks</p><p className="mt-2 text-2xl font-bold">{item.forks_count?.toLocaleString() ?? "—"}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-zinc-400">Open issues</p><p className="mt-2 text-2xl font-bold">{item.open_issues_count?.toLocaleString() ?? "—"}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-zinc-400">Last commit</p><p className="mt-2 text-lg font-bold">{relativeDate(item.last_commit_at)}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-zinc-400">Repository age</p><p className="mt-2 text-lg font-bold">{repositoryAge(item.repository_created_at)}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-zinc-400">Latest release</p><p className="mt-2 truncate text-lg font-bold">{item.latest_release_tag || "要確認"}</p></CardContent></Card>
      </div>

      <div id="overview" className="mt-8 scroll-mt-32 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <Card>
          <CardHeader><p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-600">Overview</p><h2 className="mt-2 text-3xl font-bold tracking-tight">このOSSについて</h2></CardHeader>
          <CardContent><p className="text-sm leading-8 text-zinc-600">{profile?.overview || item.short_description_ja}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-600">Basics</p><h2 className="mt-2 text-2xl font-bold">基本情報</h2></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-zinc-500">主要言語</span><b>{item.primary_language || "要確認"}</b></div>
            <div className="flex justify-between gap-4"><span className="text-zinc-500">セルフホスト</span><b>{item.docker_available ? "対応" : "要確認"}</b></div>
            <div className="flex justify-between gap-4"><span className="text-zinc-500">ライセンス</span><b>{item.license_spdx || "要確認"}</b></div>
            <div className="flex justify-between gap-4"><span className="text-zinc-500">Repository age</span><b>{repositoryAge(item.repository_created_at)}</b></div>
            <div className="flex justify-between gap-4"><span className="text-zinc-500">最新リリース</span><b>{item.latest_release_tag || "要確認"}</b></div>
            <div className="flex justify-between gap-4"><span className="text-zinc-500">開発状況</span><b className={item.last_commit_at && Date.now() - new Date(item.last_commit_at).getTime() < 1000*60*60*24*45 ? "text-emerald-600" : ""}>{item.last_commit_at ? relativeDate(item.last_commit_at) : "要確認"}</b></div>
            {item.topics?.length ? <div className="pt-2"><span className="text-zinc-500">Topics</span><div className="mt-2 flex flex-wrap gap-2">{item.topics.slice(0,8).map(topic => <Badge key={topic}>{topic}</Badge>)}</div></div> : null}
          </CardContent>
        </Card>
      </div>

      <div id="fit" className="mt-8 scroll-mt-32 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><h2 className="text-2xl font-bold">向いているケース</h2></CardHeader>
          <CardContent><ul className="space-y-3 text-sm leading-7 text-zinc-600">{(profile?.bestFor || item.strengths_ja || []).map(x => <li key={x}>✓ {x}</li>)}</ul></CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="text-2xl font-bold">向いていないケース</h2></CardHeader>
          <CardContent><ul className="space-y-3 text-sm leading-7 text-zinc-600">{(profile?.avoidIf || item.constraints_ja || []).map(x => <li key={x}>! {x}</li>)}</ul></CardContent>
        </Card>
      </div>

      {profile && <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-600">Features</p><h2 className="mt-2 text-2xl font-bold">主な機能</h2></CardHeader>
          <CardContent><ul className="space-y-3 text-sm leading-7 text-zinc-600">{profile.features.map(x => <li key={x}>• {x}</li>)}</ul></CardContent>
        </Card>
        <Card>
          <CardHeader><p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-600">Technical notes</p><h2 className="mt-2 text-2xl font-bold">技術的な確認点</h2></CardHeader>
          <CardContent><ul className="space-y-3 text-sm leading-7 text-zinc-600">{profile.technicalNotes.map(x => <li key={x}>• {x}</li>)}</ul></CardContent>
        </Card>
        <Card>
          <CardHeader><p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-600">Migration notes</p><h2 className="mt-2 text-2xl font-bold">移行時の注意</h2></CardHeader>
          <CardContent><ul className="space-y-3 text-sm leading-7 text-zinc-600">{profile.migrationNotes.map(x => <li key={x}>• {x}</li>)}</ul></CardContent>
        </Card>
      </div>}

      <div id="operations" className="mt-8 scroll-mt-32 grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
        <Card>
          <CardHeader><p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-600">Operations</p><h2 className="mt-2 text-2xl font-bold">運用負担</h2></CardHeader>
          <CardContent className="space-y-5">
            <ScoreRow label="導入" value={operational.setup}/>
            <ScoreRow label="アップデート" value={operational.updates}/>
            <ScoreRow label="バックアップ" value={operational.backups}/>
            <ScoreRow label="監視" value={operational.monitoring}/>
            <p className="pt-2 text-sm leading-7 text-zinc-500">{profile?.operationsNote || "セルフホストする場合は、更新・バックアップ・監視を含めた運用設計が必要です。"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-600">Deployment</p><h2 className="mt-2 text-2xl font-bold">導入時に確認すること</h2></CardHeader>
          <CardContent>
            <ol className="space-y-4">{(profile?.deployment || ["検証環境を用意する","データ移行方法を確認する","バックアップと更新手順を決める"]).map((step,index) => <li key={step} className="flex gap-4 text-sm leading-7 text-zinc-600"><span className="text-violet-600">{String(index+1).padStart(2,"0")}</span><span>{step}</span></li>)}</ol>
          </CardContent>
        </Card>
      </div>

      <div id="alternatives" className="mt-10 scroll-mt-32">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-600">Alternative to</p><h2 className="mt-2 text-3xl font-bold">代替できるSaaS</h2></div></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {relatedProducts.map(rel => <Link key={rel.product_slug} to={`/alternatives/${rel.product_slug}`} className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-violet-300 hover:shadow-md">
            <p className="text-xs text-zinc-400">Alternative to</p><div className="mt-2 flex items-center justify-between"><h3 className="text-lg font-bold">{rel.product_name}</h3><ArrowRight size={16} className="text-zinc-400 group-hover:text-violet-600"/></div><p className="mt-3 text-sm text-zinc-500">移行難易度 {rel.migration_difficulty ? `${rel.migration_difficulty}/5` : "要確認"}</p>
          </Link>)}
        </div>
      </div>

      {similarProjects.length > 0 && <div id="similar" className="mt-12 scroll-mt-32 border-t border-zinc-200 pt-10">
        <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-600">Similar projects</p><h2 className="mt-2 text-3xl font-bold">似ているOSS</h2><p className="mt-2 text-sm text-zinc-500">同じカテゴリで比較されやすい候補です。</p></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{similarProjects.map(project => <DirectoryCard key={project.relation_id} item={project}/>)}</div>
      </div>}
    </section>
  );
}

function AlternativesPage() {
  const { slug } = useParams();
  const items = useDirectoryItems();
  const candidates = items.filter(i => i.product_slug === slug);
  const productName = candidates[0]?.product_name;
  const guide = slug ? productGuides[slug] : undefined;
  usePageMeta(productName ? `${productName}の代替OSS | ossalt` : "代替OSS | ossalt", productName ? `${productName}から移行できるOSS候補を、移行難易度・ライセンス・運用負担で比較。` : "SaaSの代替OSSを比較。", `/alternatives/${slug || ""}`);
  if (!productName) return <section className="mx-auto max-w-3xl px-5 py-28 text-center"><p>この比較ページは準備中です。</p><Button asChild className="mt-5"><Link to="/">トップへ戻る</Link></Button></section>;

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
      <Link className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-950" to="/"><ArrowLeft size={14}/> トップへ</Link>
      <div className="mt-10 border-b border-zinc-200 pb-10">
        <Badge>{productName} ALTERNATIVES</Badge>
        <h1 className="mt-5 text-5xl font-extrabold tracking-[-0.06em] lg:text-7xl">{productName} の代替OSS</h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-600">{guide?.intro || "候補ごとに、移行難易度・ライセンス・向いているケース・注意点を整理しています。"}</p>
      </div>

      {guide && <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <Card><CardHeader><Badge className="border-violet-200 bg-violet-50 text-violet-700">EDITOR'S NOTE</Badge><h2 className="mt-4 text-3xl font-bold tracking-tight">{guide.headline}</h2></CardHeader><CardContent><p className="text-sm leading-7 text-zinc-600">完全な置き換えよりも、優先機能と運用条件を決めて候補を選ぶのが現実的です。</p></CardContent></Card>
        <div className="grid gap-3">{guide.bestFor.map(pick => <Card key={pick.label}><CardContent className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-zinc-400">{pick.label}</p><h3 className="mt-1 font-bold">{pick.project}</h3><p className="mt-1 text-sm text-zinc-500">{pick.reason}</p></div><ArrowUpRight size={17} className="text-zinc-400"/></CardContent></Card>)}</div>
      </div>}

      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-[1.6fr_.7fr_.8fr_.8fr] bg-zinc-50 px-4 py-3 text-[10px] uppercase tracking-wider text-zinc-400"><span>候補</span><span>難易度</span><span>ライセンス</span><span>セルフホスト</span></div>
        {candidates.map(item => <Link to={`/projects/${item.project_slug}`} key={item.relation_id} className="grid grid-cols-[1.6fr_.7fr_.8fr_.8fr] items-center border-t border-zinc-100 px-4 py-4 text-sm transition hover:bg-violet-50/50"><div><b>{item.project_name}</b><p className="mt-1 truncate text-xs text-zinc-500">{item.short_description_ja}</p></div><span>{item.migration_difficulty ? `${item.migration_difficulty}/5` : "—"}</span><span>{item.license_spdx || "要確認"}</span><span>{item.docker_available ? "対応" : "要確認"}</span></Link>)}
      </div>

      <div className="mt-8 grid gap-4">{candidates.map((item,index) => <Card key={item.relation_id}>
        <CardHeader><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-zinc-400">0{index+1}</p><Link to={`/projects/${item.project_slug}`} className="mt-1 inline-flex items-center gap-2 text-3xl font-bold hover:text-violet-600">{item.project_name}<ArrowUpRight size={18}/></Link><p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-600">{item.short_description_ja}</p></div><TrustMark item={item}/></div></CardHeader>
        <CardContent><div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl bg-zinc-50 p-4"><h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">向いているケース</h3><ul className="mt-3 space-y-2 text-sm text-zinc-600">{item.strengths_ja?.map(x => <li key={x}>✓ {x}</li>)}</ul></div><div className="rounded-xl bg-zinc-50 p-4"><h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">確認が必要な点</h3><ul className="mt-3 space-y-2 text-sm text-zinc-600">{item.constraints_ja?.map(x => <li key={x}>! {x}</li>)}</ul></div></div>{item.migration_summary_ja && <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-violet-600">移行メモ</p><p className="mt-2 text-sm leading-7 text-zinc-600">{item.migration_summary_ja}</p></div>}</CardContent>
        <CardFooter className="gap-2">{item.official_url && <Button asChild size="sm"><a href={item.official_url} target="_blank" rel="noreferrer">公式サイト <ArrowUpRight size={13}/></a></Button>}{item.repository_url && <Button asChild size="sm" variant="outline"><a href={item.repository_url} target="_blank" rel="noreferrer"><Github size={13}/> GitHub</a></Button>}</CardFooter>
      </Card>)}</div>

      {guide && <><div className="mt-8 grid gap-4 md:grid-cols-2"><Card><CardHeader><h2 className="text-2xl font-bold">移行で失う可能性があるもの</h2></CardHeader><CardContent><ul className="space-y-3 text-sm leading-7 text-zinc-600">{guide.risks.map(r => <li key={r}>• {r}</li>)}</ul></CardContent></Card><Card><CardHeader><h2 className="text-2xl font-bold">移行の進め方</h2></CardHeader><CardContent><ol className="space-y-3">{guide.steps.map((s,i) => <li key={s} className="flex gap-3 text-sm text-zinc-600"><span className="text-violet-600">{String(i+1).padStart(2,"0")}</span>{s}</li>)}</ol></CardContent></Card></div>
      <div className="mt-10"><h2 className="text-3xl font-bold">よくある質問</h2><div className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">{guide.faq.map(f => <details key={f.q} className="bg-white px-1 py-4"><summary className="cursor-pointer font-semibold">{f.q}</summary><p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">{f.a}</p></details>)}</div></div></>}
    </section>
  );
}

function AboutPage() {
  usePageMeta("ossaltについて", "ossaltの目的、掲載基準、データ更新方針について。", "/about");
  return <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8"><Badge>ABOUT</Badge><h1 className="mt-5 text-5xl font-extrabold tracking-[-.055em]">ossaltについて</h1><div className="mt-8 space-y-6 text-sm leading-8 text-zinc-600"><p>ossaltは、SaaSからOSSへの移行を日本語で比較・判断するためのディレクトリです。単に代替候補を並べるのではなく、移行難易度、ライセンス、運用負担、失う可能性がある機能まで整理します。</p><p>GitHubの活動状況は定期的に取得し、編集情報と分離して扱います。候補データはレビュー済みのものだけを公開します。</p></div></section>;
}

function EditorialPolicyPage() {
  usePageMeta("掲載・編集方針 | ossalt", "ossaltの掲載基準、検証状態、スポンサーと編集判断の分離方針。", "/editorial-policy");
  return <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8"><Badge>EDITORIAL POLICY</Badge><h1 className="mt-5 text-5xl font-extrabold tracking-[-.055em]">掲載・編集方針</h1><div className="mt-8 space-y-6 text-sm leading-8 text-zinc-600"><p>掲載候補は、公式サイト、公式リポジトリ、ライセンスなど確認可能な一次情報を優先します。不明な項目は推測せず「要確認」と表示します。</p><p>スポンサー掲載がある場合も、編集順位、レビュー状態、検証結果とは分離して扱います。GitHubのStarsや更新状況は取得日時付きのスナップショットとして扱います。</p><p>誤りや更新漏れはGitHubのIssueまたはPull Requestで報告できます。</p></div></section>;
}

function NotFoundPage() {
  usePageMeta("ページが見つかりません | ossalt", "指定されたページは見つかりませんでした。", window.location.pathname);
  return <section className="mx-auto max-w-3xl px-5 py-28 text-center"><p className="text-sm text-zinc-500">404</p><h1 className="mt-3 text-4xl font-bold">ページが見つかりません</h1><Button asChild className="mt-6"><Link to="/">トップへ戻る</Link></Button></section>;
}

function Footer() {
  return <footer className="border-t border-zinc-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-10 text-sm text-zinc-500 md:flex-row lg:px-8"><div><div className="font-bold text-zinc-950">ossalt</div><p className="mt-2">SaaSからOSSへの移行を、日本語で比較・判断するためのディレクトリ。</p></div><div className="flex flex-col gap-3 md:items-end"><div className="flex flex-wrap gap-4"><Link to="/about">ossaltについて</Link><Link to="/editorial-policy">掲載・編集方針</Link><Link to="/categories">カテゴリ</Link><Link to="/collections">コレクション</Link></div><a className="inline-flex items-center gap-1 text-violet-600" href="https://github.com/noriyuki1113/ossalt-next" target="_blank" rel="noreferrer">GitHubで修正提案 <ArrowUpRight size={13}/></a></div></div></footer>;
}

function Site() {
  return <div className="min-h-screen bg-[#f7f7f5] text-zinc-950"><Header/><main><Routes><Route path="/" element={<HomePage/>}/><Route path="/alternatives/:slug" element={<AlternativesPage/>}/><Route path="/projects/:slug" element={<ProjectPage/>}/><Route path="/categories" element={<CategoriesPage/>}/><Route path="/categories/:slug" element={<CategoryPage/>}/><Route path="/collections" element={<CollectionsPage/>}/><Route path="/collections/:key" element={<CollectionPage/>}/><Route path="/about" element={<AboutPage/>}/><Route path="/editorial-policy" element={<EditorialPolicyPage/>}/><Route path="*" element={<NotFoundPage/>}/></Routes></main><Footer/></div>;
}
export function App(){ return <BrowserRouter><Site/></BrowserRouter>; }
