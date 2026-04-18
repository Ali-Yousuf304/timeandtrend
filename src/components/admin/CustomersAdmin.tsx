import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Mail, Phone, MapPin, Package as PackageIcon } from "lucide-react";

interface OrderRow {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
}

interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

interface Customer {
  user_id: string;
  profile: ProfileRow | null;
  orders: OrderRow[];
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
}

export function CustomersAdmin() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<Customer | null>(null);

  React.useEffect(() => {
    (async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select(
          "id,user_id,total,status,created_at,shipping_name,shipping_phone,shipping_address_line1,shipping_address_line2,shipping_city,shipping_state,shipping_postal_code,shipping_country",
        )
        .order("created_at", { ascending: false });

      if (!orders) {
        setLoading(false);
        return;
      }

      const userIds = Array.from(new Set(orders.map((o) => o.user_id)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select(
          "id,email,display_name,phone,address_line1,address_line2,city,state,postal_code,country",
        )
        .in("id", userIds);

      const profileMap = new Map<string, ProfileRow>();
      (profiles ?? []).forEach((p) => profileMap.set(p.id, p as ProfileRow));

      const grouped = new Map<string, Customer>();
      for (const o of orders as OrderRow[]) {
        const c = grouped.get(o.user_id);
        if (c) {
          c.orders.push(o);
          c.totalOrders += 1;
          c.totalSpent += Number(o.total);
        } else {
          grouped.set(o.user_id, {
            user_id: o.user_id,
            profile: profileMap.get(o.user_id) ?? null,
            orders: [o],
            totalOrders: 1,
            totalSpent: Number(o.total),
            lastOrderAt: o.created_at,
          });
        }
      }
      setCustomers(Array.from(grouped.values()));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold">Customers</h2>
        <p className="text-sm text-muted-foreground">
          All customers who have placed at least one order.
        </p>
      </div>

      {loading ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Loading customers…
        </p>
      ) : customers.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No customers yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Spent</th>
                <th className="px-4 py-3">Last order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.user_id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {c.profile?.display_name ??
                        c.orders[0]?.shipping_name ??
                        "Unnamed"}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {c.user_id.slice(0, 8)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{c.profile?.email ?? "—"}</p>
                    <p>{c.profile?.phone ?? c.orders[0]?.shipping_phone ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {c.totalOrders}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[var(--gold)]">
                    ${c.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(c.lastOrderAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(c)}
                    >
                      <Eye className="mr-1 h-4 w-4" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selected?.profile?.display_name ??
                selected?.orders[0]?.shipping_name ??
                "Customer details"}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Total orders</p>
                  <p className="text-xl font-bold">{selected.totalOrders}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Total spent</p>
                  <p className="text-xl font-bold text-[var(--gold)]">
                    ${selected.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Avg order</p>
                  <p className="text-xl font-bold">
                    $
                    {Math.round(
                      selected.totalSpent / selected.totalOrders,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Personal info
                </h4>
                <div className="space-y-1.5 text-sm">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {selected.profile?.email ?? "—"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selected.profile?.phone ??
                      selected.orders[0]?.shipping_phone ??
                      "—"}
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span>
                      {[
                        selected.orders[0]?.shipping_address_line1 ??
                          selected.profile?.address_line1,
                        selected.orders[0]?.shipping_address_line2 ??
                          selected.profile?.address_line2,
                        selected.orders[0]?.shipping_city ??
                          selected.profile?.city,
                        selected.orders[0]?.shipping_state ??
                          selected.profile?.state,
                        selected.orders[0]?.shipping_postal_code ??
                          selected.profile?.postal_code,
                        selected.orders[0]?.shipping_country ??
                          selected.profile?.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <PackageIcon className="h-3.5 w-3.5" /> Order history
                </h4>
                <ul className="divide-y divide-border text-sm">
                  {selected.orders.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">
                          #{o.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString()} ·{" "}
                          <span className="capitalize">{o.status}</span>
                        </p>
                      </div>
                      <span className="font-semibold text-[var(--gold)]">
                        ${Number(o.total).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
