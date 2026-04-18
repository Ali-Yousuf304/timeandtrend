import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDiscounts, type Discount } from "@/hooks/use-discounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Tag } from "lucide-react";
import { toast } from "sonner";

interface FormState {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_order_amount: string;
  expires_at: string;
  usage_limit: string;
  active: boolean;
}

const empty: FormState = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  min_order_amount: "0",
  expires_at: "",
  usage_limit: "",
  active: true,
};

export function DiscountsAdmin() {
  const { discounts, loading, reload } = useDiscounts();
  const [form, setForm] = React.useState<FormState>(empty);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  function reset() {
    setForm(empty);
    setEditingId(null);
  }

  function startEdit(d: Discount) {
    setEditingId(d.id);
    setForm({
      code: d.code,
      discount_type: d.discount_type,
      discount_value: String(d.discount_value),
      min_order_amount: String(d.min_order_amount),
      expires_at: d.expires_at ? d.expires_at.slice(0, 10) : "",
      usage_limit: d.usage_limit !== null ? String(d.usage_limit) : "",
      active: d.active,
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.discount_value) {
      toast.error("Code and value are required");
      return;
    }
    setBusy(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount) || 0,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      active: form.active,
    };

    const { error } = editingId
      ? await supabase.from("discounts").update(payload).eq("id", editingId)
      : await supabase.from("discounts").insert(payload);

    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingId ? "Discount updated" : "Discount created");
      reset();
      reload();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this promo code?")) return;
    const { error } = await supabase.from("discounts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Discount deleted");
      reload();
    }
  }

  async function toggleActive(d: Discount, active: boolean) {
    const { error } = await supabase
      .from("discounts")
      .update({ active })
      .eq("id", d.id);
    if (error) toast.error(error.message);
    else reload();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Discounts & Promo Codes</h2>
        <p className="text-sm text-muted-foreground">
          Create promo codes that customers can apply at checkout for a discount.
        </p>
      </div>

      <form
        onSubmit={save}
        className="grid gap-4 rounded-lg border border-border bg-card p-5 shadow-sm md:grid-cols-2"
      >
        <div>
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            placeholder="SUMMER10"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Type</Label>
          <Select
            value={form.discount_type}
            onValueChange={(v) =>
              setForm({ ...form, discount_type: v as "percentage" | "fixed" })
            }
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed amount (Rs.)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="value">
            Value {form.discount_type === "percentage" ? "(%)" : "(Rs.)"}
          </Label>
          <Input
            id="value"
            type="number"
            min="1"
            step="1"
            value={form.discount_value}
            onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="min">Minimum order (Rs.)</Label>
          <Input
            id="min"
            type="number"
            min="0"
            value={form.min_order_amount}
            onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="expires">Expires (optional)</Label>
          <Input
            id="expires"
            type="date"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="limit">Usage limit (optional)</Label>
          <Input
            id="limit"
            type="number"
            min="1"
            placeholder="Unlimited"
            value={form.usage_limit}
            onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-3 md:col-span-2">
          <Switch
            id="active"
            checked={form.active}
            onCheckedChange={(v) => setForm({ ...form, active: v })}
          />
          <Label htmlFor="active">Active</Label>
        </div>
        <div className="flex gap-2 md:col-span-2">
          <Button
            type="submit"
            disabled={busy}
            className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
          >
            <Plus className="mr-1 h-4 w-4" />
            {editingId ? "Update discount" : "Create discount"}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={reset}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : discounts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <Tag className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No discounts yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {discounts.map((d) => {
            const expired = d.expires_at && new Date(d.expires_at) < new Date();
            const exhausted = d.usage_limit !== null && d.usage_count >= d.usage_limit;
            return (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[var(--gold)]/15 px-2 py-1 font-mono text-sm font-bold text-[var(--gold)]">
                      {d.code}
                    </span>
                    <span className="text-sm font-medium">
                      {d.discount_type === "percentage"
                        ? `${d.discount_value}% off`
                        : `Rs. ${Number(d.discount_value).toLocaleString()} off`}
                    </span>
                    {expired && (
                      <span className="rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                        Expired
                      </span>
                    )}
                    {exhausted && (
                      <span className="rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                        Used up
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Min order: Rs. {Number(d.min_order_amount).toLocaleString()} ·
                    Used: {d.usage_count}
                    {d.usage_limit !== null && ` / ${d.usage_limit}`}
                    {d.expires_at && ` · Expires ${new Date(d.expires_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={d.active}
                    onCheckedChange={(v) => toggleActive(d, v)}
                  />
                  <Button size="sm" variant="ghost" onClick={() => startEdit(d)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(d.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
