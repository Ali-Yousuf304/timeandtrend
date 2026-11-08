export const categories = [
  { slug: 'prayer-mats', name: 'Prayer Mats' }, { slug: 'tasbeeh', name: 'Tasbeeh' },
  { slug: 'attar', name: 'Attar' }, { slug: 'prayer-wear', name: 'Prayer Wear' },
  { slug: 'ihram', name: 'Ihram' }, { slug: 'quran', name: 'Quran & Accessories' },
  { slug: 'gift-boxes', name: 'Hadiya Gift Boxes' },
] as const;
export type Category = string;
export type Style = string;
export type Badge = 'new' | 'bestseller';
export interface ProductSpec { label: string; value: string }
export interface ProductVariant { name: string; color?: string; size?: string; stock: number; price?: number }
export interface Product {
  id: string; name: string; tagline: string; price: number; oldPrice?: number;
  image: string; images?: string[]; category: Category; style: Style;
  badges?: Badge[]; rating: number; description: string; specs: ProductSpec[];
  stock: number; availability: string; material?: string; care?: string;
  variants: ProductVariant[]; selectedVariant?: string;
}
