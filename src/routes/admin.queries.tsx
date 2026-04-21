import { createFileRoute } from "@tanstack/react-router";
import { CustomerQueriesAdmin } from "@/components/admin/CustomerQueriesAdmin";

export const Route = createFileRoute("/admin/queries")({
  component: CustomerQueriesAdmin,
});
