import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Time & Trend" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, remove } = useCart();
  const navigate = useNavigate();
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState({
    shipping_name: "",
    shipping_address_line1: "",
    shipping_address_line2: "",
    shipping_city: "",
    shipping_state: "",
    shipping_postal_code: "",
    shipping_country: "",
    shipping_phone: "",
  });

  React.useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  React.useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name,phone,address_line1,address_line2,city,state,postal_code,country")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            shipping_name: data.display_name ?? "",
            shipping_address_line1: data.address_line1 ?? "",
            shipping_address_line2: data.address_line2 ?? "",
            shipping_city: data.city ?? "",
            shipping_state: data.state ?? "",
            shipping_postal_code: data.postal_code ?? "",
            shipping_country: data.country ?? "",
            shipping_phone: data.phone ?? "",
          });
        }
      });
  }, [user]);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!user || items.length === 0) return;
    setBusy(true);

    const total = subtotal;
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal,
        total,
        ...form,
      })
      .select("id")
      .single();

    if (error || !order) {
      toast.error(error?.message ?? "Failed to place order");
      setBusy(false);
      return;
    }

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      product_name: i.product.name,
      product_image: i.product.image,
      unit_price: i.product.price,
      quantity: i.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) {
      toast.error(itemsError.message);
      setBusy(false);
      return;
    }

    items.forEach((i) => remove(i.product.id));
    toast.success("Order placed!");
    navigate({ to: "/account" });
  }

  if (!user) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1100px] gap-8 px-6 py-12 md:grid-cols-[1fr_360px] md:px-8">
      <form onSubmit={placeOrder} className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h1 className="font-display text-2xl font-bold">Shipping details</h1>
        {(
          [
            ["shipping_name", "Full name"],
            ["shipping_address_line1", "Address line 1"],
            ["shipping_address_line2", "Address line 2 (optional)"],
            ["shipping_city", "City"],
            ["shipping_state", "State"],
            ["shipping_postal_code", "Postal code"],
            ["shipping_country", "Country"],
            ["shipping_phone", "Phone"],
          ] as const
        ).map(([k, label]) => (
          <div key={k}>
            <Label htmlFor={k}>{label}</Label>
            <Input
              id={k}
              required={k !== "shipping_address_line2"}
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          </div>
        ))}
        <Button
          type="submit"
          disabled={busy}
          className="w-full bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
        >
          {busy ? "Placing…" : `Place order — $${subtotal.toLocaleString()}`}
        </Button>
      </form>

      <aside className="h-fit rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((i) => (
            <li key={i.product.id} className="flex justify-between">
              <span>
                {i.product.name} × {i.quantity}
              </span>
              <span>${(i.product.price * i.quantity).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold">
          <span>Total</span>
          <span className="text-[var(--gold)]">${subtotal.toLocaleString()}</span>
        </div>
      </aside>
    </div>
  );
}
