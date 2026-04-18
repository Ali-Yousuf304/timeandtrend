import { createFileRoute } from "@tanstack/react-router";
import { ReviewsAdmin } from "@/components/admin/ReviewsAdmin";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsAdmin,
});
