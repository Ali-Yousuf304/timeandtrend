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
import { Pencil, Trash2, Plus } from "lucide-react";

interface DbProduct {
  id: string;
  name: string;
  tagline: string;
  price: number;
  old_price: number | null;
  image: string;
  category: "men" | "women" | "unisex";
  style: "casual" | "formal" | "sports";
  badges: string[] | null;
  rating: number;
  description: string;
}

const ALL_BADGES = ["new", "bestseller"] as const;

export function ProductsAdmin() {
  const [items, setItems] = React.useState<DbProduct[]>([]);
  const [editing, setEditing] = React.useState<Partial<DbProduct> | null>(null);

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

  async function save() {
    if (!editing) return;
    const payload = {
      name: editing.name ?? "",
      tagline: editing.tagline ?? "",
      price: Number(editing.price ?? 0),
      old_price: editing.old_price ? Number(editing.old_price) : null,
      image: editing.image ?? "",
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
              <Label>Image URL</Label>
              <Input
                value={editing.image ?? ""}
                onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                placeholder="https://…"
              />
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
                {p.category} · {p.style} · ${Number(p.price).toLocaleString()}
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
