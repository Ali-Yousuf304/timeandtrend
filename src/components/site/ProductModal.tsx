import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: Props) {
  const { add } = useCart();

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 rounded-full bg-background/90 p-2 transition-colors hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
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
                <h2 className="mt-1 font-display text-3xl font-semibold">{product.name}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{product.tagline}</p>
                <p className="mt-5 font-display text-3xl font-bold text-[var(--gold)]">
                  Rs. {product.price.toLocaleString()}
                  {product.oldPrice && (
                    <span className="ml-2 text-base font-normal text-muted-foreground line-through">
                      Rs. {product.oldPrice.toLocaleString()}
                    </span>
                  )}
                </p>
                <div className="mt-6 space-y-3">
                  <Button
                    className="w-full bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
                    size="lg"
                    onClick={() => {
                      add(product);
                      onClose();
                    }}
                  >
                    Add to Cart
                  </Button>
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
