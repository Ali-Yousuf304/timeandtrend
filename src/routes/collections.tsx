import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { products, type Category, type Product, type Style } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductModal } from "@/components/site/ProductModal";
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

const categories: { value: "all" | Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
];

const styles: { value: "all" | Style; label: string }[] = [
  { value: "all", label: "All Styles" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "sports", label: "Sports" },
];

type Sort = "default" | "low-high" | "high-low";

function CollectionsPage() {
  const [cat, setCat] = React.useState<"all" | Category>("all");
  const [style, setStyle] = React.useState<"all" | Style>("all");
  const [sort, setSort] = React.useState<Sort>("default");
  const [modalProduct, setModalProduct] = React.useState<Product | null>(null);

  const filtered = React.useMemo(() => {
    let list = products.filter(
      (p) => (cat === "all" || p.category === cat) && (style === "all" || p.style === style),
    );
    if (sort === "low-high") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high-low") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [cat, style, sort]);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h1 className="section-title">Our Collections</h1>
        <div className="section-title-underline" />

        <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
          <FilterGroup>
            {categories.map((c) => (
              <FilterBtn
                key={c.value}
                active={cat === c.value}
                onClick={() => setCat(c.value)}
              >
                {c.label}
              </FilterBtn>
            ))}
          </FilterGroup>

          <FilterGroup>
            {styles.map((s) => (
              <FilterBtn
                key={s.value}
                active={style === s.value}
                onClick={() => setStyle(s.value)}
              >
                {s.label}
              </FilterBtn>
            ))}
          </FilterGroup>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          >
            <option value="default">Sort by Price</option>
            <option value="low-high">Low to High</option>
            <option value="high-low">High to Low</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            No watches match these filters.
          </p>
        ) : (
          <motion.div
            layout
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onView={setModalProduct} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
    </section>
  );
}

function FilterGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-1 rounded-lg bg-secondary p-1.5 shadow-inner">{children}</div>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
        active
          ? "bg-card text-[var(--gold)] shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
