import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

interface Props {
  product: Product;
  onView?: (p: Product) => void;
}

export function ProductCard({ product, onView }: Props) {
  const { add } = useCart();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-xl"
      onClick={() => onView?.(product)}
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
        <p className="mt-3 text-lg font-bold text-[var(--gold)]">
          ${product.price.toLocaleString()}
          {product.oldPrice && (
            <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
              ${product.oldPrice.toLocaleString()}
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
