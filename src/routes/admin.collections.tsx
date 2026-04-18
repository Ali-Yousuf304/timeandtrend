import { createFileRoute } from "@tanstack/react-router";
import { CollectionsAdmin } from "@/components/admin/CollectionsAdmin";

export const Route = createFileRoute("/admin/collections")({
  component: CollectionsAdmin,
});
