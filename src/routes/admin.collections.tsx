import { pageHead } from "@/lib/brand";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionsAdmin } from "@/components/admin/CollectionsAdmin";

export const Route = createFileRoute("/admin/collections")({
  head: () => pageHead("Admin Collections", "Manage Subhani Studio collections."),
  component: CollectionsAdmin,
});
