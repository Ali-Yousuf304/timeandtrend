import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryStat {
  key: string;
  count: number;
}

export function CollectionsAdmin() {
  const [byCategory, setByCategory] = React.useState<CategoryStat[] | null>(null);
  const [byStyle, setByStyle] = React.useState<CategoryStat[] | null>(null);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.from("products").select("category,style");
      const cats: Record<string, number> = {};
      const styles: Record<string, number> = {};
      (data ?? []).forEach((row) => {
        cats[row.category] = (cats[row.category] ?? 0) + 1;
        styles[row.style] = (styles[row.style] ?? 0) + 1;
      });
      setByCategory(
        Object.entries(cats).map(([key, count]) => ({ key, count })),
      );
      setByStyle(Object.entries(styles).map(([key, count]) => ({ key, count })));
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Collections</h2>
        <p className="text-sm text-muted-foreground">
          Collections are auto-generated from product categories and styles. Edit a product
          to move it between collections.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CollectionCard title="By category" stats={byCategory} />
        <CollectionCard title="By style" stats={byStyle} />
      </div>
    </div>
  );
}

function CollectionCard({
  title,
  stats,
}: {
  title: string;
  stats: CategoryStat[] | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {!stats ? (
        <Skeleton className="mt-4 h-24" />
      ) : stats.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No products yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {stats.map((s) => (
            <li key={s.key} className="flex items-center justify-between py-2.5">
              <span className="text-sm font-medium capitalize">{s.key}</span>
              <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-semibold">
                {s.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
