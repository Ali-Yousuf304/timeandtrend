import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CustomerQuery {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface QueryReply {
  id: string;
  query_id: string;
  author_id: string | null;
  author_role: "admin" | "customer";
  message: string;
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

export function useMyQueries(userId: string | null | undefined) {
  const [queries, setQueries] = React.useState<CustomerQuery[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!userId) {
      setQueries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("customer_queries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setQueries((data ?? []) as CustomerQuery[]);
    setLoading(false);
  }, [userId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return { queries, loading, reload: load };
}

export function useQueryReplies(queryId: string | null | undefined) {
  const [replies, setReplies] = React.useState<QueryReply[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!queryId) {
      setReplies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("customer_query_replies")
      .select("*")
      .eq("query_id", queryId)
      .order("created_at", { ascending: true });
    setReplies((data ?? []) as QueryReply[]);
    setLoading(false);
  }, [queryId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return { replies, loading, reload: load };
}
