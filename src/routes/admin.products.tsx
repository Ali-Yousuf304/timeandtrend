import { pageHead } from "@/lib/brand";
import { createFileRoute } from "@tanstack/react-router";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";

export const Route = createFileRoute("/admin/products")({
  head: () => pageHead("Admin Products", "Manage Subhani Studio products."),
  component: ProductsAdmin,
});
