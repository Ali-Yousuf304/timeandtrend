import { pageHead } from "@/lib/brand";
import { createFileRoute } from "@tanstack/react-router";
import { ReviewsAdmin } from "@/components/admin/ReviewsAdmin";

export const Route = createFileRoute("/admin/reviews")({
  head: () => pageHead("Admin Reviews", "Manage Subhani Studio reviews."),
  component: ReviewsAdmin,
});
