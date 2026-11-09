import { pageHead } from "@/lib/brand";
import { createFileRoute } from "@tanstack/react-router";
import { DiscountsAdmin } from "@/components/admin/DiscountsAdmin";

export const Route = createFileRoute("/admin/discounts")({
  head: () => pageHead("Admin Discounts", "Manage Subhani Studio discounts."),
  component: DiscountsAdmin,
});
