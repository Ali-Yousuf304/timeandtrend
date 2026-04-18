import * as React from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Star, Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewForm } from "@/components/site/ReviewForm";
import { ReviewList } from "@/components/site/ReviewList";
import { ProductCard } from "@/components/site/ProductCard";
import { useProductReviews } from "@/hooks/use-reviews";
import { useProductRating } from "@/hooks/use-product-ratings";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/products";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button
          className="mt-4"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Retry
        </Button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="text-muted-foreground">Product not found.</p>
      <Link to="/collections" className="mt-4 inline-block text-[var(--gold)] underline">
        Browse all watches
      </Link>
    </div>
  ),
});

function ProductPage() {
  const { id } = Route.useParams();
  const { product, loading } = useProduct(id);
  const { products } = useProducts();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { reviews, loading: reviewsLoading, reload } = useProductReviews(id);
  const rating = useProductRating(id);

  const related = React.useMemo<Product[]>(() => {
    if (!product || products.length <= 1) return [];
    const others = products.filter((p) => p.id !== product.id);
    // Random shuffle, take 4
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [products, product]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-8">
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link
          to="/collections"
          className="mt-4 inline-block text-[var(--gold)] underline"
        >
          Browse all watches
        </Link>
      </div>
    );
  }

  const wished = has(product.id);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-8">
      <Link
        to="/collections"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to collections
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-xl bg-muted p-12">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="flex flex-col">
          {product.badges && product.badges.length > 0 && (
            <div className="mb-3 flex gap-2">
              {product.badges.map((b) => (
                <span
                  key={b}
                  className="rounded bg-[var(--gold)]/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--gold)]"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
          <h1 className="font-display text-4xl font-bold">{product.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{product.tagline}</p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.round(rating.average)
                      ? "fill-[var(--gold)] text-[var(--gold)]"
                      : "text-muted-foreground",
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {rating.count > 0
                ? `${rating.average.toFixed(1)} (${rating.count} review${rating.count === 1 ? "" : "s"})`
                : "No reviews yet"}
            </span>
          </div>

          <p className="mt-6 font-display text-4xl font-bold text-[var(--gold)]">
            Rs. {product.price.toLocaleString()}
            {product.oldPrice && (
              <span className="ml-3 text-lg font-normal text-muted-foreground line-through">
                Rs. {product.oldPrice.toLocaleString()}
              </span>
            )}
          </p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {product.specs.length > 0 && (
            <ul className="mt-6 space-y-2 border-y border-border py-4 text-sm">
              {product.specs.map((s) => (
                <li key={s.label} className="flex justify-between">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium">{s.value}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              size="lg"
              className="flex-1 bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
              onClick={() => add(product)}
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
                  wished && "fill-[var(--gold)] text-[var(--gold)]",
                )}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 border-t border-border pt-10">
        <h2 className="font-display text-2xl font-bold">
          Customer Reviews
          {reviews.length > 0 && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({reviews.length})
            </span>
          )}
        </h2>
        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_400px]">
          <ReviewList
            reviews={reviews}
            loading={reviewsLoading}
            empty="No reviews yet. Be the first to review!"
          />
          <div>
            <h3 className="mb-3 text-sm font-semibold">Write a review</h3>
            <ReviewForm productId={product.id} onSubmitted={reload} />
          </div>
        </div>
      </div>

      {/* You may also like */}
      {related.length > 0 && (
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-bold">You may also like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
