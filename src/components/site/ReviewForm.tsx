import * as React from "react";
import { Star, Upload, X as XIcon } from "lucide-react";
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

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ReviewForm({ productId, onSubmitted }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = React.useState(5);
  const [hover, setHover] = React.useState(0);
  const [name, setName] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [images, setImages] = React.useState<string[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setName(data.display_name);
      });
  }, [user]);

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

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length || !user) return;
    const remaining = MAX_IMAGES - images.length;
    const batch = Array.from(files).slice(0, remaining);
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of batch) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 5MB`);
        continue;
      }
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("review-images")
        .upload(path, file, { upsert: false, cacheControl: "3600" });
      if (error) {
        toast.error(error.message);
        continue;
      }
      const { data } = supabase.storage.from("review-images").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!body.trim()) {
      toast.error("Please write a review");
      return;
    }
    setSubmitting(true);

    await supabase
      .from("profiles")
      .update({ display_name: name.trim() })
      .eq("id", user!.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("reviews") as any).upsert(
      {
        user_id: user!.id,
        product_id: productId,
        rating,
        title: title.trim() || null,
        body: body.trim(),
        image_urls: images,
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
      setImages([]);
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
        <Label htmlFor="rev-name" className="text-xs">Your name</Label>
        <Input
          id="rev-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
          maxLength={80}
        />
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

      <div>
        <Label className="text-xs">
          Photos (optional) — up to {MAX_IMAGES}
        </Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((url) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-md border border-border">
              <img src={url} alt="Review" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                aria-label="Remove"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? "Uploading…" : "Upload"}</span>
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <Button
        type="submit"
        disabled={submitting || uploading}
        className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
