import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Site, collectionKeys } from "./App";
import { HeadCollectorProvider, type HeadCollector } from "./lib/head";
import { SiteDataProvider } from "./lib/site-context";
import { categoryScope, itemInCategories, uniqueByProject, type SiteData } from "./lib/site-data";

// Consumed by scripts/prerender.mjs after `vite build --ssr`.
export { fetchSiteData, fallbackSiteData } from "./lib/site-data";
export { SITE_URL } from "./lib/head";

export function render(url: string, data: SiteData): { html: string; head: HeadCollector } {
  const head: HeadCollector = { jsonLd: {} };
  const html = renderToString(
    <HeadCollectorProvider collector={head}>
      <SiteDataProvider initial={data} refresh={false}>
        <StaticRouter location={url}><Site /></StaticRouter>
      </SiteDataProvider>
    </HeadCollectorProvider>,
  );
  return { html, head };
}

// Every indexable route that has real content in this snapshot. Anything else (guide
// pages without a published guide, empty categories, 404s) is left to the SPA fallback.
export function routesFor(data: SiteData): string[] {
  const projects = uniqueByProject(data.items);
  const guidedTools = new Set(data.guides.map(guide => guide.tool_id));
  const routes = [
    "/", "/categories", "/licenses", "/collections", "/about", "/editorial-policy",
    ...collectionKeys.map(key => `/collections/${key}`),
    ...[...new Set(data.items.map(item => item.product_slug))].map(slug => `/alternatives/${slug}`),
    ...projects.map(item => `/projects/${item.project_slug}`),
    ...data.categories
      .filter(category => projects.some(item => itemInCategories(item, categoryScope(category, data.categories))))
      .map(category => `/categories/${category.slug}`),
    ...data.licenses
      .filter(license => projects.some(item => item.license_slug === license.slug))
      .map(license => `/licenses/${license.slug}`),
    ...data.items
      .filter(item => guidedTools.has(item.project_id))
      .map(item => `/guides/${item.product_slug}/${item.project_slug}`),
  ];
  return [...new Set(routes)];
}
