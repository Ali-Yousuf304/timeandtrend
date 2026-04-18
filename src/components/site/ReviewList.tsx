import { Star } from "lucide-react";
import type { ReviewWithMeta } from "@/hooks/use-reviews";

interface Props {
  reviews: ReviewWithMeta[];
  loading?: boolean;
  empty?: string;
}

export function ReviewList({ reviews, loading, empty = "No reviews yet." }: Props) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading reviews…</p>;
  }
  if (!reviews.length) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-md border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < r.rating
                      ? "fill-[var(--gold)] text-[var(--gold)]"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">
                {r.reviewer_name ?? "Anonymous"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleDateString()}
            </span>
          </div>
          {r.title && <p className="mt-2 text-sm font-semibold">{r.title}</p>}
          <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
        </div>
      ))}
    </div>
  );
}
