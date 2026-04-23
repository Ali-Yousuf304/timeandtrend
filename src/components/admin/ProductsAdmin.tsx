import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Upload, X as XIcon } from "lucide-react";

interface DbProduct {
  id: string;
  name: string;
  tagline: string;
  price: number;
  old_price: number | null;
  image: string;
  images: string[];
  category: "men" | "women" | "unisex";
  style: "casual" | "formal" | "sports";
  badges: string[] | null;
  rating: number;
  description: string;
}

const ALL_BADGES = ["new", "bestseller"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;

export function ProductsAdmin() {
  const [items, setItems] = React.useState<DbProduct[]>([]);
  const [editing, setEditing] = React.useState<Partial<DbProduct> | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setItems(data as DbProduct[]);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const allImages = React.useMemo(() => {
    if (!editing) return [] as string[];
    return [editing.image, ...(editing.images ?? [])].filter(
      (u): u is string => !!u && u.length > 0,
    );
  }, [editing]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !files.length || !editing) return;
    const remaining = MAX_IMAGES - allImages.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files).slice(0, remaining)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 5MB`);
        continue;
      }
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, cacheControl: "3600" });
      if (error) {
        toast.error(error.message);
        continue;
      }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }
    if (uploaded.length) {
      const newImage = editing.image || uploaded[0];
      const extras = editing.image
        ? [...(editing.images ?? []), ...uploaded]
        : [...(editing.images ?? []), ...uploaded.slice(1)];
      setEditing({ ...editing, image: newImage, images: extras });
      toast.success(`Uploaded ${uploaded.length} image${uploaded.length === 1 ? "" : "s"}`);
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  function removeImage(url: string) {
    if (!editing) return;
    if (editing.image === url) {
      const next = editing.images ?? [];
      setEditing({ ...editing, image: next[0] ?? "", images: next.slice(1) });
    } else {
      setEditing({
        ...editing,
        images: (editing.images ?? []).filter((u) => u !== url),
      });
    }
  }

  function setAsMain(url: string) {
    if (!editing || editing.image === url) return;
    const others = allImages.filter((u) => u !== url && u !== editing.image);
    setEditing({
      ...editing,
      image: url,
      images: editing.image ? [editing.image, ...others] : others,
    });
  }

  async function save() {
    if (!editing) return;
    if (!editing.image) {
      toast.error("Please upload or provide a product image");
      return;
    }
    const payload = {
      name: editing.name ?? "",
      tagline: editing.tagline ?? "",
      price: Number(editing.price ?? 0),
      old_price: editing.old_price ? Number(editing.old_price) : null,
      image: editing.image ?? "",
      images: editing.images ?? [],
      category: (editing.category ?? "men") as DbProduct["category"],
      style: (editing.style ?? "casual") as DbProduct["style"],
      badges: editing.badges ?? [],
      rating: Number(editing.rating ?? 5),
      description: editing.description ?? "",
    };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      setEditing(null);
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  }

  function toggleBadge(b: (typeof ALL_BADGES)[number]) {
    if (!editing) return;
    const current = editing.badges ?? [];
    setEditing({
      ...editing,
      badges: current.includes(b) ? current.filter((x) => x !== b) : [...current, b],
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground">
            Manage the catalog shown on the storefront.
          </p>
        </div>
        <Button
          onClick={() => setEditing({})}
          className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
        >
          <Plus className="h-4 w-4" /> New product
        </Button>
      </div>

      {editing && (
        <div className="space-y-3 rounded-lg border border-border bg-card p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                value={editing.name ?? ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Tagline</Label>
              <Input
                value={editing.tagline ?? ""}
                onChange={(e) => setEditing({ ...editing, tagline: e.target.value })}
              />
            </div>
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                value={editing.price ?? ""}
                onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Old price (optional)</Label>
              <Input
                type="number"
                value={editing.old_price ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    old_price: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label>Product images (up to {MAX_IMAGES}) — first is the main image</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {allImages.map((url, i) => (
                  <div
                    key={url}
                    className={
                      "relative h-24 w-24 overflow-hidden rounded-md border-2 " +
                      (i === 0 ? "border-[var(--gold)]" : "border-border")
                    }
                  >
                    <img src={url} alt="" className="h-full w-full bg-card object-contain p-1" />
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-[var(--gold)] px-1 text-center text-[9px] font-bold uppercase text-[var(--gold-foreground)]">
                        Main
                      </span>
                    )}
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => setAsMain(url)}
                        title="Set as main"
                        className="absolute left-1 top-1 rounded-full bg-background/90 px-1.5 text-[9px] font-bold uppercase shadow hover:bg-[var(--gold)] hover:text-[var(--gold-foreground)]"
                      >
                        Set main
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      aria-label="Remove"
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {allImages.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={uploading}
                    className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:opacity-50"
                  >
                    <Upload className="h-5 w-5" />
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
                onChange={handleImageUpload}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {allImages.length} / {MAX_IMAGES} images
              </p>
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={editing.category ?? "men"}
                onValueChange={(v) =>
                  setEditing({ ...editing, category: v as DbProduct["category"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Style</Label>
              <Select
                value={editing.style ?? "casual"}
                onValueChange={(v) =>
                  setEditing({ ...editing, style: v as DbProduct["style"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Badges</Label>
              <div className="mt-2 flex gap-2">
                {ALL_BADGES.map((b) => {
                  const active = (editing.badges ?? []).includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBadge(b)}
                      className={
                        active
                          ? "rounded-md bg-[var(--gold)] px-3 py-1.5 text-xs font-bold uppercase text-[var(--gold-foreground)]"
                          : "rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium uppercase text-muted-foreground"
                      }
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={save}
              className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
            >
              Save
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No products yet. Add your first one above.
          </p>
        )}
        {items.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
          >
            {p.image && (
              <img
                src={p.image}
                alt=""
                className="h-14 w-14 rounded bg-muted object-contain p-1"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.category} · {p.style} · Rs. {Number(p.price).toLocaleString()}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setEditing(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
