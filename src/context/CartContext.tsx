import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";
import { trackEvent } from "@/hooks/use-analytics";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (product: Product) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  count: number;
  subtotal: number;
}

const CartContext = React.createContext<CartContextValue | null>(null);

const STORAGE_KEY = "tt_cart_items_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [restored, setRestored] = React.useState(false);
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      supabase.from('products').select('id').then(({ data }) => {
        const valid = new Set((data ?? []).map(p => p.id));
        setItems(Array.isArray(parsed) ? parsed.filter(i => valid.has(i?.product?.id)) : []);
        setRestored(true);
      });
    } catch { setRestored(true); }
  }, []);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!restored) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items, restored]);

  const add = React.useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsOpen(true);
    // fire-and-forget analytics
    trackEvent("add_to_cart", {
      product_id: product.id,
      metadata: { product_name: product.name, price: product.price },
    });
  }, []);

  const remove = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== id));
  }, []);

  const updateQty = React.useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product.id !== id)
        : prev.map((i) => (i.product.id === id ? { ...i, quantity: qty } : i)),
    );
  }, []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const value: CartContextValue = {
    items,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
    add,
    remove,
    updateQty,
    count,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
