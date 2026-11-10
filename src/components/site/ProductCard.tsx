import { useState } from 'react';
import { Heart, Eye, Plus } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/button';
import { useProductRating } from '@/hooks/use-product-ratings';
import { ProductModal } from './ProductModal';
import { Rating } from './Rating';
import { cn } from '@/lib/utils';

export function ProductCard({ product, onQuickView }: { product: Product; onQuickView?: (p: Product) => void }) {
  const { add } = useCart(); const { has, toggle } = useWishlist();
  const rating = useProductRating(product.id); const [quick, setQuick] = useState(false);
  const soldOut = product.availability === 'sold_out' || (product.stock === 0 && product.availability !== 'pre_order');
  return <article className="group min-w-0">
    <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
      <Link to="/product/$id" params={{ id: product.id }} aria-label={product.name}>
        <img src={product.image} alt={product.name} loading="lazy" width={768} height={768} className={cn('h-full w-full object-cover transition duration-500 group-hover:scale-105', product.images?.length && 'group-hover:opacity-0')} />
        {product.images?.[0] && <img src={product.images[0]} alt={`${product.name} alternate view`} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity group-hover:opacity-100" />}
      </Link>
      <div className="absolute left-3 top-3 flex flex-wrap gap-1">{product.oldPrice && <span className="rounded bg-primary px-2 py-1 text-[10px] text-primary-foreground">Sale</span>}
        {soldOut ? <span className="rounded bg-foreground px-2 py-1 text-[10px] text-background">Sold out</span> : product.availability === 'pre_order' ? <span className="rounded bg-secondary px-2 py-1 text-[10px]">Pre-order</span> : product.badges?.slice(0,1).map((b) => <span key={b} className="rounded bg-background px-2 py-1 text-[10px] font-medium text-primary">{b === 'bestseller' ? 'Bestseller' : 'New arrival'}</span>)}
      </div>
      <div className="absolute right-2 top-2 flex flex-col gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/90" title="Wishlist" aria-label={has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => toggle(product.id)}><Heart className={cn('h-4 w-4', has(product.id) && 'fill-gold text-gold')} /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/90" title="Quick view" aria-label="Quick view" onClick={() => onQuickView ? onQuickView(product) : setQuick(true)}><Eye className="h-4 w-4" /></Button>
      </div>
    </div>
    <div className="pt-4">
      <Link to="/shop" search={{ category: product.category }} className="text-[10px] uppercase text-muted-foreground">{product.category.replaceAll('-', ' ')}</Link>
      <Link to="/product/$id" params={{ id: product.id }}><h3 className="mt-1 min-h-12 font-display text-lg leading-snug">{product.name}</h3></Link>
      <Rating {...rating} />
      <div className="mt-3 flex items-center justify-between gap-2"><p className="text-sm font-semibold">Rs. {product.price.toLocaleString()}{product.oldPrice && <span className="ml-2 text-xs font-normal text-muted-foreground line-through">Rs. {product.oldPrice.toLocaleString()}</span>}</p><Button variant="outline" size="icon" title="Add to cart" aria-label={`Add ${product.name} to cart`} disabled={soldOut} onClick={() => add(product)}><Plus className="h-4 w-4" /></Button></div>
    </div>
    <ProductModal product={quick ? product : null} onClose={() => setQuick(false)} />
  </article>;
}
