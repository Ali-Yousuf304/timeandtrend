import { pageHead } from "@/lib/brand";
import { createFileRoute } from "@tanstack/react-router";
import { CustomersAdmin } from "@/components/admin/CustomersAdmin";

export const Route = createFileRoute("/admin/customers")({
  head: () => pageHead("Admin Customers", "Manage Subhani Studio customers."),
  component: CustomersAdmin,
});
