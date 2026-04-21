import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { type Category, type Product, type Style } from "@/data/products";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductModal } from "@/components/site/ProductModal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — Time & Trend" },
      {
        name: "description",
        content:
          "Browse our curated collection of luxury watches for men, women, and unisex styles.",
      },
      { property: "og:title", content: "Collections — Time & Trend" },
      {
        property: "og:description",
        content: "Browse our curated collection of luxury watches.",
      },
    ],
  }),
  component: CollectionsPage,
});

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

function CollectionsPage() {
  const { products, loading } = useProducts();
  const [active, setActive] = React.useState<FilterTab>(tabs[0]);
  const [modalProduct, setModalProduct] = React.useState<Product | null>(null);

  const filtered = React.useMemo(() => {
    if (active.kind === "all") return products;
    if (active.kind === "category") {
      return products.filter((p) => p.category === active.value);
    }
    return products.filter((p) => p.style === active.value);
  }, [products, active]);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h1 className="section-title">Our Collections</h1>
        <div className="section-title-underline" />

        <div className="mb-12 flex flex-wrap justify-center gap-3 md:mt-8">
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

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            No watches match these filters.
          </p>
        ) : (
          <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={setModalProduct} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
    </section>
  );
}
