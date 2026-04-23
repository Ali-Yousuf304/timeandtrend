import * as React from "react";
import { Heart, ShoppingCart, ArrowRight, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useProductRating } from "@/hooks/use-product-ratings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: Props) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const rating = useProductRating(product?.id);

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0 sm:rounded-xl">
        <VisuallyHidden>
          <DialogTitle>{product?.name ?? "Product"}</DialogTitle>
          <DialogDescription>
            {product?.tagline ?? "Quick view"}
          </DialogDescription>
        </VisuallyHidden>
        {product && (
          <div className="grid md:grid-cols-2">
            <div className="flex aspect-square items-center justify-center bg-muted p-8">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex flex-col p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Quick view
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold">
                {product.name}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {product.tagline}
              </p>
              <div className="mt-3 flex items-center gap-1">
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
                  ({rating.count})
                </span>
              </div>
              <p className="mt-5 font-display text-3xl font-bold text-[var(--gold)]">
                Rs. {product.price.toLocaleString()}
                {product.oldPrice && (
                  <span className="ml-2 text-base font-normal text-muted-foreground line-through">
                    Rs. {product.oldPrice.toLocaleString()}
                  </span>
                )}
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
                    size="lg"
                    onClick={() => {
                      add(product);
                      onClose();
                    }}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => toggle(product.id)}
                    aria-label="Toggle wishlist"
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5",
                        has(product.id) && "fill-[var(--gold)] text-[var(--gold)]",
                      )}
                    />
                  </Button>
                </div>
                <Link
                  to="/product/$id"
                  params={{ id: product.id }}
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  View Full Details <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
