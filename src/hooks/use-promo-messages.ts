import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PromoMessage {
  id: string;
  message: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function usePromoMessages(onlyActive = false) {
  const [messages, setMessages] = React.useState<PromoMessage[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    let q = supabase.from("promo_messages").select("*").order("sort_order", { ascending: true });
    if (onlyActive) q = q.eq("active", true);
    const { data } = await q;
    setMessages((data ?? []) as PromoMessage[]);
    setLoading(false);
  }, [onlyActive]);

  React.useEffect(() => {
    load();
  }, [load]);

  return { messages, loading, reload: load };
}
