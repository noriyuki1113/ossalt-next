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
import type { DirectoryItem } from "@/lib/types";

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
          <a className="hover:text-zinc-950" href="/#directory">代替候補</a>
          <a className="hover:text-zinc-950" href="/#collections">コレクション</a>
          <a className="hover:text-zinc-950" href="/#method">選び方</a>
          <a className="inline-flex items-center gap-1.5 hover:text-zinc-950" href="https://github.com/noriyuki1113/ossalt-next" target="_blank" rel="noreferrer"><Github size={15}/> GitHub</a>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(v => !v)} aria-label="メニュー">{open ? <X/> : <Menu/>}</button>
      </div>
      {open && <div className="border-t border-zinc-200 bg-white px-5 py-4 md:hidden">
        <div className="flex flex-col gap-4 text-sm text-zinc-700">
          <a href="/#directory">代替候補</a><a href="/#collections">コレクション</a><a href="/#method">選び方</a>
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

function ProjectMark({ item }: { item: DirectoryItem }) {
  const repoOwner = item.repository_url?.match(/^https?:\/\/github\.com\/([^/]+)/)?.[1];
  const src = item.owner_avatar_url || (repoOwner ? `https://github.com/${repoOwner}.png?size=88` : null);
  if (src) {
    return <img src={src} alt="" loading="lazy" className="size-11 shrink-0 rounded-xl border border-zinc-200 bg-white object-cover shadow-sm" />;
  }
  return <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-100 text-sm font-extrabold text-zinc-700 shadow-sm">{item.project_name.slice(0, 2).toUpperCase()}</div>;
}

function DirectoryCard({ item }: { item: DirectoryItem }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg hover:shadow-zinc-200/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <ProjectMark item={item}/>
            <div><p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">{item.product_name} の代替</p><h3 className="mt-1 text-2xl font-bold tracking-tight">{item.project_name}</h3></div>
          </div>
          <TrustMark item={item}/>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
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
      <CardFooter className="gap-2 border-t border-zinc-100 pt-4">
        <Button asChild size="sm"><Link to={`/alternatives/${item.product_slug}`}>比較を見る <ArrowRight size={13}/></Link></Button>
        {item.repository_url && <Button asChild size="sm" variant="ghost"><a href={item.repository_url} target="_blank" rel="noreferrer"><Github size={13}/> GitHub</a></Button>}
      </CardFooter>
    </Card>
  );
}

function HomePage() {
  const items = useDirectoryItems();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("すべて");
  const [selfHostOnly, setSelfHostOnly] = useState(false);
  const [collection, setCollection] = useState<"all" | "latest" | "active" | "easy">("all");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const categories = useMemo(() => ["すべて", ...Array.from(new Set(items.map(i => i.category).filter(Boolean) as string[])).slice(0, 9)], [items]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(item => {
      const text = [item.product_name,item.project_name,item.category,item.license_spdx].filter(Boolean).join(" ").toLowerCase();
      const matchesCollection =
        collection === "all" ||
        (collection === "easy" && (item.migration_difficulty ?? 9) <= 2) ||
        (collection === "active" && !!item.last_commit_at && Date.now() - new Date(item.last_commit_at).getTime() < 1000*60*60*24*45) ||
        (collection === "latest" && !!item.last_commit_at && Date.now() - new Date(item.last_commit_at).getTime() < 1000*60*60*24*120);
      return (!q || text.includes(q)) && (category === "すべて" || item.category === category) && (!selfHostOnly || item.docker_available) && matchesCollection;
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
      <section className="mx-auto max-w-7xl px-5 pb-14 pt-20 lg:px-8 lg:pt-28">
        <div className="grid items-end gap-12 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <Badge className="border-violet-200 bg-violet-50 text-violet-700">OPEN SOURCE ALTERNATIVES, FOR JAPAN</Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-[-0.06em] text-zinc-950 sm:text-6xl lg:text-7xl">
              いつものSaaSに、<br/><span className="text-violet-600">もうひとつの選択肢を。</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-600 lg:text-lg">SaaS名からOSS代替候補を探し、ライセンス・運用負担・移行難易度まで比較できます。</p>
          </div>
          <div>
            <label className="flex h-16 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 shadow-xl shadow-zinc-200/40 focus-within:border-violet-400">
              <Search size={20} className="text-zinc-400"/>
              <input className="h-full flex-1 bg-transparent text-base outline-none placeholder:text-zinc-400" value={query} onChange={e => setQuery(e.target.value)} placeholder="Notion、Slack、Firebase..." />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Notion","Slack","Zapier","Firebase","Google Analytics"].map(name => <Button key={name} variant="outline" size="sm" onClick={() => setQuery(name)}>{name}</Button>)}
            </div>
          </div>
        </div>
        <div className="mt-14 grid grid-cols-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {[["SaaS",stats.products],["OSS候補",stats.projects],["レビュー済み",stats.verified]].map(([label,value],i) => <div key={label} className={`p-5 sm:p-6 ${i ? "border-l border-zinc-200" : ""}`}><b className="block text-2xl sm:text-3xl">{value}</b><span className="mt-1 block text-xs text-zinc-500">{label}</span></div>)}
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-zinc-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
          <p className="text-xs font-medium text-zinc-400">よく比較されるSaaS</p>
          <div className="mt-4 flex flex-wrap gap-x-7 gap-y-3">
            {["Notion","Slack","Zapier","Firebase","Google Analytics","Salesforce","Jira","Mailchimp"].map(name => <button key={name} onClick={() => {setQuery(name); document.getElementById("directory")?.scrollIntoView();}} className="text-sm font-semibold text-zinc-200 transition hover:text-violet-300">{name} <span className="text-zinc-600">→</span></button>)}
          </div>
        </div>
      </section>

      <section id="collections" className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Collections</p><h2 className="mt-2 text-3xl font-bold tracking-tight">目的から探す</h2></div>
            <p className="max-w-lg text-sm leading-7 text-zinc-500">サービス名が決まっていなくても、運用方針から候補を見つけられます。</p>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {[
              ["セルフホスト","自社環境で運用できる候補",() => {setSelfHostOnly(true);setCollection("all");}],
              ["最近更新","最近コミットのあるOSS",() => {setSelfHostOnly(false);setCollection("latest");}],
              ["活発に開発中","45日以内に更新された候補",() => {setSelfHostOnly(false);setCollection("active");}],
            ].map(([title,body,action]) => <button key={title as string} onClick={action as () => void} className="group rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-left transition hover:border-violet-300 hover:bg-violet-50/40">
              <h3 className="text-lg font-bold">{title as string}</h3><p className="mt-2 text-sm text-zinc-500">{body as string}</p><ArrowUpRight className="mt-8 text-zinc-400 transition group-hover:text-violet-600" size={18}/>
            </button>)}
          </div>
        </div>
      </section>

      <section id="directory" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Directory</p><h2 className="mt-2 text-4xl font-bold tracking-tight">OSS代替候補</h2><p className="mt-2 text-sm text-zinc-500">{visible.length} 件を表示中</p></div>
          <div className="flex max-w-4xl flex-col gap-2 xl:items-end">
            <div className="flex flex-wrap gap-2">
              {(["all","latest","active","easy"] as const).map(key => <Button key={key} size="sm" variant={collection === key ? "default" : "outline"} onClick={() => setCollection(key)}>{key === "all" ? "すべて" : key === "latest" ? "最近更新" : key === "active" ? "Active" : "移行しやすい"}</Button>)}
              <Button size="sm" variant={selfHostOnly ? "soft" : "outline"} onClick={() => setSelfHostOnly(v => !v)}><SlidersHorizontal size={13}/> セルフホスト</Button>
            </div>
            <div className="flex flex-wrap gap-2">{categories.map(name => <Button key={name} size="sm" variant={category === name ? "soft" : "ghost"} onClick={() => setCategory(name)}>{name}</Button>)}</div>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{pagedItems.map(item => <DirectoryCard key={item.relation_id} item={item}/>)}</div>
        {pageCount > 1 && <div className="mt-10 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1,p-1))}>前へ</Button>
          <span className="text-xs text-zinc-500">{page} / {pageCount}</span>
          <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(p => Math.min(pageCount,p+1))}>次へ</Button>
        </div>}
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

function AlternativesPage() {
  const { slug } = useParams();
  const items = useDirectoryItems();
  const candidates = items.filter(i => i.product_slug === slug);
  const productName = candidates[0]?.product_name;
  const guide = slug ? productGuides[slug] : undefined;
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
        {candidates.map(item => <div key={item.relation_id} className="grid grid-cols-[1.6fr_.7fr_.8fr_.8fr] items-center border-t border-zinc-100 px-4 py-4 text-sm"><div><b>{item.project_name}</b><p className="mt-1 truncate text-xs text-zinc-500">{item.short_description_ja}</p></div><span>{item.migration_difficulty ? `${item.migration_difficulty}/5` : "—"}</span><span>{item.license_spdx || "要確認"}</span><span>{item.docker_available ? "対応" : "要確認"}</span></div>)}
      </div>

      <div className="mt-8 grid gap-4">{candidates.map((item,index) => <Card key={item.relation_id}>
        <CardHeader><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-zinc-400">0{index+1}</p><h2 className="mt-1 text-3xl font-bold">{item.project_name}</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-600">{item.short_description_ja}</p></div><TrustMark item={item}/></div></CardHeader>
        <CardContent><div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl bg-zinc-50 p-4"><h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">向いているケース</h3><ul className="mt-3 space-y-2 text-sm text-zinc-600">{item.strengths_ja?.map(x => <li key={x}>✓ {x}</li>)}</ul></div><div className="rounded-xl bg-zinc-50 p-4"><h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">確認が必要な点</h3><ul className="mt-3 space-y-2 text-sm text-zinc-600">{item.constraints_ja?.map(x => <li key={x}>! {x}</li>)}</ul></div></div>{item.migration_summary_ja && <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-violet-600">移行メモ</p><p className="mt-2 text-sm leading-7 text-zinc-600">{item.migration_summary_ja}</p></div>}</CardContent>
        <CardFooter className="gap-2">{item.official_url && <Button asChild size="sm"><a href={item.official_url} target="_blank" rel="noreferrer">公式サイト <ArrowUpRight size={13}/></a></Button>}{item.repository_url && <Button asChild size="sm" variant="outline"><a href={item.repository_url} target="_blank" rel="noreferrer"><Github size={13}/> GitHub</a></Button>}</CardFooter>
      </Card>)}</div>

      {guide && <><div className="mt-8 grid gap-4 md:grid-cols-2"><Card><CardHeader><h2 className="text-2xl font-bold">移行で失う可能性があるもの</h2></CardHeader><CardContent><ul className="space-y-3 text-sm leading-7 text-zinc-600">{guide.risks.map(r => <li key={r}>• {r}</li>)}</ul></CardContent></Card><Card><CardHeader><h2 className="text-2xl font-bold">移行の進め方</h2></CardHeader><CardContent><ol className="space-y-3">{guide.steps.map((s,i) => <li key={s} className="flex gap-3 text-sm text-zinc-600"><span className="text-violet-600">{String(i+1).padStart(2,"0")}</span>{s}</li>)}</ol></CardContent></Card></div>
      <div className="mt-10"><h2 className="text-3xl font-bold">よくある質問</h2><div className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">{guide.faq.map(f => <details key={f.q} className="bg-white px-1 py-4"><summary className="cursor-pointer font-semibold">{f.q}</summary><p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">{f.a}</p></details>)}</div></div></>}
    </section>
  );
}

function Footer() {
  return <footer className="border-t border-zinc-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-10 text-sm text-zinc-500 md:flex-row lg:px-8"><div><div className="font-bold text-zinc-950">ossalt</div><p className="mt-2">SaaSからOSSへの移行を、日本語で比較・判断するためのディレクトリ。</p></div><div className="max-w-xl"><p>掲載候補は公式情報を確認し、レビュー済みのものだけを公開します。</p><a className="mt-2 inline-flex items-center gap-1 text-violet-600" href="https://github.com/noriyuki1113/ossalt-next" target="_blank" rel="noreferrer">レビュー基盤を見る <ArrowUpRight size={13}/></a></div></div></footer>;
}

function Site() {
  return <div className="min-h-screen bg-[#f7f7f5] text-zinc-950"><Header/><main><Routes><Route path="/" element={<HomePage/>}/><Route path="/alternatives/:slug" element={<AlternativesPage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></main><Footer/></div>;
}
export function App(){ return <BrowserRouter><Site/></BrowserRouter>; }
