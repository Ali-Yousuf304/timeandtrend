import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Truck, Printer } from "lucide-react";

export interface AdminOrderFull {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  payment_method: string | null;
  total: number;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  promo_code: string | null;
  customer_email: string | null;
  shipping_name: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  shipping_phone: string | null;
  created_at: string;
  order_items: {
    product_name: string;
    product_image: string | null;
    quantity: number;
    unit_price: number;
  }[];
}

interface Props {
  order: AdminOrderFull | null;
  onClose: () => void;
  onUpdated: () => void;
}

const PAYMENT_STATUSES = ["pending", "paid", "refunded", "failed"] as const;
const FULFILLMENT_STATUSES = ["unfulfilled", "fulfilled", "shipped", "delivered", "cancelled"] as const;

export function OrderDetailsModal({ order, onClose, onUpdated }: Props) {
  const [updatingPay, setUpdatingPay] = React.useState(false);
  const [updatingFulfill, setUpdatingFulfill] = React.useState(false);

  if (!order) return null;

  async function updatePayment(value: string) {
    if (!order) return;
    setUpdatingPay(true);
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: value })
      .eq("id", order.id);
    setUpdatingPay(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Payment status updated");
      onUpdated();
    }
  }

  async function updateFulfill(value: string) {
    if (!order) return;
    setUpdatingFulfill(true);
    const { error } = await supabase
      .from("orders")
      .update({ fulfillment_status: value })
      .eq("id", order.id);
    setUpdatingFulfill(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Fulfillment status updated");
      onUpdated();
    }
  }

  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Order #{order.id.slice(0, 8)}</DialogTitle>
          <DialogDescription>Order details and status.</DialogDescription>
        </VisuallyHidden>

        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold">
                  #{order.id.slice(0, 8).toUpperCase()}
                </h2>
                <PaymentBadge status={order.payment_status} />
                <FulfillmentBadge status={order.fulfillment_status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleString()} from Online Store
              </p>
            </div>
            <p className="font-display text-2xl font-bold text-[var(--gold)]">
              Rs. {Number(order.total).toLocaleString()}
            </p>
          </div>

          {/* Status updaters */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Payment status
              </label>
              <Select
                value={order.payment_status}
                onValueChange={updatePayment}
                disabled={updatingPay}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fulfillment status
              </label>
              <Select
                value={order.fulfillment_status}
                onValueChange={updateFulfill}
                disabled={updatingFulfill}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FULFILLMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-lg border border-border">
            <div className="border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {order.order_items.length} item{order.order_items.length === 1 ? "" : "s"}
            </div>
            <ul className="divide-y divide-border">
              {order.order_items.map((it, i) => (
                <li key={i} className="flex items-center gap-3 p-3">
                  {it.product_image && (
                    <img
                      src={it.product_image}
                      alt={it.product_name}
                      className="h-14 w-14 rounded bg-muted object-contain p-1"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{it.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Rs. {Number(it.unit_price).toLocaleString()} × {it.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    Rs. {(Number(it.unit_price) * it.quantity).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
            <div className="space-y-1 border-t border-border bg-muted/20 px-4 py-3 text-sm">
              <Row label="Subtotal" value={`Rs. ${Number(order.subtotal).toLocaleString()}`} />
              <Row label="Shipping" value={`Rs. ${Number(order.shipping_amount).toLocaleString()}`} />
              {order.discount_amount > 0 && (
                <Row
                  label={`Discount${order.promo_code ? ` (${order.promo_code})` : ""}`}
                  value={`− Rs. ${Number(order.discount_amount).toLocaleString()}`}
                  tone="text-[var(--gold)]"
                />
              )}
              <Row
                label="Total"
                value={`Rs. ${Number(order.total).toLocaleString()}`}
                bold
              />
            </div>
          </div>

          {/* Customer + shipping */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Customer">
              <p className="font-medium">{order.shipping_name ?? "—"}</p>
              {order.customer_email && (
                <a
                  href={`mailto:${order.customer_email}`}
                  className="block text-sm text-[var(--gold)] hover:underline"
                >
                  {order.customer_email}
                </a>
              )}
              {order.shipping_phone && (
                <p className="text-sm text-muted-foreground">{order.shipping_phone}</p>
              )}
              {order.payment_method && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Payment method: <span className="font-medium uppercase">{order.payment_method}</span>
                </p>
              )}
            </Card>
            <Card title="Shipping address">
              {order.shipping_address_line1 ? (
                <address className="not-italic text-sm leading-relaxed">
                  {order.shipping_name}
                  <br />
                  {order.shipping_address_line1}
                  {order.shipping_address_line2 && (<><br />{order.shipping_address_line2}</>)}
                  <br />
                  {order.shipping_city}{order.shipping_state ? `, ${order.shipping_state}` : ""} {order.shipping_postal_code ?? ""}
                  <br />
                  {order.shipping_country}
                </address>
              ) : (
                <p className="text-sm text-muted-foreground">No shipping address.</p>
              )}
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, bold, tone }: { label: string; value: string; bold?: boolean; tone?: string }) {
  return (
    <div
      className={cn(
        "flex justify-between",
        bold && "border-t border-border pt-2 text-base font-semibold",
        tone,
      )}
    >
      <span className={!bold ? "text-muted-foreground" : ""}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    refunded: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  };
  return (
    <Badge className={cn("border-0 capitalize", map[status] ?? "bg-muted text-muted-foreground")}>
      {status === "paid" ? "● Paid" : `○ Payment ${status}`}
    </Badge>
  );
}

function FulfillmentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    fulfilled: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    shipped: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
    delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    unfulfilled: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  };
  return (
    <Badge className={cn("border-0 capitalize", map[status] ?? "bg-muted text-muted-foreground")}>
      ● {status}
    </Badge>
  );
}
