import { motion } from "framer-motion";
import { Heart, Eye, Star } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { useProductRating } from "@/hooks/use-product-ratings";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  onQuickView?: (p: Product) => void;
}

export function ProductCard({ product, onQuickView }: Props) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const navigate = useNavigate();
  const wished = has(product.id);
  const rating = useProductRating(product.id);

  const goToProduct = () => {
    navigate({ to: "/product/$id", params: { id: product.id } });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-xl"
      onClick={goToProduct}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.badges && (
          <div className="absolute left-3 top-3 z-10 flex gap-2">
            {product.badges.map((b) => (
              <span
                key={b}
                className={
                  b === "new"
                    ? "rounded bg-[var(--gold)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--gold-foreground)]"
                    : "rounded bg-[var(--ink)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--ink-foreground)]"
                }
              >
                {b}
              </span>
            ))}
          </div>
        )}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.stopPropagation();
              toggle(product.id);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                wished ? "fill-[var(--gold)] text-[var(--gold)]" : "text-foreground/70",
              )}
            />
          </button>
          <button
            type="button"
            aria-label="Quick view"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(product);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background"
          >
            <Eye className="h-4 w-4 text-foreground/70" />
          </button>
        </div>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 text-center">
        <h3 className="font-display text-lg font-semibold">{product.name}</h3>
        <p className="mt-1 flex-1 text-sm text-muted-foreground">{product.tagline}</p>

        <div className="mt-2 flex items-center justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3.5 w-3.5",
                i < Math.round(rating.average)
                  ? "fill-[var(--gold)] text-[var(--gold)]"
                  : "text-muted-foreground/40",
              )}
            />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">
            {rating.count > 0 ? `(${rating.count})` : "(0)"}
          </span>
        </div>

        <p className="mt-3 text-lg font-bold text-[var(--gold)]">
          Rs. {product.price.toLocaleString()}
          {product.oldPrice && (
            <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
              Rs. {product.oldPrice.toLocaleString()}
            </span>
          )}
        </p>
        <Button
          className="mt-4 w-full bg-[var(--ink)] text-[var(--ink-foreground)] hover:bg-[var(--gold)] hover:text-[var(--gold-foreground)]"
          onClick={(e) => {
            e.stopPropagation();
            add(product);
          }}
        >
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}
