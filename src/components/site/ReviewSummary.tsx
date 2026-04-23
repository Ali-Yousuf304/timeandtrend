import * as React from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { ReviewForm } from "@/components/site/ReviewForm";
import { cn } from "@/lib/utils";
import type { ReviewWithMeta } from "@/hooks/use-reviews";

interface Props {
  productId: string;
  reviews: ReviewWithMeta[];
  onReviewSubmitted: () => void;
}

/**
 * Header strip shown above the review list:
 *   - Average rating + total count on the left
 *   - 5★→1★ distribution bars in the middle
 *   - "Write a review" button on the right (opens dialog with ReviewForm)
 */
export function ReviewSummary({ productId, reviews, onReviewSubmitted }: Props) {
  const [open, setOpen] = React.useState(false);

  const stats = React.useMemo(() => {
    const buckets = [0, 0, 0, 0, 0]; // index 0 = 1★
    let sum = 0;
    reviews.forEach((r) => {
      const idx = Math.max(0, Math.min(4, r.rating - 1));
      buckets[idx]++;
      sum += r.rating;
    });
    return {
      total: reviews.length,
      average: reviews.length ? sum / reviews.length : 0,
      buckets,
    };
  }, [reviews]);

  const max = Math.max(...stats.buckets, 1);

  return (
    <>
      <div className="grid gap-6 rounded-xl border border-border bg-card p-6 md:grid-cols-[180px_1fr_auto] md:items-center">
        {/* Left — Average */}
        <div className="text-center md:border-r md:border-border md:pr-6">
          <p className="font-display text-5xl font-bold">
            {stats.average.toFixed(1)}
          </p>
          <div className="mt-2 flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.round(stats.average)
                    ? "fill-foreground text-foreground"
                    : "text-muted-foreground/30",
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {stats.total} review{stats.total === 1 ? "" : "s"}
          </p>
        </div>

        {/* Middle — Bar breakdown */}
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.buckets[star - 1];
            const pct = stats.total ? (count / max) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-10 text-muted-foreground">{star} Star</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground transition-[width]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right font-medium tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right — CTA */}
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          Write a review
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <VisuallyHidden>
            <DialogTitle>Write a review</DialogTitle>
            <DialogDescription>
              Share your experience with this product.
            </DialogDescription>
          </VisuallyHidden>
          <h3 className="font-display text-xl font-bold">Write a review</h3>
          <ReviewForm
            productId={productId}
            onSubmitted={() => {
              onReviewSubmitted();
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
