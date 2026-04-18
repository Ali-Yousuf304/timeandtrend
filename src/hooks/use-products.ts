import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Badge, Category, Product, ProductSpec, Style } from "@/data/products";

interface DbProductRow {
  id: string;
  name: string;
  tagline: string;
  price: number;
  old_price: number | null;
  image: string;
  category: string;
  style: string;
  badges: string[] | null;
  rating: number;
  description: string;
  specs: unknown;
}

function mapProduct(row: DbProductRow): Product {
  let specs: ProductSpec[] = [];
  if (Array.isArray(row.specs)) {
    specs = (row.specs as ProductSpec[]).filter(
      (s): s is ProductSpec =>
        !!s && typeof s === "object" && "label" in s && "value" in s,
    );
  }
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    price: Number(row.price),
    oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
    image: row.image,
    category: (["men", "women", "unisex"].includes(row.category)
      ? row.category
      : "unisex") as Category,
    style: (["casual", "formal", "sports"].includes(row.style)
      ? row.style
      : "casual") as Style,
    badges: (row.badges ?? []).filter(
      (b): b is Badge => b === "new" || b === "bestseller",
    ),
    rating: row.rating,
    description: row.description,
    specs,
  };
}

export function useProducts() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("products")
        .select(
          "id,name,tagline,price,old_price,image,category,style,badges,rating,description,specs",
        )
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setProducts((data ?? []).map((r) => mapProduct(r as DbProductRow)));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading };
}

export function useProduct(id: string | undefined) {
  const { products, loading } = useProducts();
  const product = React.useMemo(
    () => (id ? products.find((p) => p.id === id) : undefined),
    [products, id],
  );
  return { product, loading };
}
