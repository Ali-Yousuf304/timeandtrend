import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export function CartPanel() {
  const { isOpen, close, items, updateQty, remove, subtotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
            onClick={close}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 z-[95] flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="font-display text-xl font-semibold">Your Cart</h3>
              <button
                onClick={close}
                aria-label="Close cart"
                className="rounded-md p-2 transition-colors hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                  <ShoppingBag className="mb-3 h-12 w-12 opacity-30" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map(({ product, quantity }) => (
                    <li
                      key={product.id}
                      className="flex gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="h-20 w-20 flex-shrink-0 rounded bg-muted p-2">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-semibold">{product.name}</h4>
                          <button
                            onClick={() => remove(product.id)}
                            aria-label="Remove"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-[var(--gold)]">
                          ${product.price.toLocaleString()}
                        </p>
                        <div className="mt-auto flex items-center gap-2">
                          <button
                            onClick={() => updateQty(product.id, quantity - 1)}
                            aria-label="Decrease"
                            className="rounded border border-border p-1 hover:bg-muted"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm">{quantity}</span>
                          <button
                            onClick={() => updateQty(product.id, quantity + 1)}
                            aria-label="Increase"
                            className="rounded border border-border p-1 hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-border px-6 py-4">
              <div className="mb-4 flex justify-between text-sm font-semibold">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <Button
                className="w-full bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
                disabled={items.length === 0}
              >
                Proceed to Checkout
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
