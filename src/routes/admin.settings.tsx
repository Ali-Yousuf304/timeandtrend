import { pageHead } from "@/lib/brand";
import { createFileRoute } from "@tanstack/react-router";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";

export const Route = createFileRoute("/admin/settings")({
  head: () => pageHead("Admin Settings", "Manage Subhani Studio settings."),
  component: SettingsAdmin,
});
