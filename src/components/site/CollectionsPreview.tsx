import * as React from "react";
import { motion } from "framer-motion";
import { type Category, type Product, type Style } from "@/data/products";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductModal } from "@/components/site/ProductModal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type FilterValue = "all" | Category | Style;
interface FilterTab {
  value: FilterValue;
  label: string;
  kind: "category" | "style" | "all";
}

const tabs: FilterTab[] = [
  { value: "all", label: "All", kind: "all" },
  { value: "men", label: "Men", kind: "category" },
  { value: "women", label: "Women", kind: "category" },
  { value: "unisex", label: "Unisex", kind: "category" },
  { value: "casual", label: "Casual", kind: "style" },
  { value: "formal", label: "Formal", kind: "style" },
  { value: "sports", label: "Sports", kind: "style" },
];

export function CollectionsPreview() {
  const { products, loading } = useProducts();
  const [active, setActive] = React.useState<FilterTab>(tabs[0]);
  const [modalProduct, setModalProduct] = React.useState<Product | null>(null);
  const [paused, setPaused] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (active.kind === "all") return products;
    if (active.kind === "category")
      return products.filter((p) => p.category === active.value);
    return products.filter((p) => p.style === active.value);
  }, [products, active]);

  // Duplicate the list so the marquee can loop seamlessly.
  const loop = React.useMemo(() => [...filtered, ...filtered], [filtered]);

  return (
    <section id="collections" className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-[1400px] px-6 md:px-8">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Most Trending
        </h2>

        <div className="mt-6 flex flex-wrap gap-3 md:mt-8">
          {tabs.map((t) => {
            const isActive = active.value === t.value && active.kind === t.kind;
            return (
              <button
                key={`${t.kind}-${t.value}`}
                onClick={() => setActive(t)}
                className={cn(
                  "rounded-md border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all",
                  isActive
                    ? "border-foreground bg-foreground text-background shadow-sm"
                    : "border-border bg-card text-foreground/80 hover:border-foreground/40",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 md:mt-12">
        {loading ? (
          <div className="mx-auto grid max-w-[1400px] gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4 md:px-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            No products in this collection yet.
          </p>
        ) : (
          <div
            className="group relative overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <motion.div
              key={active.kind + active.value + filtered.length}
              className="flex w-max gap-6 px-6 md:gap-8 md:px-8"
              animate={{ x: paused ? undefined : ["0%", "-50%"] }}
              transition={{
                duration: Math.max(20, filtered.length * 6),
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {loop.map((p, i) => (
                <div
                  key={`${p.id}-${i}`}
                  className="w-[260px] shrink-0 sm:w-[280px] md:w-[300px]"
                >
                  <ProductCard product={p} onQuickView={setModalProduct} />
                </div>
              ))}
            </motion.div>

            {/* Edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-secondary/40 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-secondary/40 to-transparent" />
          </div>
        )}
      </div>

      <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
    </section>
  );
}
