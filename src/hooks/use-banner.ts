import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  eyebrow: string | null;
  image: string;
  cta_label: string | null;
  cta_link: string | null;
  active: boolean;
  sort_order: number;
}

export function useActiveBanner() {
  const [banner, setBanner] = React.useState<Banner | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      setBanner(data as Banner | null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { banner, loading };
}
