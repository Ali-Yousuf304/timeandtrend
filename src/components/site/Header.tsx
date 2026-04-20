import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, ShoppingBag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { UserMenu } from "@/components/site/UserMenu";
import { SearchBar } from "@/components/site/SearchBar";
import { useSiteSettings } from "@/hooks/use-settings";
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
  const { ids } = useWishlist();
  const { settings } = useSiteSettings();
  const wishCount = ids.size;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-6 md:px-8">
        <Link
          to="/"
          className="flex items-center font-display text-2xl font-bold tracking-tight text-foreground"
          onClick={() => setMobileOpen(false)}
        >
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt="Logo"
              className="h-10 max-w-[180px] object-contain"
            />
          ) : (
            <>
              Time <span className="ml-1 text-[var(--gold)]">&amp;</span>
              <span className="ml-1">Trend</span>
            </>
          )}
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
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

        <div className="mx-4 hidden max-w-xs flex-1 lg:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative rounded-md p-2 text-foreground transition-colors hover:text-[var(--gold)]"
          >
            <Heart className="h-6 w-6" />
            {wishCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)] text-[10px] font-bold text-[var(--gold-foreground)]">
                {wishCount}
              </span>
            )}
          </Link>

          <UserMenu />

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
            <div className="px-6 pb-2 pt-4">
              <SearchBar onNavigate={() => setMobileOpen(false)} />
            </div>
            <ul className="flex flex-col px-6 pb-4">
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
