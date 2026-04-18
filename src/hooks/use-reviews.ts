import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  body: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithMeta extends Review {
  reviewer_name: string | null;
  reviewer_email: string | null;
  product_name: string | null;
  product_image: string | null;
}

export function useProductReviews(productId: string | null | undefined) {
  const [reviews, setReviews] = React.useState<ReviewWithMeta[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!productId) {
      setReviews([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: rows } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("enabled", true)
      .order("created_at", { ascending: false });

    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    let nameMap = new Map<string, { name: string | null; email: string | null }>();
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,display_name,email")
        .in("id", userIds);
      nameMap = new Map(
        (profs ?? []).map((p) => [p.id, { name: p.display_name, email: p.email }]),
      );
    }
    setReviews(
      (rows ?? []).map((r) => ({
        ...r,
        reviewer_name: nameMap.get(r.user_id)?.name ?? null,
        reviewer_email: nameMap.get(r.user_id)?.email ?? null,
        product_name: null,
        product_image: null,
      })),
    );
    setLoading(false);
  }, [productId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return { reviews, loading, reload: load };
}

export function useAllReviews() {
  const [reviews, setReviews] = React.useState<ReviewWithMeta[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    const productIds = Array.from(new Set((rows ?? []).map((r) => r.product_id)));

    const [{ data: profs }, { data: prods }] = await Promise.all([
      userIds.length
        ? supabase.from("profiles").select("id,display_name,email").in("id", userIds)
        : Promise.resolve({ data: [] as { id: string; display_name: string | null; email: string | null }[] }),
      productIds.length
        ? supabase.from("products").select("id,name,image").in("id", productIds)
        : Promise.resolve({ data: [] as { id: string; name: string; image: string }[] }),
    ]);

    const nameMap = new Map(
      (profs ?? []).map((p) => [p.id, { name: p.display_name, email: p.email }]),
    );
    const prodMap = new Map((prods ?? []).map((p) => [p.id, p]));

    setReviews(
      (rows ?? []).map((r) => ({
        ...r,
        reviewer_name: nameMap.get(r.user_id)?.name ?? null,
        reviewer_email: nameMap.get(r.user_id)?.email ?? null,
        product_name: prodMap.get(r.product_id)?.name ?? null,
        product_image: prodMap.get(r.product_id)?.image ?? null,
      })),
    );
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return { reviews, loading, reload: load };
}

export function useUserReviews(userId: string | null | undefined) {
  const [reviews, setReviews] = React.useState<ReviewWithMeta[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!userId) {
      setReviews([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: rows } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const productIds = Array.from(new Set((rows ?? []).map((r) => r.product_id)));
    let prodMap = new Map<string, { name: string; image: string }>();
    if (productIds.length) {
      const { data: prods } = await supabase
        .from("products")
        .select("id,name,image")
        .in("id", productIds);
      prodMap = new Map((prods ?? []).map((p) => [p.id, p]));
    }
    setReviews(
      (rows ?? []).map((r) => ({
        ...r,
        reviewer_name: null,
        reviewer_email: null,
        product_name: prodMap.get(r.product_id)?.name ?? null,
        product_image: prodMap.get(r.product_id)?.image ?? null,
      })),
    );
    setLoading(false);
  }, [userId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return { reviews, loading, reload: load };
}
