import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { OrderDetailsModal, type AdminOrderFull } from "./OrderDetailsModal";
import { cn } from "@/lib/utils";

export function OrdersAdmin() {
  const [orders, setOrders] = React.useState<AdminOrderFull[]>([]);
  const [openId, setOpenId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select(
        "*, order_items(product_name,product_image,quantity,unit_price)",
      )
      .order("created_at", { ascending: false });
    if (data) setOrders(data as unknown as AdminOrderFull[]);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openOrder = orders.find((o) => o.id === openId) ?? null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold">Orders</h2>
        <p className="text-sm text-muted-foreground">
          Click View Details to see and manage each order.
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="hidden w-full text-sm md:table">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Fulfillment</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{o.shipping_name ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    Rs. {Number(o.total).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Pill status={o.payment_status} kind="payment" />
                  </td>
                  <td className="px-4 py-3">
                    <Pill status={o.fulfillment_status} kind="fulfillment" />
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {o.order_items.length}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setOpenId(o.id)}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" /> View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="divide-y divide-border md:hidden">
            {orders.map((o) => (
              <li key={o.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm font-medium">{o.shipping_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-semibold text-[var(--gold)]">
                    Rs. {Number(o.total).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Pill status={o.payment_status} kind="payment" />
                  <Pill status={o.fulfillment_status} kind="fulfillment" />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setOpenId(o.id)}
                >
                  <Eye className="mr-1 h-3.5 w-3.5" /> View Details
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <OrderDetailsModal
        order={openOrder}
        onClose={() => setOpenId(null)}
        onUpdated={load}
      />
    </div>
  );
}

function Pill({ status, kind }: { status: string; kind: "payment" | "fulfillment" }) {
  const map: Record<string, string> = {
    paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    refunded: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
    fulfilled: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    shipped: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
    delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    unfulfilled: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  };
  const prefix = kind === "payment" && status !== "paid" ? "○ " : "● ";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
        map[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {prefix}
      {status}
    </span>
  );
}
