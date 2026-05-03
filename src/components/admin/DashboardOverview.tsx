import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  Eye,
  ShoppingCart,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type RangeKey = "today" | "yesterday" | "7d" | "30d" | "90d" | "all";

const ranges: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "90d", label: "Last 90 Days" },
  { key: "all", label: "Maximum" },
];

function rangeBounds(key: RangeKey): { from: Date | null; to: Date | null } {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  if (key === "today") return { from: startOfToday, to: null };
  if (key === "yesterday") {
    const y = new Date(startOfToday);
    y.setDate(y.getDate() - 1);
    return { from: y, to: startOfToday };
  }
  if (key === "7d") {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - 6);
    return { from: d, to: null };
  }
  if (key === "30d") {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - 29);
    return { from: d, to: null };
  }
  if (key === "90d") {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - 89);
    return { from: d, to: null };
  }
  return { from: null, to: null };
}

interface Stats {
  sales: number;
  orderCount: number;
  activeProducts: number;
  pendingOrders: number;
  pageViews: number;
  addToCartCount: number;
}

interface TopProduct {
  id: string;
  name: string;
  image: string | null;
  count: number;
}

export function DashboardOverview() {
  const [range, setRange] = React.useState<RangeKey>("7d");
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = React.useState<
    { id: string; total: number; status: string; created_at: string; shipping_name: string | null }[]
  >([]);
  const [topViewed, setTopViewed] = React.useState<TopProduct[]>([]);
  const [topAdded, setTopAdded] = React.useState<TopProduct[]>([]);

  React.useEffect(() => {
    (async () => {
      setStats(null);
      const { from, to } = rangeBounds(range);

      // Orders
      let oq = supabase.from("orders").select("id,total,status,created_at,shipping_name");
      if (from) oq = oq.gte("created_at", from.toISOString());
      if (to) oq = oq.lt("created_at", to.toISOString());
      const { data: orders } = await oq.order("created_at", { ascending: false });

      // Products count (always all)
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Analytics
      let aq = supabase
        .from("analytics_events")
        .select("event_type,product_id")
        .in("event_type", ["page_view", "add_to_cart", "product_view"]);
      if (from) aq = aq.gte("created_at", from.toISOString());
      if (to) aq = aq.lt("created_at", to.toISOString());
      const { data: events } = await aq;

      const allOrders = orders ?? [];
      const sales = allOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total), 0);
      const pending = allOrders.filter(
        (o) => o.status === "pending" || o.status === "processing",
      ).length;

      const evs = events ?? [];
      const pageViews = evs.filter((e) => e.event_type === "page_view").length;
      const addToCartEvents = evs.filter((e) => e.event_type === "add_to_cart");
      const productViewEvents = evs.filter(
        (e) => e.event_type === "product_view" && e.product_id,
      );

      // Top products
      const viewCounts = new Map<string, number>();
      productViewEvents.forEach((e) => {
        if (!e.product_id) return;
        viewCounts.set(e.product_id, (viewCounts.get(e.product_id) ?? 0) + 1);
      });
      const addCounts = new Map<string, number>();
      addToCartEvents.forEach((e) => {
        if (!e.product_id) return;
        addCounts.set(e.product_id, (addCounts.get(e.product_id) ?? 0) + 1);
      });

      const topProductIds = Array.from(
        new Set([...viewCounts.keys(), ...addCounts.keys()]),
      );
      let prodMap = new Map<string, { id: string; name: string; image: string }>();
      if (topProductIds.length) {
        const { data: prods } = await supabase
          .from("products")
          .select("id,name,image")
          .in("id", topProductIds);
        prodMap = new Map((prods ?? []).map((p) => [p.id, p]));
      }

      const toTop = (counts: Map<string, number>): TopProduct[] =>
        Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id, count]) => ({
            id,
            count,
            name: prodMap.get(id)?.name ?? "Unknown product",
            image: prodMap.get(id)?.image ?? null,
          }));

      setTopViewed(toTop(viewCounts));
      setTopAdded(toTop(addCounts));

      setStats({
        sales,
        orderCount: allOrders.length,
        activeProducts: productCount ?? 0,
        pendingOrders: pending,
        pageViews,
        addToCartCount: addToCartEvents.length,
      });
      setRecentOrders(allOrders.slice(0, 5));
    })();
  }, [range]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Overview of your store performance.</p>
      </div>

      {/* Range filter */}
      <div className="flex flex-wrap gap-2">
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              range === r.key
                ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {!stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent>
            {[
              { label: "Total Sales", value: `Rs. ${stats.sales.toLocaleString()}`, icon: DollarSign, tone: "text-[var(--gold)]" },
              { label: "Orders", value: stats.orderCount.toString(), icon: ShoppingBag, tone: "text-foreground" },
              { label: "Pending Orders", value: stats.pendingOrders.toString(), icon: TrendingUp, tone: "text-foreground" },
              { label: "Visitors (Page Views)", value: stats.pageViews.toLocaleString(), icon: Eye, tone: "text-foreground" },
              { label: "Add to Cart", value: stats.addToCartCount.toLocaleString(), icon: ShoppingCart, tone: "text-foreground" },
              { label: "Active Products", value: stats.activeProducts.toString(), icon: Package, tone: "text-foreground" },
            ].map((c) => (
              <CarouselItem key={c.label} className="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {c.label}
                    </p>
                    <c.icon className={`h-5 w-5 ${c.tone}`} />
                  </div>
                  <p className={`mt-3 font-display text-2xl font-bold ${c.tone}`}>{c.value}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}

      {/* Top products */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopProductList title="Most Viewed Products" items={topViewed} label="views" />
        <TopProductList title="Most Added to Cart" items={topAdded} label="adds" />
      </div>

      {/* Recent orders */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-display text-lg font-semibold">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No orders in this range.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">
                    {o.shipping_name ?? "Customer"}{" "}
                    <span className="font-mono text-xs text-muted-foreground">
                      #{o.id.slice(0, 8)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString()} · {o.status}
                  </p>
                </div>
                <span className="font-semibold text-[var(--gold)]">
                  Rs. {Number(o.total).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TopProductList({
  title,
  items,
  label,
}: {
  title: string;
  items: TopProduct[];
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3">
              <span className="w-5 text-center font-mono text-sm text-muted-foreground">
                {i + 1}
              </span>
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-10 w-10 rounded bg-muted object-contain p-0.5"
                />
              )}
              <p className="flex-1 truncate text-sm font-medium">{p.name}</p>
              <span className="text-xs font-semibold text-[var(--gold)]">
                {p.count} {label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
