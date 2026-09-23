import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";
import { fetchSiteData, type SiteData } from "./site-data";

const SiteDataContext = createContext<SiteData | null>(null);

// `refresh`: after the first render, re-query Supabase so a prerendered snapshot doesn't
// stay stale between deploys. Off during server rendering (effects don't run there anyway).
export function SiteDataProvider({ initial, refresh = true, children }: { initial: SiteData; refresh?: boolean; children: ReactNode }) {
  const [data, setData] = useState(initial);

  useEffect(() => {
    if (!refresh || !supabase) return;
    let cancelled = false;
    fetchSiteData(supabase)
      .then(fresh => {
        if (!cancelled && fresh.items.length) setData(fresh);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return <SiteDataContext.Provider value={data}>{children}</SiteDataContext.Provider>;
}

export function useSiteData(): SiteData {
  const data = useContext(SiteDataContext);
  if (!data) throw new Error("useSiteData must be used inside SiteDataProvider");
  return data;
}

export function useDirectoryItems() {
  return useSiteData().items;
}

export function useReferenceNow(): number {
  return Date.parse(useSiteData().generatedAt);
}
