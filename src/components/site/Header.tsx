import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: "/bestsellers", label: "Best Sellers" },
  { to: "/about", label: "About" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { count, open } = useCart();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-6 md:px-8">
        <Link
          to="/"
          className="font-display text-2xl font-bold tracking-tight text-foreground"
          onClick={() => setMobileOpen(false)}
        >
          Time <span className="text-[var(--gold)]">&amp;</span> Trend
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-[var(--gold)]"
                activeProps={{ className: "text-[var(--gold)]" }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <button
            aria-label="Open cart"
            onClick={open}
            className="relative rounded-md p-2 text-foreground transition-colors hover:text-[var(--gold)]"
          >
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)] text-[10px] font-bold text-[var(--gold-foreground)]"
              >
                {count}
              </motion.span>
            )}
          </button>

          <button
            aria-label="Toggle menu"
            className="rounded-md p-2 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/40 bg-background lg:hidden"
          >
            <ul className="flex flex-col px-6 py-4">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block py-3 text-sm font-medium text-foreground/80 transition-colors hover:text-[var(--gold)]",
                    )}
                    activeProps={{ className: "text-[var(--gold)]" }}
                    activeOptions={{ exact: true }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
