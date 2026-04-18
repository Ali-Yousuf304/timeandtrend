import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Discount {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  expires_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function useDiscounts() {
  const [discounts, setDiscounts] = React.useState<Discount[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("discounts")
      .select("*")
      .order("created_at", { ascending: false });
    setDiscounts((data ?? []) as Discount[]);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return { discounts, loading, reload: load };
}

export interface ValidatedPromo {
  code: string;
  discountAmount: number;
  type: "percentage" | "fixed";
  value: number;
}

export async function validatePromoCode(
  code: string,
  subtotal: number,
): Promise<{ ok: true; promo: ValidatedPromo } | { ok: false; error: string }> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { ok: false, error: "Enter a promo code" };

  const { data, error } = await supabase
    .from("discounts")
    .select("*")
    .eq("code", trimmed)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) return { ok: false, error: "Invalid promo code" };

  const d = data as Discount;
  if (d.expires_at && new Date(d.expires_at) < new Date()) {
    return { ok: false, error: "This promo code has expired" };
  }
  if (d.usage_limit !== null && d.usage_count >= d.usage_limit) {
    return { ok: false, error: "This promo code has reached its usage limit" };
  }
  if (subtotal < Number(d.min_order_amount)) {
    return {
      ok: false,
      error: `Minimum order of Rs. ${Number(d.min_order_amount).toLocaleString()} required`,
    };
  }

  let discountAmount =
    d.discount_type === "percentage"
      ? (subtotal * Number(d.discount_value)) / 100
      : Number(d.discount_value);
  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.round(discountAmount);

  return {
    ok: true,
    promo: {
      code: d.code,
      discountAmount,
      type: d.discount_type,
      value: Number(d.discount_value),
    },
  };
}
