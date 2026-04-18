import { createFileRoute } from "@tanstack/react-router";
import { BannersAdmin } from "@/components/admin/BannersAdmin";

export const Route = createFileRoute("/admin/banners")({
  component: BannersAdmin,
});
