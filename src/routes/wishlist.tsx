import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — Time & Trend" },
      { name: "description", content: "Your saved luxury timepieces." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { ids, toggle, loading } = useWishlist();
  const { add } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  const items = React.useMemo(() => products.filter((p) => ids.has(p.id)), [products, ids]);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-8">
      <h1 className="section-title">My Wishlist</h1>
      <div className="section-title-underline" />

      {loading ? (
        <p className="py-20 text-center text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Your wishlist is empty.</p>
          <Link
            to="/collections"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-[var(--gold)] px-6 py-2.5 text-sm font-semibold text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
          >
            Browse collections
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="aspect-square overflow-hidden rounded bg-muted p-4">
                <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.tagline}</p>
                <p className="mt-2 text-lg font-bold text-[var(--gold)]">
                  Rs. {p.price.toLocaleString()}
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1 bg-[var(--ink)] text-[var(--ink-foreground)] hover:bg-[var(--gold)] hover:text-[var(--gold-foreground)]"
                  onClick={() => add(p)}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggle(p.id)}
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
