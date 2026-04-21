import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CustomerQuery {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export function useCustomerQueries() {
  const [queries, setQueries] = React.useState<CustomerQuery[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customer_queries")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setQueries(data as CustomerQuery[]);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const markRead = React.useCallback(
    async (id: string, is_read: boolean) => {
      await supabase.from("customer_queries").update({ is_read }).eq("id", id);
      await load();
    },
    [load],
  );

  const remove = React.useCallback(
    async (id: string) => {
      await supabase.from("customer_queries").delete().eq("id", id);
      await load();
    },
    [load],
  );

  return { queries, loading, reload: load, markRead, remove };
}
