import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Site } from "./App";
import { SiteDataProvider } from "./lib/site-context";
import { fallbackSiteData, type SiteData } from "./lib/site-data";
import "./styles.css";

function app(data: SiteData) {
  return (
    <StrictMode>
      <SiteDataProvider initial={data}>
        <BrowserRouter><Site /></BrowserRouter>
      </SiteDataProvider>
    </StrictMode>
  );
}

const root = document.getElementById("root")!;
const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

// site-data.json is the build-time snapshot the prerendered HTML was rendered from, so
// hydrating with it reproduces the server markup exactly. Only hydrate when the HTML was
// rendered for this exact route — the SPA fallback may serve it for another path.
fetch("/site-data.json")
  .then(res => (res.ok ? (res.json() as Promise<SiteData>) : null))
  .catch(() => null)
  .then(snapshot => {
    const prerenderedRoute = root.dataset.route;
    if (snapshot && prerenderedRoute !== undefined && normalize(prerenderedRoute) === normalize(location.pathname)) {
      hydrateRoot(root, app(snapshot));
      return;
    }
    root.replaceChildren();
    createRoot(root).render(app(snapshot ?? fallbackSiteData()));
  });
