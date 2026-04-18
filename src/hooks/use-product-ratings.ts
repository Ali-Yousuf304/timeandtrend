import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

interface RatingSummary {
  average: number;
  count: number;
}

const cache = new Map<string, RatingSummary>();
let bulkPromise: Promise<void> | null = null;

async function loadAll() {
  const { data } = await supabase
    .from("reviews")
    .select("product_id,rating")
    .eq("enabled", true);

  const grouped = new Map<string, { sum: number; count: number }>();
  for (const r of data ?? []) {
    const g = grouped.get(r.product_id) ?? { sum: 0, count: 0 };
    g.sum += r.rating;
    g.count += 1;
    grouped.set(r.product_id, g);
  }
  cache.clear();
  for (const [id, { sum, count }] of grouped) {
    cache.set(id, { average: count ? sum / count : 0, count });
  }
}

export function useAllProductRatings() {
  const [version, setVersion] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    if (!bulkPromise) bulkPromise = loadAll();
    bulkPromise.then(() => {
      if (!cancelled) setVersion((v) => v + 1);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return React.useCallback(
    (productId: string): RatingSummary => cache.get(productId) ?? { average: 0, count: 0 },
    [version],
  );
}

export function useProductRating(productId: string | undefined) {
  const [summary, setSummary] = React.useState<RatingSummary>({ average: 0, count: 0 });

  React.useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", productId)
      .eq("enabled", true)
      .then(({ data }) => {
        if (cancelled) return;
        const count = data?.length ?? 0;
        const average = count ? (data ?? []).reduce((s, r) => s + r.rating, 0) / count : 0;
        setSummary({ average, count });
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return summary;
}
