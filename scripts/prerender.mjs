// Runs after `vite build` and `vite build --ssr src/entry-server.tsx`: renders every
// route to static HTML in dist/, plus dist/site-data.json (the snapshot the pages were
// rendered from, used by the browser to hydrate), dist/spa.html (the empty SPA shell for
// routes that weren't prerendered) and dist/sitemap.xml.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "vite";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = path.join(root, "dist");
const server = await import(pathToFileURL(path.join(root, "dist-server", "entry-server.js")).href);

const env = { ...loadEnv("production", root, "VITE_"), ...process.env };
const supabaseUrl = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

let data;
if (supabaseUrl && anonKey && anonKey !== "replace-with-your-supabase-anon-key") {
  // Fail the build rather than publish a near-empty site if Supabase is unreachable.
  data = await server.fetchSiteData(createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } }));
  if (data.items.length === 0) throw new Error("Supabase returned no published items; refusing to prerender an empty site.");
} else {
  console.warn("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — prerendering with fallback demo data.");
  data = server.fallbackSiteData();
}

const escapeHtml = value => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// JSON inside <script> must not be able to close the tag.
const escapeScriptJson = json => json.replace(/</g, "\\u003c");

function applyHead(template, head) {
  let html = template;
  // Function replacers throughout: a string replacement would interpret "$&", "$'" etc.
  // inside page content (e.g. dollar prices) as substitution patterns.
  if (head.title) html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeHtml(head.title)}</title>`);
  const set = (pattern, value) => {
    html = html.replace(pattern, (_, before, after) => `${before}${escapeHtml(value)}${after}`);
  };
  if (head.description) {
    set(/(<meta name="description" content=")[^"]*(")/, head.description);
    set(/(<meta property="og:description" content=")[^"]*(")/, head.description);
  }
  if (head.title) set(/(<meta property="og:title" content=")[^"]*(")/, head.title);
  if (head.path) {
    const url = `${server.SITE_URL}${head.path}`;
    set(/(<link rel="canonical" href=")[^"]*(")/, url);
    set(/(<meta property="og:url" content=")[^"]*(")/, url);
  }
  const jsonLd = Object.entries(head.jsonLd)
    .map(([id, json]) => `<script type="application/ld+json" id="${escapeHtml(id)}">${escapeScriptJson(json)}</script>`)
    .join("");
  return html.replace("</head>", () => `${jsonLd}</head>`);
}

const template = await readFile(path.join(dist, "index.html"), "utf8");
if (!template.includes('<div id="root"></div>')) throw new Error('dist/index.html is missing <div id="root"></div>');

await writeFile(path.join(dist, "spa.html"), template);
await writeFile(path.join(dist, "site-data.json"), JSON.stringify(data));

const routes = server.routesFor(data);
for (const route of routes) {
  const { html, head } = server.render(route, data);
  const page = applyHead(template, head).replace(
    '<div id="root"></div>',
    () => `<div id="root" data-route="${escapeHtml(route)}">${html}</div>`,
  );
  const file = path.join(dist, route === "/" ? "index.html" : `${route.slice(1)}.html`);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, page);
}

const lastmod = data.generatedAt.slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url><loc>${escapeHtml(`${server.SITE_URL}${route}`)}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n")}
</urlset>
`;
await writeFile(path.join(dist, "sitemap.xml"), sitemap);

console.log(`Prerendered ${routes.length} routes (${data.items.length} directory rows, snapshot ${data.generatedAt}).`);
