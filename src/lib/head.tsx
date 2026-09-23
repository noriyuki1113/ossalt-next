import { createContext, useContext, useEffect, type ReactNode } from "react";

export const SITE_URL = "https://ossalt-next.vercel.app";

// During server rendering there's no document, so page metadata is recorded into this
// collector synchronously while rendering and written into the HTML by the prerender
// script. In the browser the collector is absent and the effects update document.head.
export type HeadCollector = {
  title?: string;
  description?: string;
  path?: string;
  jsonLd: Record<string, string>;
};

const HeadCollectorContext = createContext<HeadCollector | null>(null);

export function HeadCollectorProvider({ collector, children }: { collector: HeadCollector; children: ReactNode }) {
  return <HeadCollectorContext.Provider value={collector}>{children}</HeadCollectorContext.Provider>;
}

export function usePageMeta(title: string, description: string, path = "/") {
  const collector = useContext(HeadCollectorContext);
  if (collector) Object.assign(collector, { title, description, path });

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

    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", `${SITE_URL}${path}`);
  }, [title, description, path]);
}

export function useJsonLd(id: string, data: unknown | null) {
  const collector = useContext(HeadCollectorContext);
  const json = data ? JSON.stringify(data) : null;
  if (collector && json) collector.jsonLd[id] = json;

  useEffect(() => {
    if (!json) {
      document.getElementById(id)?.remove();
      return;
    }
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = json;
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [id, json]);
}
