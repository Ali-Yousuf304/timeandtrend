import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products, type Category, type Product, type Style } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductModal } from "@/components/site/ProductModal";
import { cn } from "@/lib/utils";

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

const VISIBLE = 3;

export function CollectionsPreview() {
  const [cat, setCat] = React.useState<"all" | Category>("all");
  const [style, setStyle] = React.useState<"all" | Style>("all");
  const [start, setStart] = React.useState(0);
  const [modalProduct, setModalProduct] = React.useState<Product | null>(null);
  const [perView, setPerView] = React.useState(VISIBLE);

  React.useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : VISIBLE);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const filtered = React.useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "all" || p.category === cat) && (style === "all" || p.style === style),
      ),
    [cat, style],
  );

  React.useEffect(() => {
    setStart(0);
  }, [cat, style, perView]);

  const maxStart = Math.max(0, filtered.length - perView);
  const visible = filtered.slice(start, start + perView);
  const canPrev = start > 0;
  const canNext = start < maxStart;

  return (
    <section id="collections" className="py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h2 className="section-title">Our Collections</h2>
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
        </div>

        {filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            No watches match these filters.
          </p>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => canPrev && setStart((s) => Math.max(0, s - 1))}
              disabled={!canPrev}
              aria-label="Previous"
              className="absolute -left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md transition-all hover:bg-[var(--gold)] hover:text-[var(--gold-foreground)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-foreground sm:flex md:-left-6"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <motion.div
              layout
              className={cn(
                "grid gap-8",
                perView === 1 && "grid-cols-1",
                perView === 2 && "grid-cols-2",
                perView === 3 && "grid-cols-3",
              )}
            >
              <AnimatePresence mode="popLayout">
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} onView={setModalProduct} />
                ))}
              </AnimatePresence>
            </motion.div>

            <button
              type="button"
              onClick={() => canNext && setStart((s) => Math.min(maxStart, s + 1))}
              disabled={!canNext}
              aria-label="Next"
              className="absolute -right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md transition-all hover:bg-[var(--gold)] hover:text-[var(--gold-foreground)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-foreground sm:flex md:-right-6"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {maxStart > 0 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: maxStart + 1 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStart(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === start
                        ? "w-8 bg-[var(--gold)]"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
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
