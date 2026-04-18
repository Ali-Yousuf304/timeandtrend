// Shared product types used across the storefront.
// Products themselves are loaded dynamically from the database
// via the `useProducts` hook in src/hooks/use-products.ts.

export type Category = "men" | "women" | "unisex";
export type Style = "casual" | "formal" | "sports";
export type Badge = "new" | "bestseller";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: Category;
  style: Style;
  badges?: Badge[];
  rating: number;
  description: string;
  specs: ProductSpec[];
}
