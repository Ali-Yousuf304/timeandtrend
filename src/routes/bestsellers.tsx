import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/use-products";
import { useAllProductRatings } from "@/hooks/use-product-ratings";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/bestsellers")({
  head: () => ({
    meta: [
      { title: "Best Sellers — Time & Trend" },
      {
        name: "description",
        content: "Our most loved luxury timepieces, hand-picked by our customers.",
      },
      { property: "og:title", content: "Best Sellers — Time & Trend" },
      {
        property: "og:description",
        content: "Our most loved luxury timepieces this season.",
      },
    ],
  }),
  component: BestSellersPage,
});

function BestSellersPage() {
  const { products, loading } = useProducts();
  const getRating = useAllProductRatings();
  const bestSellers = products.filter((p) => p.badges?.includes("bestseller"));

  return (
    <section className="bg-secondary py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h1 className="section-title">This Season's Best Sellers</h1>
        <div className="section-title-underline" />

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : bestSellers.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            No best sellers yet — check back soon.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {bestSellers.map((p, idx) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-6 rounded-xl bg-card p-6 shadow-sm transition-shadow hover:shadow-lg"
              >
                {(() => {
                  const rating = getRating(p.id);
                  const ratingWidth = `${(Math.max(0, Math.min(5, rating.average)) / 5) * 100}%`;

                  return (
                    <>
                      <div className="h-36 w-36 flex-shrink-0 rounded-lg bg-muted p-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-3">
                          <div className="relative text-lg leading-none tracking-[0.2em] text-muted-foreground/25">
                            <span aria-hidden="true">★★★★★</span>
                            <span
                              aria-hidden="true"
                              className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-[var(--gold)]"
                              style={{ width: ratingWidth }}
                            >
                              ★★★★★
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {rating.count > 0
                              ? `${rating.average.toFixed(1)} (${rating.count} review${rating.count === 1 ? "" : "s"})`
                              : "No reviews yet"}
                          </span>
                        </div>
                        <h2 className="mt-1 font-display text-xl font-semibold">{p.name}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                        <p className="mt-3 font-bold text-[var(--gold)]">
                          Rs. {p.price.toLocaleString()}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
