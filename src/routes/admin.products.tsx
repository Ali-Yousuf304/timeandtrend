import { createFileRoute } from "@tanstack/react-router";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdmin,
});
