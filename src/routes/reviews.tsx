import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, MessageSquare } from "lucide-react";
import { useAllReviews } from "@/hooks/use-reviews";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Time & Trend" },
      {
        name: "description",
        content: "Read what our customers say about their Time & Trend timepieces.",
      },
      { property: "og:title", content: "Reviews — Time & Trend" },
      {
        property: "og:description",
        content: "Customer reviews of our luxury watches.",
      },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { reviews, loading } = useAllReviews();
  const visible = React.useMemo(() => reviews.filter((r) => r.enabled), [reviews]);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h1 className="section-title">What Our Customers Say</h1>
        <div className="section-title-underline" />

        {loading ? (
          <p className="mt-6 text-center text-muted-foreground">Loading reviews…</p>
        ) : visible.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-border p-12 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">
              No reviews yet. Be the first to review one of our timepieces!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {visible.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border-l-4 border-[var(--gold)] bg-secondary p-8"
              >
                <div className="flex items-center gap-1">
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
                </div>
                {r.product_name && (
                  <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                    On {r.product_name}
                  </p>
                )}
                {r.title && (
                  <p className="mt-2 font-display text-lg font-semibold">{r.title}</p>
                )}
                <p className="mt-2 italic text-muted-foreground">"{r.body}"</p>
                <p className="mt-4 text-right font-display text-base font-semibold">
                  — {r.reviewer_name ?? "Anonymous"}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
