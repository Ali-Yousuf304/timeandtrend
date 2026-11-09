import { pageHead } from "@/lib/brand";
import { createFileRoute } from "@tanstack/react-router";
import { BannersAdmin } from "@/components/admin/BannersAdmin";

export const Route = createFileRoute("/admin/banners")({
  head: () => pageHead("Admin Banners", "Manage Subhani Studio banners."),
  component: BannersAdmin,
});
