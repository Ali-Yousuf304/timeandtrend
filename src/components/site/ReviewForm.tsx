import * as React from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@tanstack/react-router";

interface Props {
  productId: string;
  onSubmitted?: () => void;
}

export function ReviewForm({ productId, onSubmitted }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = React.useState(5);
  const [hover, setHover] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  if (!user) {
    return (
      <div className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        <Link to="/auth" className="font-semibold text-[var(--gold)] hover:underline">
          Sign in
        </Link>{" "}
        to leave a review.
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) {
      toast.error("Please write a review");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").upsert(
      {
        user_id: user!.id,
        product_id: productId,
        rating,
        title: title.trim() || null,
        body: body.trim(),
      },
      { onConflict: "user_id,product_id" },
    );
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Thanks for your review!");
      setTitle("");
      setBody("");
      setRating(5);
      onSubmitted?.();
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-md border border-border p-4">
      <div>
        <Label className="text-xs">Your rating</Label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5"
              aria-label={`${i} star`}
            >
              <Star
                className={`h-5 w-5 ${
                  i <= (hover || rating)
                    ? "fill-[var(--gold)] text-[var(--gold)]"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="rev-title" className="text-xs">Title (optional)</Label>
        <Input
          id="rev-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sums up your experience"
        />
      </div>
      <div>
        <Label htmlFor="rev-body" className="text-xs">Your review</Label>
        <Textarea
          id="rev-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you think of this product?"
          rows={3}
          required
        />
      </div>
      <Button
        type="submit"
        disabled={submitting}
        className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
