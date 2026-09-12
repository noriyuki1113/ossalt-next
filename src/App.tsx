import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Github,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import { fallbackItems } from "./lib/fallback-data";
import type { DirectoryItem } from "./lib/types";

const popularServices = ["Notion", "Slack", "Figma", "Zapier", "Google Analytics", "Firebase"];
const journeys = [
  { number: "01", title: "サービス名で探す", body: "いま使っているSaaSを入力すると、公開済みのOSS代替候補だけを表示します。" },
  { number: "02", title: "移行コストを見る", body: "ライセンス、運用負担、セルフホスト可否、移行難易度を同じ形式で比較できます。" },
  { number: "03", title: "公式情報で確かめる", body: "公式サイトとGitHubへの導線を用意。最終判断は一次情報までたどれます。" },
];

function useDirectoryItems() {
  const [items, setItems] = useState<DirectoryItem[]>(fallbackItems);
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("published_alternative_directory")
      .select("*")
      .order("product_name")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setItems(data as DirectoryItem[]);
      });
  }, []);
  return items;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="ossalt home">
        <span className="brand-mark">O</span><span>ossalt</span>
      </Link>
      <nav className={menuOpen ? "nav nav-open" : "nav"}>
        <a href="/#directory">代替候補</a>
        <a href="/#method">選び方</a>
        <a href="/#trust">信頼方針</a>
        <a className="nav-github" href="https://github.com/noriyuki1113/ossalt-next" target="_blank" rel="noreferrer">
          <Github size={14} /> GitHub
        </a>
      </nav>
      <button className="menu" onClick={() => setMenuOpen((open) => !open)} aria-label="メニュー">
        {menuOpen ? <X /> : <Menu />}
      </button>
    </header>
  );
}

function Footer() {
  return (
    <footer id="trust">
      <div>
        <Link className="brand" to="/"><span className="brand-mark">O</span><span>ossalt</span></Link>
        <p>SaaSからOSSへの移行を、日本語で探し、比べ、判断するためのディレクトリ。</p>
      </div>
      <div className="footer-note">
        <p>掲載候補は公式情報を確認し、レビュー済みのものだけを公開します。スポンサー掲載は通常の比較順位から分離します。</p>
        <a href="https://github.com/noriyuki1113/ossalt-next" target="_blank" rel="noreferrer">
          データと実装を見る <ArrowUpRight size={14} />
        </a>
      </div>
    </footer>
  );
}

function TrustMark({ item }: { item: DirectoryItem }) {
  const verified = item.verification_state === "verified";
  return (
    <span className={verified ? "trust trust-verified" : "trust"}>
      <CheckCircle2 size={13} /> {verified ? "確認済み" : "要確認"}
    </span>
  );
}

function Difficulty({ value }: { value: number | null }) {
  if (!value) return null;
  return (
    <div className="difficulty" aria-label={`移行難易度 ${value}/5`}>
      <span>移行難易度</span>
      <div className="difficulty-bars">
        {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= value ? "on" : ""} />)}
      </div>
      <b>{value}/5</b>
    </div>
  );
}

function ToolCard({ item }: { item: DirectoryItem }) {
  return (
    <article className="tool-card">
      <div className="card-meta">
        <span className="product-chip">{item.product_name}</span>
        <TrustMark item={item} />
      </div>
      <div className="card-title-row">
        <div>
          <p className="replaces">OPEN SOURCE ALTERNATIVE</p>
          <h3>{item.project_name}</h3>
        </div>
        <span className="arrow-badge"><ArrowUpRight size={17} /></span>
      </div>
      <p className="description">{item.short_description_ja}</p>
      <div className="facts">
        {item.license_spdx && <span>{item.license_spdx}</span>}
        {item.docker_available && <span>Self-host</span>}
        {item.category && <span>{item.category}</span>}
      </div>
      <Difficulty value={item.migration_difficulty} />
      <div className="card-links">
        <Link className="primary-link" to={`/alternatives/${item.product_slug}`}>
          比較を見る <ArrowRight size={14} />
        </Link>
        {item.repository_url && <a href={item.repository_url} target="_blank" rel="noreferrer"><Github size={14} /> Repository</a>}
      </div>
    </article>
  );
}

function FeaturedPair({ item, index }: { item: DirectoryItem; index: number }) {
  return (
    <Link className={`feature-pair feature-${index + 1}`} to={`/alternatives/${item.product_slug}`}>
      <div className="pair-label">POPULAR PAIR</div>
      <div className="pair-names">
        <span>{item.product_name}</span><ArrowRight size={18} /><strong>{item.project_name}</strong>
      </div>
      <p>{item.short_description_ja}</p>
      <div className="pair-footer">
        <span>{item.license_spdx || "License check"}</span>
        <span>詳しく見る <ArrowUpRight size={13} /></span>
      </div>
    </Link>
  );
}

function HomePage() {
  const items = useDirectoryItems();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("すべて");

  const categories = useMemo(
    () => ["すべて", ...Array.from(new Set(items.map((item) => item.category).filter(Boolean) as string[])).slice(0, 8)],
    [items],
  );

  const visibleItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((item) => {
      const text = [item.product_name, item.product_name_ja, item.project_name, item.project_name_ja, item.category]
        .filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !keyword || text.includes(keyword);
      const matchesCategory = category === "すべて" || item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [items, query, category]);

  const stats = useMemo(() => ({
    products: new Set(items.map((item) => item.product_slug)).size,
    projects: new Set(items.map((item) => item.project_slug)).size,
    verified: items.filter((item) => item.verification_state === "verified").length,
  }), [items]);

  const featured = items.slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero-badge"><Sparkles size={14} /> 日本語のOSS移行ディレクトリ</div>
        <h1>SaaSをやめる前に、<br /><em>選択肢を知ろう。</em></h1>
        <p className="hero-copy">
          Notion、Slack、Zapier、Firebase。<br className="desktop-break" />
          いつものSaaSに代わるOSSを、移行の現実まで含めて比較します。
        </p>

        <label className="searchbox">
          <Search size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例：Notion、Slack、Firebase"
          />
          <span className="search-hint">⌘ K</span>
        </label>

        <div className="chips">
          <span>人気:</span>
          {popularServices.map((name) => <button key={name} onClick={() => setQuery(name)}>{name}</button>)}
        </div>

        <div className="hero-stats">
          <div><strong>{stats.products}</strong><span>SaaS</span></div>
          <div><strong>{stats.projects}</strong><span>OSS候補</span></div>
          <div><strong>{stats.verified}</strong><span>レビュー済み関係</span></div>
        </div>
      </section>

      <section className="feature-showcase">
        <div className="section-intro">
          <div><span className="section-kicker">CURATED PICKS</span><h2>まずは、よく使われる組み合わせから。</h2></div>
          <p>「OSSだから良い」ではなく、実際に置き換え候補として検討しやすい組み合わせを掲載しています。</p>
        </div>
        <div className="feature-grid">{featured.map((item, index) => <FeaturedPair key={item.relation_id} item={item} index={index} />)}</div>
      </section>

      <section className="method" id="method">
        <div className="section-intro method-heading">
          <div><span className="section-kicker">HOW OSSALT WORKS</span><h2>検索サイトではなく、<br />移行判断のための場所。</h2></div>
          <div className="principle"><ShieldCheck size={18} /><span>一次情報を確認してから公開</span></div>
        </div>
        <div className="journey-grid">
          {journeys.map((journey) => (
            <article key={journey.number}>
              <span className="step-number">{journey.number}</span>
              <h3>{journey.title}</h3>
              <p>{journey.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="directory" id="directory">
        <div className="section-intro directory-heading">
          <div><span className="section-kicker">DIRECTORY</span><h2>OSS代替候補を探す</h2></div>
          <p>{visibleItems.length} 件を表示中</p>
        </div>
        <div className="filter-row">
          {categories.map((name) => (
            <button key={name} className={category === name ? "filter active" : "filter"} onClick={() => setCategory(name)}>{name}</button>
          ))}
        </div>
        <div className="cards">{visibleItems.map((item) => <ToolCard item={item} key={item.relation_id} />)}</div>
        {visibleItems.length === 0 && <div className="empty-state"><Search size={24} /><h3>候補が見つかりません</h3><p>サービス名を短くするか、カテゴリを「すべて」に戻してください。</p></div>}
      </section>

      <section className="editorial">
        <div className="editorial-copy">
          <span className="section-kicker">EDITORIAL POLICY</span>
          <h2>「オープンソース」だけでは、<br />掲載理由になりません。</h2>
          <p>公式リポジトリ、ライセンス、移行先としての妥当性を確認し、レビューを通過した候補だけを公開します。</p>
          <a href="https://github.com/noriyuki1113/ossalt-next" target="_blank" rel="noreferrer">レビューの仕組みを見る <ArrowUpRight size={14} /></a>
        </div>
        <div className="editorial-list">
          {["公式サイト・リポジトリを確認", "ライセンス条件を記録", "移行難易度を5段階で整理", "スポンサーと通常順位を分離"].map((text) => (
            <div key={text}><span><Check size={15} /></span>{text}</div>
          ))}
        </div>
      </section>
    </>
  );
}

function AlternativesPage() {
  const { slug } = useParams();
  const items = useDirectoryItems();
  const candidates = items.filter((item) => item.product_slug === slug);
  const productName = candidates[0]?.product_name;

  if (!productName) return (
    <section className="not-found">
      <p className="section-kicker">NOT FOUND</p><h1>この比較ページは準備中です。</h1><Link to="/">トップへ戻る</Link>
    </section>
  );

  return (
    <section className="alternatives-page">
      <div className="breadcrumb"><Link to="/"><ArrowLeft size={14} /> トップ</Link><span>/</span><span>{productName}</span></div>
      <div className="comparison-hero">
        <span className="section-kicker">OSS ALTERNATIVES</span>
        <h1>{productName} の<br />代替OSS</h1>
        <p>{productName}を置き換えるときに見るべき、ライセンス・運用・移行難易度を候補ごとに整理しました。</p>
        <div className="comparison-meta"><span>{candidates.length} candidates</span><span><ShieldCheck size={14} /> reviewed data</span></div>
      </div>

      <div className="candidate-stack">
        {candidates.map((item, index) => (
          <article key={item.relation_id} className="candidate-detail">
            <div className="candidate-index">0{index + 1}</div>
            <div className="candidate-main">
              <div className="candidate-head"><div><TrustMark item={item} /><h2>{item.project_name}</h2><p>{item.short_description_ja}</p></div><Difficulty value={item.migration_difficulty} /></div>
              <div className="detail-grid">
                <div><h3>向いている点</h3><ul>{item.strengths_ja?.map((strength) => <li key={strength}><Check size={13} />{strength}</li>)}</ul></div>
                <div><h3>注意点</h3><ul>{item.constraints_ja?.map((constraint) => <li key={constraint}><span>!</span>{constraint}</li>)}</ul></div>
              </div>
              <div className="migration-note"><span>移行メモ</span><p>{item.migration_summary_ja}</p></div>
              <div className="candidate-actions">
                {item.official_url && <a className="button button-primary" href={item.official_url} target="_blank" rel="noreferrer">公式サイト <ArrowUpRight size={14} /></a>}
                {item.repository_url && <a className="button" href={item.repository_url} target="_blank" rel="noreferrer"><Github size={14} /> GitHub</a>}
                {item.license_spdx && <span className="license-label">{item.license_spdx}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Site() {
  return <div className="app-shell"><Header /><main><Routes><Route path="/" element={<HomePage />} /><Route path="/alternatives/:slug" element={<AlternativesPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></main><Footer /></div>;
}

export function App() {
  return <BrowserRouter><Site /></BrowserRouter>;
}
