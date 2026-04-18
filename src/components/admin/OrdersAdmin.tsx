import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AdminOrder {
  id: string;
  user_id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_name: string | null;
  shipping_city: string | null;
  order_items: { product_name: string; quantity: number; unit_price: number }[];
}

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export function OrdersAdmin() {
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);

  const load = React.useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select(
        "id,user_id,status,total,created_at,shipping_name,shipping_city, order_items(product_name,quantity,unit_price)",
      )
      .order("created_at", { ascending: false });
    if (data) setOrders(data as AdminOrder[]);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: status as (typeof STATUSES)[number] })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Order updated");
      load();
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-2xl font-bold">Orders</h2>
        <p className="text-sm text-muted-foreground">Track and update order status.</p>
      </div>

      {orders.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No orders yet.
        </p>
      )}
      {orders.map((o) => (
        <div key={o.id} className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
              <p className="text-sm">
                {o.shipping_name ?? "—"} · {o.shipping_city ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-[var(--gold)]">
                Rs. {Number(o.total).toLocaleString()}
              </span>
              <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {o.order_items.map((it, i) => (
              <li key={i} className="flex justify-between text-muted-foreground">
                <span>
                  {it.product_name} × {it.quantity}
                </span>
                <span>Rs. {(it.unit_price * it.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
