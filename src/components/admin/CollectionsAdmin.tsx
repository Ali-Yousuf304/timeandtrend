import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Kind = "category" | "style";

interface Collection {
  id: string;
  name: string;
  slug: string;
  kind: Kind;
  sort_order: number;
  active: boolean;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CollectionsAdmin() {
  const [items, setItems] = React.useState<Collection[] | null>(null);
  const [counts, setCounts] = React.useState<{
    category: Record<string, number>;
    style: Record<string, number>;
  }>({ category: {}, style: {} });
  const [editing, setEditing] = React.useState<Collection | null>(null);
  const [creating, setCreating] = React.useState<Kind | null>(null);
  const [deleting, setDeleting] = React.useState<Collection | null>(null);

  const load = React.useCallback(async () => {
    const [{ data: cols }, { data: prods }] = await Promise.all([
      supabase
        .from("collections")
        .select("*")
        .order("kind", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase.from("products").select("category,style"),
    ]);
    setItems((cols ?? []) as Collection[]);
    const cat: Record<string, number> = {};
    const sty: Record<string, number> = {};
    (prods ?? []).forEach((p) => {
      if (p.category) cat[p.category.toLowerCase()] = (cat[p.category.toLowerCase()] ?? 0) + 1;
      if (p.style) sty[p.style.toLowerCase()] = (sty[p.style.toLowerCase()] ?? 0) + 1;
    });
    setCounts({ category: cat, style: sty });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const byKind = (k: Kind) => (items ?? []).filter((c) => c.kind === k);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Collections</h2>
        <p className="text-sm text-muted-foreground">
          Manage the collections shown across the site. The product count reflects how
          many products currently match each slug.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CollectionList
          title="By category"
          kind="category"
          items={byKind("category")}
          counts={counts.category}
          loading={items === null}
          onAdd={() => setCreating("category")}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
        <CollectionList
          title="By style"
          kind="style"
          items={byKind("style")}
          counts={counts.style}
          loading={items === null}
          onAdd={() => setCreating("style")}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      </div>

      {/* Create / Edit dialog */}
      <CollectionDialog
        open={!!editing || !!creating}
        kind={editing?.kind ?? creating ?? "category"}
        initial={editing}
        onClose={() => {
          setEditing(null);
          setCreating(null);
        }}
        onSaved={() => {
          load();
          setEditing(null);
          setCreating(null);
        }}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes <span className="font-semibold">{deleting?.name}</span> from
              the collections list. Products tagged with this slug are not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleting) return;
                const { error } = await supabase
                  .from("collections")
                  .delete()
                  .eq("id", deleting.id);
                if (error) toast.error(error.message);
                else {
                  toast.success("Collection deleted");
                  load();
                }
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CollectionList({
  title,
  kind,
  items,
  counts,
  loading,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;
  kind: Kind;
  items: Collection[];
  counts: Record<string, number>;
  loading: boolean;
  onAdd: () => void;
  onEdit: (c: Collection) => void;
  onDelete: (c: Collection) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>
      {loading ? (
        <Skeleton className="h-24" />
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No collections yet. Click <span className="font-semibold">Add</span> to create
          one.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{c.name}</span>
                  {!c.active && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                      hidden
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{c.slug}</span>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  counts[c.slug]
                    ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {counts[c.slug] ?? 0}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(c)}
                  aria-label="Edit collection"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(c)}
                  aria-label="Delete collection"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CollectionDialog({
  open,
  kind,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  kind: Kind;
  initial: Collection | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [k, setK] = React.useState<Kind>(kind);
  const [sortOrder, setSortOrder] = React.useState("0");
  const [active, setActive] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setSlug(initial?.slug ?? "");
      setK(initial?.kind ?? kind);
      setSortOrder(String(initial?.sort_order ?? 0));
      setActive(initial?.active ?? true);
      setSlugTouched(!!initial);
    }
  }, [open, initial, kind]);

  React.useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  async function save() {
    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      kind: k,
      sort_order: Number(sortOrder) || 0,
      active,
    };
    const { error } = initial
      ? await supabase.from("collections").update(payload).eq("id", initial.id)
      : await supabase.from("collections").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(initial ? "Collection updated" : "Collection created");
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit collection" : "New collection"}</DialogTitle>
          <DialogDescription>
            The slug must match the value stored on a product&apos;s {k} field for it to
            appear in this collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="c-name">Name</Label>
            <Input
              id="c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Luxury Pret"
            />
          </div>
          <div>
            <Label htmlFor="c-slug">Slug</Label>
            <Input
              id="c-slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="e.g. luxury-pret"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Lowercase, hyphenated. Must match the product {k} value.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="c-kind">Type</Label>
              <Select value={k} onValueChange={(v) => setK(v as Kind)}>
                <SelectTrigger id="c-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="style">Style</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="c-order">Sort order</Label>
              <Input
                id="c-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="text-sm font-medium">Visible on site</p>
              <p className="text-xs text-muted-foreground">
                Hide to remove from public collection menus.
              </p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
          >
            {saving ? "Saving…" : initial ? "Save changes" : "Create collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
