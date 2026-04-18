import { createFileRoute } from "@tanstack/react-router";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});
