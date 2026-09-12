import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Github, Menu, Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "./lib/supabase";
import { fallbackItems } from "./lib/fallback-data";
import type { DirectoryItem } from "./lib/types";
import { productGuides } from "./lib/product-guides";

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
    <header className="site-header">
      <Link className="brand" to="/"><span className="brand-mark">O</span><span>ossalt</span></Link>
      <nav className={open ? "nav nav-open" : "nav"}>
        <a href="/#directory">代替候補</a>
        <a href="/#collections">コレクション</a>
        <a href="/#method">選び方</a>
        <a href="/#policy">信頼方針</a>
        <a className="nav-github" href="https://github.com/noriyuki1113/ossalt-next" target="_blank" rel="noreferrer"><Github size={14}/> GitHub</a>
      </nav>
      <button className="menu" onClick={() => setOpen(v => !v)} aria-label="メニュー">{open ? <X/> : <Menu/>}</button>
    </header>
  );
}

function Footer() {
  return (
    <footer id="policy">
      <div><Link className="brand" to="/"><span className="brand-mark">O</span><span>ossalt</span></Link><p>SaaSからOSSへの移行を、日本語で比較・判断するためのディレクトリ。</p></div>
      <div><p>掲載候補は公式情報を確認し、レビュー済みのものだけを公開。スポンサー掲載と通常順位は分離します。</p><a href="https://github.com/noriyuki1113/ossalt-next" target="_blank" rel="noreferrer">レビュー基盤を見る <ArrowUpRight size={14}/></a></div>
    </footer>
  );
}

function TrustMark({ item }: { item: DirectoryItem }) {
  const verified = item.verification_state === "verified";
  return <span className={verified ? "trust verified" : "trust"}><CheckCircle2 size={13}/>{verified ? "確認済み" : "要確認"}</span>;
}

function Difficulty({ value }: { value: number | null }) {
  if (!value) return <span className="metric-value">—</span>;
  return <span className="metric-value">{value}/5</span>;
}

function CompactCard({ item }: { item: DirectoryItem }) {
  return (
    <article className="directory-card">
      <div className="card-head">
        <div>
          <div className="card-overline">{item.product_name} の代替</div>
          <h3>{item.project_name}</h3>
        </div>
        <TrustMark item={item}/>
      </div>
      <p className="card-description">{item.short_description_ja}</p>
      <div className="card-metrics">
        <div><span>移行難易度</span><Difficulty value={item.migration_difficulty}/></div>
        <div><span>ライセンス</span><strong>{item.license_spdx || "要確認"}</strong></div>
        <div><span>セルフホスト</span><strong>{item.docker_available ? "対応" : "要確認"}</strong></div>
      </div>
      <div className="card-tags">
        {item.category && <span>{item.category}</span>}
        {item.primary_language && <span>{item.primary_language}</span>}
        {item.stars_count != null && <span>★ {item.stars_count.toLocaleString()}</span>}
      </div>
      <div className="card-actions">
        <Link className="primary-action" to={`/alternatives/${item.product_slug}`}>比較を見る <ArrowRight size={14}/></Link>
        {item.repository_url && <a href={item.repository_url} target="_blank" rel="noreferrer"><Github size={14}/> GitHub</a>}
      </div>
    </article>
  );
}

function HomePage() {
  const items = useDirectoryItems();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("すべて");
  const [selfHostOnly, setSelfHostOnly] = useState(false);

  const categories = useMemo(() => ["すべて", ...Array.from(new Set(items.map(i => i.category).filter(Boolean) as string[])).slice(0, 10)], [items]);
  const services = useMemo(() => Array.from(new Set(items.map(i => i.product_name))).slice(0, 8), [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(item => {
      const haystack = [item.product_name, item.project_name, item.category, item.license_spdx].filter(Boolean).join(" ").toLowerCase();
      return (!q || haystack.includes(q)) && (category === "すべて" || item.category === category) && (!selfHostOnly || item.docker_available);
    });
  }, [items, query, category, selfHostOnly]);

  const stats = {
    products: new Set(items.map(i => i.product_slug)).size,
    projects: new Set(items.map(i => i.project_slug)).size,
    verified: items.filter(i => i.verification_state === "verified").length,
  };

  const collectionCards = [
    { title: "セルフホストできる", count: items.filter(i => i.docker_available).length, text: "自社環境で運用したい人向け", action: () => setSelfHostOnly(true) },
    { title: "移行しやすい", count: items.filter(i => (i.migration_difficulty ?? 9) <= 2).length, text: "難易度2以下の候補", action: () => { setSelfHostOnly(false); setCategory("すべて"); } },
    { title: "開発者向け", count: items.filter(i => ["開発","API開発","BaaS","AIエージェント開発"].includes(i.category || "")).length, text: "開発系カテゴリを中心に", action: () => setCategory("開発") },
  ];

  return (
    <>
      <section className="hero">
        <div className="hero-copy-wrap">
          <span className="hero-eyebrow">OPEN SOURCE ALTERNATIVES, FOR JAPAN</span>
          <h1>いつものSaaSに、<br/><em>もうひとつの選択肢を。</em></h1>
          <p>SaaS名からOSS代替候補を探し、ライセンス・運用負担・移行難易度まで比較できます。</p>
        </div>
        <div className="hero-search-wrap">
          <label className="searchbox"><Search size={20}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Notion、Slack、Firebase..." /></label>
          <div className="popular-row"><span>人気の検索</span>{services.slice(0,6).map(name => <button key={name} onClick={() => setQuery(name)}>{name}</button>)}</div>
        </div>
        <div className="hero-stats">
          <div><strong>{stats.products}</strong><span>SaaS</span></div>
          <div><strong>{stats.projects}</strong><span>OSS候補</span></div>
          <div><strong>{stats.verified}</strong><span>レビュー済み</span></div>
        </div>
      </section>

      <section className="collection-strip" id="collections">
        <div className="section-header"><div><span>COLLECTIONS</span><h2>目的から探す</h2></div><p>サービス名が決まっていなくても、運用方針から候補を見つけられます。</p></div>
        <div className="collection-grid">
          {collectionCards.map(card => <button key={card.title} onClick={card.action}><span>{card.count} projects</span><h3>{card.title}</h3><p>{card.text}</p><ArrowUpRight size={17}/></button>)}
        </div>
      </section>

      <section className="directory" id="directory">
        <div className="directory-toolbar">
          <div><span className="section-label">DIRECTORY</span><h2>OSS代替候補</h2><p>{visible.length} 件を表示中</p></div>
          <div className="filter-controls">
            <div className="filter-pills">{categories.map(name => <button className={category === name ? "active" : ""} onClick={() => setCategory(name)} key={name}>{name}</button>)}</div>
            <button className={selfHostOnly ? "selfhost-toggle active" : "selfhost-toggle"} onClick={() => setSelfHostOnly(v => !v)}><SlidersHorizontal size={14}/> セルフホストのみ</button>
          </div>
        </div>
        <div className="cards">{visible.map(item => <CompactCard item={item} key={item.relation_id}/>)}</div>
        {visible.length === 0 && <div className="empty-state"><Search size={24}/><h3>候補が見つかりません</h3><p>検索語やフィルターを変えてみてください。</p></div>}
      </section>

      <section className="method" id="method">
        <div className="section-header light"><div><span>OSSALT METHOD</span><h2>「OSSだから」ではなく、<br/>移行できるかで選ぶ。</h2></div><p>発見よりも意思決定。ossaltは、乗り換えた後に困らないための情報を優先します。</p></div>
        <div className="method-grid">
          <article><span>01</span><h3>移行難易度</h3><p>データ移行、設定再構築、運用変更の大きさを5段階で整理。</p></article>
          <article><span>02</span><h3>失うもの</h3><p>既存SaaS固有の機能や連携で、代替できない可能性を明記。</p></article>
          <article><span>03</span><h3>運用責任</h3><p>セルフホスト時に必要な監視、更新、バックアップまで含めて判断。</p></article>
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

  if (!productName) return <section className="not-found"><p>この比較ページは準備中です。</p><Link to="/">トップへ戻る</Link></section>;

  const selfHostedCount = candidates.filter(i => i.docker_available).length;
  const avgDifficulty = candidates.length
    ? (candidates.reduce((sum, i) => sum + (i.migration_difficulty || 0), 0) / candidates.filter(i => i.migration_difficulty).length || 0).toFixed(1)
    : "—";

  return (
    <section className="alternatives-page">
      <div className="breadcrumb"><Link to="/"><ArrowLeft size={14}/> トップ</Link><span>/</span><span>{productName}</span></div>

      <div className="comparison-hero">
        <span className="section-label">{productName} ALTERNATIVES</span>
        <h1>{productName} の代替OSS</h1>
        <p>{guide?.intro || "候補ごとに、移行難易度・ライセンス・向いているケース・注意点を整理しています。"}</p>
        <div className="comparison-meta">
          <span>{candidates.length} candidates</span>
          <span>{selfHostedCount} self-hosted</span>
          <span>avg. difficulty {avgDifficulty}</span>
          <span><ShieldCheck size={14}/> reviewed</span>
        </div>
      </div>

      {guide && (
        <>
          <section className="guide-summary">
            <div className="guide-summary-copy">
              <span className="section-label">EDITOR'S NOTE</span>
              <h2>{guide.headline}</h2>
            </div>
            <div className="guide-picks">
              {guide.bestFor.map(pick => (
                <div key={pick.label}>
                  <span>{pick.label}</span>
                  <strong>{pick.project}</strong>
                  <p>{pick.reason}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="change-map">
            <div className="section-header mini"><div><span>WHAT CHANGES</span><h2>{productName}から何が変わる？</h2></div></div>
            <div className="change-grid">
              {guide.changes.map(change => (
                <div key={change.label}>
                  <span>{change.label}</span>
                  <div><small>現在</small><strong>{change.before}</strong></div>
                  <ArrowRight size={16}/>
                  <div><small>移行後</small><strong>{change.after}</strong></div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="comparison-table">
        <div className="comparison-table-head"><span>候補</span><span>移行難易度</span><span>ライセンス</span><span>セルフホスト</span></div>
        {candidates.map(item => <div className="comparison-row" key={item.relation_id}>
          <div><strong>{item.project_name}</strong><small>{item.short_description_ja}</small></div>
          <Difficulty value={item.migration_difficulty}/>
          <span>{item.license_spdx || "要確認"}</span>
          <span>{item.docker_available ? "対応" : "要確認"}</span>
        </div>)}
      </div>

      <div className="candidate-stack">
        {candidates.map((item,index) => <article className="candidate-detail" key={item.relation_id}>
          <div className="candidate-number">0{index+1}</div>
          <div className="candidate-body">
            <div className="candidate-head"><div><TrustMark item={item}/><h2>{item.project_name}</h2><p>{item.short_description_ja}</p></div></div>
            <div className="detail-grid">
              <div><h3>向いているケース</h3><ul>{item.strengths_ja?.map(x => <li key={x}>✓ {x}</li>)}</ul></div>
              <div><h3>確認が必要な点</h3><ul>{item.constraints_ja?.map(x => <li key={x}>! {x}</li>)}</ul></div>
            </div>
            <div className="migration-note"><span>移行メモ</span><p>{item.migration_summary_ja}</p></div>
            <div className="candidate-actions">
              {item.official_url && <a className="button primary" href={item.official_url} target="_blank" rel="noreferrer">公式サイト <ArrowUpRight size={14}/></a>}
              {item.repository_url && <a className="button" href={item.repository_url} target="_blank" rel="noreferrer"><Github size={14}/> GitHub</a>}
            </div>
          </div>
        </article>)}
      </div>

      {guide && (
        <>
          <section className="migration-guide">
            <div>
              <span className="section-label">MIGRATION RISKS</span>
              <h2>移行で失う可能性があるもの</h2>
              <ul>{guide.risks.map(risk => <li key={risk}>{risk}</li>)}</ul>
            </div>
            <div>
              <span className="section-label">MIGRATION PLAN</span>
              <h2>移行の進め方</h2>
              <ol>{guide.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span>{step}</li>)}</ol>
            </div>
          </section>

          <section className="faq-section">
            <div className="section-header mini"><div><span>FAQ</span><h2>よくある質問</h2></div></div>
            <div className="faq-list">
              {guide.faq.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
            </div>
          </section>
        </>
      )}
    </section>
  );
}

function Site() {
  return <div className="app-shell"><Header/><main><Routes><Route path="/" element={<HomePage/>}/><Route path="/alternatives/:slug" element={<AlternativesPage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></main><Footer/></div>;
}
export function App(){ return <BrowserRouter><Site/></BrowserRouter>; }
