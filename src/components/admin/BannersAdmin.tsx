import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

interface DbBanner {
  id: string;
  title: string;
  subtitle: string | null;
  eyebrow: string | null;
  image: string;
  cta_label: string | null;
  cta_link: string | null;
  active: boolean;
  sort_order: number;
}

export function BannersAdmin() {
  const [items, setItems] = React.useState<DbBanner[]>([]);
  const [editing, setEditing] = React.useState<Partial<DbBanner> | null>(null);

  const load = React.useCallback(async () => {
    const { data } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setItems(data as DbBanner[]);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!editing) return;
    if (!editing.title || !editing.image) {
      toast.error("Title and image are required");
      return;
    }
    const payload = {
      title: editing.title,
      subtitle: editing.subtitle ?? null,
      eyebrow: editing.eyebrow ?? null,
      image: editing.image,
      cta_label: editing.cta_label ?? null,
      cta_link: editing.cta_link ?? null,
      active: editing.active ?? true,
      sort_order: Number(editing.sort_order ?? 0),
    };
    const { error } = editing.id
      ? await supabase.from("banners").update(payload).eq("id", editing.id)
      : await supabase.from("banners").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success("Banner saved");
      setEditing(null);
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  }

  async function toggleActive(b: DbBanner) {
    const { error } = await supabase
      .from("banners")
      .update({ active: !b.active })
      .eq("id", b.id);
    if (error) toast.error(error.message);
    else load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Banners</h2>
          <p className="text-sm text-muted-foreground">
            The active banner with the lowest sort order is shown on the homepage hero.
          </p>
        </div>
        <Button
          onClick={() => setEditing({ active: true, sort_order: items.length })}
          className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
        >
          <Plus className="h-4 w-4" /> New banner
        </Button>
      </div>

      {editing && (
        <div className="space-y-3 rounded-lg border border-border bg-card p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Title</Label>
              <Input
                value={editing.title ?? ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Discover Premium Timepieces"
              />
            </div>
            <div>
              <Label>Eyebrow</Label>
              <Input
                value={editing.eyebrow ?? ""}
                onChange={(e) => setEditing({ ...editing, eyebrow: e.target.value })}
                placeholder="Est. 2025 — Swiss Crafted"
              />
            </div>
            <div>
              <Label>Sort order</Label>
              <Input
                type="number"
                value={editing.sort_order ?? 0}
                onChange={(e) =>
                  setEditing({ ...editing, sort_order: Number(e.target.value) })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Subtitle</Label>
              <Textarea
                value={editing.subtitle ?? ""}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
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
              <Label>CTA label</Label>
              <Input
                value={editing.cta_label ?? ""}
                onChange={(e) => setEditing({ ...editing, cta_label: e.target.value })}
                placeholder="Shop Now"
              />
            </div>
            <div>
              <Label>CTA link</Label>
              <Input
                value={editing.cta_link ?? ""}
                onChange={(e) => setEditing({ ...editing, cta_link: e.target.value })}
                placeholder="/collections"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={editing.active ?? true}
                onCheckedChange={(v) => setEditing({ ...editing, active: v })}
              />
              <Label className="m-0">Active</Label>
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
            No banners yet.
          </p>
        )}
        {items.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
          >
            {b.image && (
              <img
                src={b.image}
                alt=""
                className="h-14 w-20 rounded bg-muted object-cover"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold">{b.title}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {b.subtitle ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={b.active} onCheckedChange={() => toggleActive(b)} />
              <Button variant="ghost" size="icon" onClick={() => setEditing(b)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove(b.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
