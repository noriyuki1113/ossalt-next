import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, GitCompareArrows, Github, Menu, Search, ShieldCheck, X } from "lucide-react";
import { supabase } from "./lib/supabase";
import { fallbackItems } from "./lib/fallback-data";
import type { DirectoryItem } from "./lib/types";

const journeys = [
  { number: "01", title: "サービスから探す", body: "今使っているSaaS名から、置き換え候補となるOSSを見つける。" },
  { number: "02", title: "条件を比較する", body: "費用だけでなく、ライセンス、運用負担、移行の注意点を比較する。" },
  { number: "03", title: "導入前に確認する", body: "公式情報、更新状況、セルフホストの前提を確認して判断する。" },
];

function TrustMark({ item }: { item: DirectoryItem }) {
  const label = item.verification_state === "verified" ? "情報を確認済み" : "公式情報を確認";
  return <span className="trust"><CheckCircle2 size={14} /> {label}</span>;
}

export function App() {
  const [items, setItems] = useState<DirectoryItem[]>(fallbackItems);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("published_alternative_directory").select("*").limit(30).then(({ data, error }) => {
      if (!error && data && data.length > 0) setItems(data as DirectoryItem[]);
    });
  }, []);

  const visibleItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => [item.product_name, item.product_name_ja, item.project_name, item.project_name_ja, item.category]
      .filter(Boolean).join(" ").toLowerCase().includes(keyword));
  }, [items, query]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#"><span>O</span>ossalt</a>
        <nav className={menuOpen ? "nav nav-open" : "nav"}>
          <a href="#find">サービスから探す</a><a href="#compare">比較する</a><a href="#guides">導入ガイド</a><a href="#about">信頼方針</a>
        </nav>
        <button className="menu" onClick={() => setMenuOpen((open) => !open)} aria-label="メニュー">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">OSS MIGRATION NAVIGATOR</p>
          <h1>使っているSaaSを、<em>次の選択肢へ。</em></h1>
          <p className="hero-copy">OSSを眺めるためではなく、移行を判断するための日本語ガイド。</p>
          <label className="searchbox">
            <Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="置き換えたいサービス名を入力（例：Notion）" />
          </label>
          <div className="chips">{["Notion", "Slack", "Figma", "Zapier"].map((name) => <button key={name} onClick={() => setQuery(name)}>{name}</button>)}</div>
          <p className="hero-note"><ShieldCheck size={15} /> 比較順位とスポンサー掲載は分離しています</p>
        </section>

        <section className="journey" id="find">
          <div className="section-heading"><p className="eyebrow">HOW IT WORKS</p><h2>移行判断を、3つのステップで。</h2></div>
          <div className="journey-grid">{journeys.map((journey) => <article key={journey.number}><span>{journey.number}</span><h3>{journey.title}</h3><p>{journey.body}</p></article>)}</div>
        </section>

        <section className="directory" id="compare">
          <div className="section-heading split"><div><p className="eyebrow">START WITH A SERVICE</p><h2>いま使っているサービスから探す</h2></div><p>検索結果は、公式情報・ライセンス・更新状況を確認する導線とともに表示します。</p></div>
          <div className="cards">
            {visibleItems.map((item) => <article className="tool-card" key={item.relation_id}>
              <div className="card-top"><div><p className="replaces">{item.product_name} の代替候補</p><h3>{item.project_name}</h3></div><TrustMark item={item} /></div>
              <p className="description">{item.short_description_ja}</p>
              <div className="facts">
                {item.license_spdx && <span>{item.license_spdx}</span>}
                {item.docker_available && <span>Docker</span>}
                {item.migration_difficulty && <span>移行難易度 {item.migration_difficulty}/5</span>}
              </div>
              <p className="summary">{item.migration_summary_ja}</p>
              <div className="card-links">
                {item.official_url && <a href={item.official_url} target="_blank" rel="noreferrer">公式サイト <ArrowUpRight size={14} /></a>}
                {item.repository_url && <a href={item.repository_url} target="_blank" rel="noreferrer"><Github size={14} /> GitHub</a>}
              </div>
            </article>)}
          </div>
          {visibleItems.length === 0 && <p className="empty">一致する候補がありません。サービス名を短くしてお試しください。</p>}
        </section>

        <section className="guides" id="guides"><div><p className="eyebrow">BEFORE YOU MIGRATE</p><h2>導入前に確認すること</h2></div><div className="guide-list"><p><b>01</b> ライセンスと商用利用の条件</p><p><b>02</b> ホスティング・バックアップ・運用体制</p><p><b>03</b> データ移行とチームへの展開方法</p></div></section>
      </main>

      <footer id="about"><div><a className="brand" href="#"><span>O</span>ossalt</a><p>SaaSからOSSへの移行を、日本語で探し、比べ、判断する。</p></div><div><p>掲載情報は公開データと公式情報をもとにします。スポンサーは明示し、通常の比較順位には影響しません。</p><a href="https://github.com/noriyuki1113/ossalt-next" target="_blank" rel="noreferrer">GitHubで見る <ArrowUpRight size={14} /></a></div></footer>
    </div>
  );
}
