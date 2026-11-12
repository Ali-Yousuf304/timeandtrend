import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { Heart, Menu, ShoppingBag, X, Flower2, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { UserMenu } from './UserMenu';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { useSiteSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { storeName } from '@/lib/brand';
import { useCollections } from '@/hooks/use-collections';
import { Skeleton } from '@/components/ui/skeleton';

export function Header() {
  const { count, open } = useCart(); const { ids } = useWishlist();
  const { settings } = useSiteSettings(); const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { navbarCollections: categories, loading } = useCollections();
  if (pathname.startsWith('/admin')) return null;
  return <header className="sticky top-0 z-40 border-b border-border bg-background">
    <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between gap-3 px-4 md:px-8">
      <div className="hidden w-60 lg:block"><SearchBar /></div>
      <Link to="/" className="flex shrink-0 items-center gap-2 text-primary" onClick={() => setMobileOpen(false)}>
        {settings?.logo_url ? <img src={settings.logo_url} alt={storeName(settings)} className="h-12 max-w-44 object-contain" /> : <><Flower2 className="h-8 w-8 text-gold" strokeWidth={1} /><span className="font-display text-xl md:text-3xl">{storeName(settings)}</span></>}
      </Link>
      <div className="flex items-center gap-0.5 lg:w-60 lg:justify-end">
        <ThemeToggle className="hidden md:inline-flex" />
        <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex"><Link to="/wishlist" aria-label="Wishlist"><Heart className="h-5 w-5" />{ids.size > 0 && <span className="text-xs">{ids.size}</span>}</Link></Button>
        <UserMenu />
        <Button variant="ghost" size="icon" aria-label="Open cart" onClick={open} className="relative"><ShoppingBag className="h-5 w-5" />{count > 0 && <span className="absolute right-0 top-0 rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{count}</span>}</Button>
        <Button variant="ghost" size="icon" aria-label="Toggle menu" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</Button>
      </div>
    </div>
    <nav className="hidden border-t border-border/60 lg:block"><div className="mx-auto flex h-12 max-w-[1400px] items-center justify-center gap-7 px-8 text-xs font-medium">
      <Link to="/" className="transition-colors hover:text-primary">Home</Link>
      <div className="group relative flex h-12 items-center"><Link to="/shop" className="inline-flex items-center gap-1 text-primary">Shop <ChevronDown className="h-3 w-3" /></Link><div className="invisible absolute left-1/2 top-full z-50 grid w-[480px] -translate-x-1/2 grid-cols-2 gap-x-6 gap-y-1 border border-border bg-background p-5 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"><Link to="/shop" className="col-span-2 mb-2 border-b border-border pb-3 font-semibold">Shop all essentials</Link>{loading ? <Skeleton className="col-span-2 h-10" /> : categories.map((c) => <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="py-2 text-muted-foreground transition-colors hover:text-primary">{c.name}</Link>)}</div></div>
      <Link to="/gift-boxes" className="transition-colors hover:text-primary">Gift Boxes</Link>
      <Link to="/about" className="text-muted-foreground transition-colors hover:text-primary">About</Link>
      <Link to="/contact" className="text-muted-foreground transition-colors hover:text-primary">Contact</Link>
    </div></nav>
    {mobileOpen && <div className="max-h-[70vh] overflow-y-auto border-t border-border p-4 lg:hidden"><SearchBar onNavigate={() => setMobileOpen(false)} /><nav className="mt-4 grid grid-cols-2 gap-4 text-sm"><Link to="/" onClick={() => setMobileOpen(false)}>Home</Link><Link to="/shop" onClick={() => setMobileOpen(false)}>Shop All</Link><Link to="/gift-boxes" onClick={() => setMobileOpen(false)}>Gift Boxes</Link>{loading ? <Skeleton className="h-10 w-full" /> : categories.map((c) => <Link key={c.slug} to="/shop" search={{ category: c.slug }} onClick={() => setMobileOpen(false)}>{c.name}</Link>)}<Link to="/about" onClick={() => setMobileOpen(false)}>About</Link><Link to="/contact" onClick={() => setMobileOpen(false)}>Contact</Link></nav></div>}
  </header>;
}
