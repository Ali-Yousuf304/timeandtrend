import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAllReviews } from "@/hooks/use-reviews";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Star, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export function ReviewsAdmin() {
  const { reviews, loading, reload } = useAllReviews();

  async function toggleEnabled(id: string, enabled: boolean) {
    const { error } = await supabase
      .from("reviews")
      .update({ enabled })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(enabled ? "Review enabled" : "Review disabled");
      reload();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Review deleted");
      reload();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold">Manage Reviews</h2>
        <p className="text-sm text-muted-foreground">
          Toggle visibility or remove customer reviews across all products.
        </p>
      </div>

      {loading ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Loading reviews…
        </p>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  {r.product_image && (
                    <img
                      src={r.product_image}
                      alt={r.product_name ?? ""}
                      className="h-14 w-14 shrink-0 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {r.product_name ?? "Product"}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < r.rating
                              ? "fill-[var(--gold)] text-[var(--gold)]"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      <span className="text-sm font-semibold">
                        {r.reviewer_name ?? "Anonymous"}
                      </span>
                      {r.reviewer_email && (
                        <span className="text-xs text-muted-foreground">
                          ({r.reviewer_email})
                        </span>
                      )}
                    </div>
                    {r.title && (
                      <p className="mt-2 text-sm font-medium">{r.title}</p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {r.enabled ? "Visible" : "Hidden"}
                    </span>
                    <Switch
                      checked={r.enabled}
                      onCheckedChange={(v) => toggleEnabled(r.id, v)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(r.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
