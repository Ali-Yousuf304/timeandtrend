import { createFileRoute } from "@tanstack/react-router";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});
