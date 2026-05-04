import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentMethod {
  id: string;
  label: string;
  enabled: boolean;
}

export interface SocialLink {
  url: string;
  enabled: boolean;
}

export interface SocialLinks {
  instagram: SocialLink;
  facebook: SocialLink;
  tiktok: SocialLink;
  youtube: SocialLink;
}

export const defaultSocialLinks: SocialLinks = {
  instagram: { url: "", enabled: false },
  facebook: { url: "", enabled: false },
  tiktok: { url: "", enabled: false },
  youtube: { url: "", enabled: false },
};

export interface SiteSettings {
  id: string;
  payment_methods: PaymentMethod[];
  shipping_flat_rate: number;
  shipping_free_threshold: number;
  shipping_note: string | null;
  logo_url: string | null;
  whatsapp_number: string | null;
  whatsapp_enabled: boolean;
  store_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  social_links: SocialLinks;
  postex_api_key: string | null;
  postex_pickup_address_code: string | null;
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
      const row = data as typeof data & {
        logo_url?: string | null;
        whatsapp_number?: string | null;
        whatsapp_enabled?: boolean;
        store_name?: string | null;
        contact_email?: string | null;
        contact_phone?: string | null;
        contact_address?: string | null;
        social_links?: unknown;
      };
      setSettings({
        id: row.id,
        payment_methods: (row.payment_methods as unknown as PaymentMethod[]) ?? [],
        shipping_flat_rate: Number(row.shipping_flat_rate),
        shipping_free_threshold: Number(row.shipping_free_threshold),
        shipping_note: row.shipping_note,
        logo_url: row.logo_url ?? null,
        whatsapp_number: row.whatsapp_number ?? null,
        whatsapp_enabled: row.whatsapp_enabled ?? true,
        store_name: row.store_name ?? null,
        contact_email: row.contact_email ?? null,
        contact_phone: row.contact_phone ?? null,
        contact_address: row.contact_address ?? null,
        social_links: {
          ...defaultSocialLinks,
          ...((row.social_links as Partial<SocialLinks>) ?? {}),
        },
      });
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return { settings, loading, reload: load };
}
