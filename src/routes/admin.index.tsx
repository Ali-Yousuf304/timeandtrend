import { pageHead } from "@/lib/brand";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardOverview } from "@/components/admin/DashboardOverview";

export const Route = createFileRoute("/admin/")({
  head: () => pageHead("Admin Dashboard", "Manage Subhani Studio dashboard."),
  component: DashboardOverview,
});
