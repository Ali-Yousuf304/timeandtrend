import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Package } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Time & Trend" },
      { name: "description", content: "Manage your profile, addresses, and orders." },
    ],
  }),
  component: AccountPage,
});

interface Profile {
  display_name: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

interface OrderRow {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: { product_name: string; quantity: number; unit_price: number }[];
}

function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [orders, setOrders] = React.useState<OrderRow[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (data) setProfile(data);

      const { data: ord } = await supabase
        .from("orders")
        .select("id,status,total,created_at, order_items(product_name,quantity,unit_price)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (ord) setOrders(ord as OrderRow[]);
    })();
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        phone: profile.phone,
        address_line1: profile.address_line1,
        address_line2: profile.address_line2,
        city: profile.city,
        state: profile.state,
        postal_code: profile.postal_code,
        country: profile.country,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  }

  function setField<K extends keyof Profile>(k: K, v: Profile[K]) {
    setProfile((p) => (p ? { ...p, [k]: v } : p));
  }

  if (!user || !profile) {
    return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12 md:px-8">
      <h1 className="font-display text-4xl font-bold">My Account</h1>
      <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>

      <Tabs defaultValue="profile" className="mt-8">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form
            onSubmit={saveProfile}
            className="mt-6 max-w-xl space-y-4 rounded-lg border border-border bg-card p-6"
          >
            <div>
              <Label htmlFor="dn">Display name</Label>
              <Input
                id="dn"
                value={profile.display_name ?? ""}
                onChange={(e) => setField("display_name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ph">Phone</Label>
              <Input
                id="ph"
                value={profile.phone ?? ""}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="address">
          <form
            onSubmit={saveProfile}
            className="mt-6 max-w-xl space-y-4 rounded-lg border border-border bg-card p-6"
          >
            <div>
              <Label htmlFor="a1">Address line 1</Label>
              <Input
                id="a1"
                value={profile.address_line1 ?? ""}
                onChange={(e) => setField("address_line1", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="a2">Address line 2</Label>
              <Input
                id="a2"
                value={profile.address_line2 ?? ""}
                onChange={(e) => setField("address_line2", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profile.city ?? ""}
                  onChange={(e) => setField("city", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={profile.state ?? ""}
                  onChange={(e) => setField("state", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pc">Postal code</Label>
                <Input
                  id="pc"
                  value={profile.postal_code ?? ""}
                  onChange={(e) => setField("postal_code", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="co">Country</Label>
                <Input
                  id="co"
                  value={profile.country ?? ""}
                  onChange={(e) => setField("country", e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
            >
              {saving ? "Saving…" : "Save address"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="orders">
          {orders.length === 0 ? (
            <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">You haven't placed any orders yet.</p>
              <Link
                to="/collections"
                className="mt-4 inline-block text-sm font-semibold text-[var(--gold)] hover:underline"
              >
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="rounded-lg border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Order #{o.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize">
                      {o.status}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm">
                    {o.order_items.map((it, i) => (
                      <li key={i} className="flex justify-between">
                        <span>
                          {it.product_name} × {it.quantity}
                        </span>
                        <span>${(it.unit_price * it.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold">
                    <span>Total</span>
                    <span className="text-[var(--gold)]">
                      ${Number(o.total).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
