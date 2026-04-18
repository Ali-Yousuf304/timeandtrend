import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Time & Trend" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

interface DbProduct {
  id: string;
  name: string;
  tagline: string;
  price: number;
  old_price: number | null;
  image: string;
  category: "men" | "women" | "unisex";
  style: "casual" | "formal" | "sports";
  badges: string[] | null;
  rating: number;
  description: string;
}

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

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading) return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-display text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You need admin privileges to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-8">
      <h1 className="font-display text-4xl font-bold">Admin Panel</h1>
      <Tabs defaultValue="products" className="mt-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductsAdmin />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProductsAdmin() {
  const [items, setItems] = React.useState<DbProduct[]>([]);
  const [editing, setEditing] = React.useState<Partial<DbProduct> | null>(null);

  const load = React.useCallback(async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setItems(data as DbProduct[]);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!editing) return;
    const payload = {
      name: editing.name ?? "",
      tagline: editing.tagline ?? "",
      price: Number(editing.price ?? 0),
      old_price: editing.old_price ? Number(editing.old_price) : null,
      image: editing.image ?? "",
      category: (editing.category ?? "men") as DbProduct["category"],
      style: (editing.style ?? "casual") as DbProduct["style"],
      badges: editing.badges ?? [],
      rating: Number(editing.rating ?? 5),
      description: editing.description ?? "",
    };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      setEditing(null);
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  }

  return (
    <div className="mt-6">
      <Button
        onClick={() => setEditing({})}
        className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
      >
        <Plus className="h-4 w-4" /> New product
      </Button>

      {editing && (
        <div className="mt-4 space-y-3 rounded-lg border border-border bg-card p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                value={editing.name ?? ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Tagline</Label>
              <Input
                value={editing.tagline ?? ""}
                onChange={(e) => setEditing({ ...editing, tagline: e.target.value })}
              />
            </div>
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                value={editing.price ?? ""}
                onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Old price (optional)</Label>
              <Input
                type="number"
                value={editing.old_price ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    old_price: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Image URL</Label>
              <Input
                value={editing.image ?? ""}
                onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={editing.category ?? "men"}
                onValueChange={(v) =>
                  setEditing({ ...editing, category: v as DbProduct["category"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Style</Label>
              <Select
                value={editing.style ?? "casual"}
                onValueChange={(v) =>
                  setEditing({ ...editing, style: v as DbProduct["style"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={save}
              className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
            >
              Save
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No admin-managed products yet. Built-in catalog still shows on the storefront.
          </p>
        )}
        {items.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
          >
            {p.image && (
              <img
                src={p.image}
                alt=""
                className="h-14 w-14 rounded bg-muted object-contain p-1"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.category} · {p.style} · ${Number(p.price).toLocaleString()}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setEditing(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersAdmin() {
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
    <div className="mt-6 space-y-3">
      {orders.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No orders yet.
        </p>
      )}
      {orders.map((o) => (
        <div key={o.id} className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-muted-foreground">
                #{o.id.slice(0, 8)}
              </p>
              <p className="text-sm">
                {o.shipping_name ?? "—"} · {o.shipping_city ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-[var(--gold)]">
                ${Number(o.total).toLocaleString()}
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
                <span>${(it.unit_price * it.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
