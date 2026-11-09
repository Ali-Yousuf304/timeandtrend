import { pageHead } from "@/lib/brand";
import { createFileRoute } from "@tanstack/react-router";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";

export const Route = createFileRoute("/admin/orders")({
  head: () => pageHead("Admin Orders", "Manage Subhani Studio orders."),
  component: OrdersAdmin,
});
