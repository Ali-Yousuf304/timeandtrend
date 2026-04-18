import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface WishlistContextValue {
  ids: Set<string>;
  loading: boolean;
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);

  const refresh = React.useCallback(async () => {
    if (!user) {
      setIds(new Set());
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("product_id")
      .eq("user_id", user.id);
    if (!error && data) {
      setIds(new Set(data.map((d) => d.product_id)));
    }
    setLoading(false);
  }, [user]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const has = React.useCallback((id: string) => ids.has(id), [ids]);

  const toggle = React.useCallback(
    async (productId: string) => {
      if (!user) {
        toast.error("Please sign in to use the wishlist");
        return;
      }
      if (ids.has(productId)) {
        const { error } = await supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) {
          toast.error("Failed to remove from wishlist");
        } else {
          setIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
          toast.success("Removed from wishlist");
        }
      } else {
        const { error } = await supabase
          .from("wishlist_items")
          .insert({ user_id: user.id, product_id: productId });
        if (error) {
          toast.error("Failed to add to wishlist");
        } else {
          setIds((prev) => new Set(prev).add(productId));
          toast.success("Added to wishlist");
        }
      }
    },
    [ids, user],
  );

  return (
    <WishlistContext.Provider value={{ ids, loading, has, toggle, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
