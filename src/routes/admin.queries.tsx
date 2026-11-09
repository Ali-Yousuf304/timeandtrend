import { pageHead } from "@/lib/brand";
import { createFileRoute } from "@tanstack/react-router";
import { CustomerQueriesAdmin } from "@/components/admin/CustomerQueriesAdmin";

export const Route = createFileRoute("/admin/queries")({
  head: () => pageHead("Admin Queries", "Manage Subhani Studio queries."),
  component: CustomerQueriesAdmin,
});
