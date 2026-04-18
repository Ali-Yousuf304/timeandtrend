import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  sales: number;
  orderCount: number;
  activeProducts: number;
  pendingOrders: number;
}

export function DashboardOverview() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = React.useState<
    { id: string; total: number; status: string; created_at: string; shipping_name: string | null }[]
  >([]);

  React.useEffect(() => {
    (async () => {
      const [{ data: orders }, { count: productCount }] = await Promise.all([
        supabase
          .from("orders")
          .select("id,total,status,created_at,shipping_name")
          .order("created_at", { ascending: false }),
        supabase.from("products").select("*", { count: "exact", head: true }),
      ]);

      const allOrders = orders ?? [];
      const sales = allOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total), 0);
      const pending = allOrders.filter(
        (o) => o.status === "pending" || o.status === "processing",
      ).length;

      setStats({
        sales,
        orderCount: allOrders.length,
        activeProducts: productCount ?? 0,
        pendingOrders: pending,
      });
      setRecentOrders(allOrders.slice(0, 5));
    })();
  }, []);

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Sales",
      value: `Rs. ${stats.sales.toLocaleString()}`,
      icon: DollarSign,
      tone: "text-[var(--gold)]",
    },
    {
      label: "Orders",
      value: stats.orderCount.toString(),
      icon: ShoppingBag,
      tone: "text-foreground",
    },
    {
      label: "Active Products",
      value: stats.activeProducts.toString(),
      icon: Package,
      tone: "text-foreground",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders.toString(),
      icon: TrendingUp,
      tone: "text-foreground",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Overview of your store performance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {c.label}
              </p>
              <c.icon className={`h-5 w-5 ${c.tone}`} />
            </div>
            <p className={`mt-3 font-display text-3xl font-bold ${c.tone}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-display text-lg font-semibold">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
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
