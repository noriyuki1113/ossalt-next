import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Github, Menu, Search, ShieldCheck, X } from "lucide-react";
import { supabase } from "./lib/supabase";
import { fallbackItems } from "./lib/fallback-data";
import type { DirectoryItem } from "./lib/types";

const journeys = [
  { number: "01", title: "サービスから探す", body: "今使っているSaaS名から、置き換え候補となるOSSを見つける。" },
  { number: "02", title: "条件を比較する", body: "費用だけでなく、ライセンス、運用負担、移行の注意点を比較する。" },
  { number: "03", title: "導入前に確認する", body: "公式情報、更新状況、セルフホストの前提を確認して判断する。" },
];

function useDirectoryItems() {
  const [items, setItems] = useState<DirectoryItem[]>(fallbackItems);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("published_alternative_directory").select("*").order("product_name").then(({ data, error }) => {
      if (!error && data && data.length > 0) setItems(data as DirectoryItem[]);
    });
  }, []);

  return items;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <Link className="brand" to="/"><span>O</span>ossalt</Link>
      <nav className={menuOpen ? "nav nav-open" : "nav"}>
        <Link to="/#find">サービスから探す</Link><Link to="/#compare">比較する</Link><Link to="/#guides">導入ガイド</Link><Link to="/#about">信頼方針</Link>
      </nav>
      <button className="menu" onClick={() => setMenuOpen((open) => !open)} aria-label="メニュー">
        {menuOpen ? <X /> : <Menu />}
      </button>
    </header>
  );
}

function Footer() {
  return (
    <footer id="about"><div><Link className="brand" to="/"><span>O</span>ossalt</Link><p>SaaSからOSSへの移行を、日本語で探し、比べ、判断する。</p></div><div><p>掲載情報は公開データと公式情報をもとにします。スポンサーは明示し、通常の比較順位には影響しません。</p><a href="https://github.com/noriyuki1113/ossalt-next" target="_blank" rel="noreferrer">GitHubで見る <ArrowUpRight size={14} /></a></div></footer>
  );
}

function TrustMark({ item }: { item: DirectoryItem }) {
  const label = item.verification_state === "verified" ? "情報を確認済み" : "公式情報を確認";
  return <span className="trust"><CheckCircle2 size={14} /> {label}</span>;
}

function ToolCard({ item }: { item: DirectoryItem }) {
  return (
    <article className="tool-card">
      <div className="card-top"><div><p className="replaces">{item.product_name} の代替候補</p><h3>{item.project_name}</h3></div><TrustMark item={item} /></div>
      <p className="description">{item.short_description_ja}</p>
      <div className="facts">
        {item.license_spdx && <span>{item.license_spdx}</span>}
        {item.docker_available && <span>Docker</span>}
        {item.migration_difficulty && <span>移行難易度 {item.migration_difficulty}/5</span>}
      </div>
      <p className="summary">{item.migration_summary_ja}</p>
      <div className="card-links">
        <Link to={`/alternatives/${item.product_slug}`}>比較を見る <ArrowRight size={14} /></Link>
        {item.official_url && <a href={item.official_url} target="_blank" rel="noreferrer">公式サイト <ArrowUpRight size={14} /></a>}
        {item.repository_url && <a href={item.repository_url} target="_blank" rel="noreferrer"><Github size={14} /> GitHub</a>}
      </div>
    </article>
  );
}

function HomePage() {
  const items = useDirectoryItems();
  const [query, setQuery] = useState("");
  const visibleItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => [item.product_name, item.product_name_ja, item.project_name, item.project_name_ja, item.category]
      .filter(Boolean).join(" ").toLowerCase().includes(keyword));
  }, [items, query]);

  return (
    <>
      <section className="hero">
        <div className="hero-kicker"><span className="status-dot" /> VERIFIED OSS ALTERNATIVES</div>
        <h1>そのSaaS、<em>OSSに置き換えられるかも。</em></h1>
        <p className="hero-copy">いま使っているサービス名から、実用的なOSS代替候補と移行時の注意点を日本語で確認できます。</p>
        <label className="searchbox"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="置き換えたいサービス名を入力（例：Notion）" /></label>
        <div className="chips">{["Notion", "Slack", "Figma", "Airtable", "Google Analytics"].map((name) => <button key={name} onClick={() => setQuery(name)}>{name}</button>)}</div>
        <div className="hero-proof"><span><ShieldCheck size={15} /> 公式情報を確認</span><span>スポンサーと比較順位を分離</span><span>日本語で移行ポイントを整理</span></div>
      </section>

      <section className="journey" id="find">
        <div className="section-heading"><p className="eyebrow">使い方</p><h2>移行判断を、3つのステップで。</h2><p className="section-copy">候補を探すだけでなく、導入前に確認すべきことまで一緒に整理します。</p></div>
        <div className="journey-grid">{journeys.map((journey) => <article key={journey.number}><span>{journey.number}</span><h3>{journey.title}</h3><p>{journey.body}</p></article>)}</div>
      </section>

      <section className="directory" id="compare">
        <div className="section-heading split"><div><p className="eyebrow">OSS代替候補</p><h2>いま使っているサービスから探す</h2></div><p>各候補には、ライセンス・セルフホスト可否・移行難易度・公式リンクをまとめています。</p></div>
        <div className="cards">{visibleItems.map((item) => <ToolCard item={item} key={item.relation_id} />)}</div>
        {visibleItems.length === 0 && <p className="empty">一致する候補がありません。サービス名を短くしてお試しください。</p>}
      </section>

      <section className="guides" id="guides"><div><p className="eyebrow">導入前チェック</p><h2>乗り換える前に、ここだけは確認。</h2><p className="section-copy">OSSは自由度が高いぶん、運用責任も増えます。導入前に最低限の確認を。</p></div><div className="guide-list"><p><b>01</b> ライセンスと商用利用の条件</p><p><b>02</b> ホスティング・バックアップ・運用体制</p><p><b>03</b> データ移行とチームへの展開方法</p></div></section>
    </>
  );
}

function AlternativesPage() {
  const { slug } = useParams();
  const items = useDirectoryItems();
  const candidates = items.filter((item) => item.product_slug === slug);
  const productName = candidates[0]?.product_name;

  if (!productName) return <section className="not-found"><p>指定したサービスの代替ページは準備中です。</p><Link to="/">トップへ戻る</Link></section>;

  return (
    <section className="alternatives-page">
      <div className="breadcrumb"><Link to="/"><ArrowLeft size={14} /> トップ</Link><span>/</span><span>{productName}の代替</span></div>
      <p className="eyebrow">{productName} のOSS代替候補</p>
      <h1>{productName}の代替OSSを比較</h1>
      <p className="alternative-lead">{productName}を置き換える際に確認したい、ライセンス・運用・データ移行の観点をまとめています。最終判断の前に各候補の公式情報をご確認ください。</p>
      <div className="candidate-stack">{candidates.map((item) => <article key={item.relation_id} className="candidate-detail">
        <div><TrustMark item={item} /><h2>{item.project_name}</h2><p>{item.short_description_ja}</p></div>
        <div className="detail-grid"><div><h3>移行の目安</h3><strong>{item.migration_difficulty ? `${item.migration_difficulty}/5` : "要確認"}</strong><p>{item.migration_summary_ja}</p></div><div><h3>向いているケース</h3><ul>{item.strengths_ja?.map((strength) => <li key={strength}>{strength}</li>)}</ul></div><div><h3>確認が必要な点</h3><ul>{item.constraints_ja?.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul></div></div>
        <div className="card-links"><a href={item.official_url ?? "#"} target="_blank" rel="noreferrer">公式サイト <ArrowUpRight size={14} /></a>{item.repository_url && <a href={item.repository_url} target="_blank" rel="noreferrer"><Github size={14} /> GitHub</a>}</div>
      </article>)}</div>
    </section>
  );
}

function Site() {
  return <div className="app-shell"><Header /><main><Routes><Route path="/" element={<HomePage />} /><Route path="/alternatives/:slug" element={<AlternativesPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></main><Footer /></div>;
}

export function App() {
  return <BrowserRouter><Site /></BrowserRouter>;
}
