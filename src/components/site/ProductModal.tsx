import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
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
            className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-background shadow-2xl"
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
                <h2 className="font-display text-3xl font-semibold">{product.name}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{product.description}</p>
                <ul className="mt-5 space-y-2 border-y border-border py-4 text-sm">
                  {product.specs.map((s) => (
                    <li key={s.label} className="flex justify-between">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium">{s.value}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 font-display text-3xl font-bold text-[var(--gold)]">
                  ${product.price.toLocaleString()}
                </p>
                <Button
                  className="mt-6 bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
                  size="lg"
                  onClick={() => {
                    add(product);
                    onClose();
                  }}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
