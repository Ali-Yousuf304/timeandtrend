import { createFileRoute } from "@tanstack/react-router";
import { CustomersAdmin } from "@/components/admin/CustomersAdmin";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersAdmin,
});
