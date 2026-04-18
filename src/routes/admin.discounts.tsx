import { createFileRoute } from "@tanstack/react-router";
import { DiscountsAdmin } from "@/components/admin/DiscountsAdmin";

export const Route = createFileRoute("/admin/discounts")({
  component: DiscountsAdmin,
});
