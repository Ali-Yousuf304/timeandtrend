import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSiteSettings } from "@/hooks/use-settings";
import { validatePromoCode, type ValidatedPromo } from "@/hooks/use-discounts";
import { toast } from "sonner";
import { Tag, X } from "lucide-react";
import { sendEmail, getAdminEmails } from "@/lib/email";

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
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [busy, setBusy] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  const [promoInput, setPromoInput] = React.useState("");
  const [promo, setPromo] = React.useState<ValidatedPromo | null>(null);
  const [promoBusy, setPromoBusy] = React.useState(false);
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

  const enabledMethods = React.useMemo(
    () => settings?.payment_methods.filter((m) => m.enabled) ?? [],
    [settings],
  );

  React.useEffect(() => {
    if (enabledMethods.length && !paymentMethod) {
      setPaymentMethod(enabledMethods[0].id);
    }
  }, [enabledMethods, paymentMethod]);

  const shippingCost = React.useMemo(() => {
    if (!settings) return 0;
    if (
      settings.shipping_free_threshold > 0 &&
      subtotal >= settings.shipping_free_threshold
    ) {
      return 0;
    }
    return settings.shipping_flat_rate;
  }, [settings, subtotal]);

  const total = Math.max(0, subtotal + shippingCost - (promo?.discountAmount ?? 0));

  async function applyPromo() {
    setPromoBusy(true);
    const result = await validatePromoCode(promoInput, subtotal);
    setPromoBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      setPromo(null);
      return;
    }
    setPromo(result.promo);
    toast.success(`Promo "${result.promo.code}" applied!`);
  }

  // Re-validate if subtotal changes below min order
  React.useEffect(() => {
    if (!promo) return;
    validatePromoCode(promo.code, subtotal).then((r) => {
      if (!r.ok) {
        setPromo(null);
        toast.error(`Promo removed: ${r.error}`);
      } else {
        setPromo(r.promo);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

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
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    setBusy(true);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal,
        total,
        shipping_amount: shippingCost,
        payment_method: paymentMethod,
        customer_email: user.email ?? null,
        promo_code: promo?.code ?? null,
        discount_amount: promo?.discountAmount ?? 0,
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

    if (promo) {
      await supabase.rpc("increment_discount_usage", { _code: promo.code });
    }

    // Fire-and-forget emails
    const orderPayload = {
      id: order.id,
      total,
      subtotal,
      shipping_amount: shippingCost,
      shipping_name: form.shipping_name,
      shipping_address_line1: form.shipping_address_line1,
      shipping_city: form.shipping_city,
      shipping_country: form.shipping_country,
      shipping_phone: form.shipping_phone,
      payment_method: paymentMethod,
      customer_email: user.email,
      items: items.map((i) => ({
        product_name: i.product.name,
        quantity: i.quantity,
        unit_price: i.product.price,
      })),
    };
    if (user.email) sendEmail("order_confirmation", user.email, orderPayload);
    getAdminEmails().then((admins) => {
      if (admins.length) sendEmail("admin_new_order", admins, orderPayload);
    });

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
      <form onSubmit={placeOrder} className="space-y-6">
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
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
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Payment method</h2>
          {enabledMethods.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payment methods are currently available. Please contact support.
            </p>
          ) : (
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              {enabledMethods.map((m) => (
                <Label
                  key={m.id}
                  htmlFor={`pm-${m.id}`}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 hover:bg-muted/40"
                >
                  <RadioGroupItem id={`pm-${m.id}`} value={m.id} />
                  <span className="text-sm font-medium">{m.label}</span>
                </Label>
              ))}
            </RadioGroup>
          )}
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Promo code (optional)</h2>
          {promo ? (
            <div className="flex items-center justify-between rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-[var(--gold)]" />
                <div>
                  <p className="font-mono text-sm font-bold text-[var(--gold)]">{promo.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {promo.type === "percentage"
                      ? `${promo.value}% off`
                      : `Rs. ${promo.value.toLocaleString()} off`}{" "}
                    — saved Rs. {promo.discountAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setPromo(null);
                  setPromoInput("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyPromo();
                  }
                }}
              />
              <Button
                type="button"
                onClick={applyPromo}
                disabled={promoBusy || !promoInput.trim()}
                variant="outline"
              >
                {promoBusy ? "…" : "Apply"}
              </Button>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={busy || enabledMethods.length === 0}
          className="w-full bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
        >
          {busy ? "Placing…" : `Place order — Rs. ${total.toLocaleString()}`}
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
              <span>Rs. {(i.product.price * i.quantity).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>
              {shippingCost === 0 ? "Free" : `Rs. ${shippingCost.toLocaleString()}`}
            </span>
          </div>
          {promo && (
            <div className="flex justify-between text-[var(--gold)]">
              <span>Discount ({promo.code})</span>
              <span>− Rs. {promo.discountAmount.toLocaleString()}</span>
            </div>
          )}
          {settings?.shipping_note && (
            <p className="text-xs text-muted-foreground">{settings.shipping_note}</p>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <span>Total</span>
            <span className="text-[var(--gold)]">Rs. {total.toLocaleString()}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
