import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentMethod {
  id: string;
  label: string;
  enabled: boolean;
}

export interface SiteSettings {
  id: string;
  payment_methods: PaymentMethod[];
  shipping_flat_rate: number;
  shipping_free_threshold: number;
  shipping_note: string | null;
  logo_url: string | null;
}

export function useSiteSettings() {
  const [settings, setSettings] = React.useState<SiteSettings | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (data) {
      setSettings({
        id: data.id,
        payment_methods: (data.payment_methods as unknown as PaymentMethod[]) ?? [],
        shipping_flat_rate: Number(data.shipping_flat_rate),
        shipping_free_threshold: Number(data.shipping_free_threshold),
        shipping_note: data.shipping_note,
        logo_url: (data as { logo_url?: string | null }).logo_url ?? null,
      });
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return { settings, loading, reload: load };
}
