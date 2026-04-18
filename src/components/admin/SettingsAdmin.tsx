import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, CreditCard, Truck, ImageIcon, Upload } from "lucide-react";
import { useSiteSettings, type PaymentMethod } from "@/hooks/use-settings";

export function SettingsAdmin() {
  const { settings, loading, reload } = useSiteSettings();
  const [methods, setMethods] = React.useState<PaymentMethod[]>([]);
  const [flatRate, setFlatRate] = React.useState("");
  const [freeThreshold, setFreeThreshold] = React.useState("");
  const [note, setNote] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setMethods(settings.payment_methods);
      setFlatRate(String(settings.shipping_flat_rate));
      setFreeThreshold(String(settings.shipping_free_threshold));
      setNote(settings.shipping_note ?? "");
      setLogoUrl(settings.logo_url ?? "");
    }
  }, [settings]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("site-assets")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    setLogoUrl(data.publicUrl);
    setUploading(false);
    toast.success("Logo uploaded — click Save to apply");
  }

  async function saveLogo() {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({ logo_url: logoUrl || null })
      .eq("id", settings.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Logo updated");
      reload();
    }
  }

  async function savePayment() {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({ payment_methods: methods as never })
      .eq("id", settings.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Payment methods updated");
      reload();
    }
  }

  async function saveShipping() {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        shipping_flat_rate: Number(flatRate) || 0,
        shipping_free_threshold: Number(freeThreshold) || 0,
        shipping_note: note || null,
      })
      .eq("id", settings.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Shipping settings updated");
      reload();
    }
  }

  function addMethod() {
    setMethods([
      ...methods,
      { id: `m_${Date.now()}`, label: "New method", enabled: true },
    ]);
  }

  if (loading) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Loading settings…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure payment methods and shipping charges for checkout.
        </p>
      </div>

      <Tabs defaultValue="payment" className="w-full">
        <TabsList>
          <TabsTrigger value="payment">
            <CreditCard className="mr-1.5 h-4 w-4" /> Payment
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Truck className="mr-1.5 h-4 w-4" /> Shipping
          </TabsTrigger>
          <TabsTrigger value="logo">
            <ImageIcon className="mr-1.5 h-4 w-4" /> Logo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Checkout payment methods</h3>
              <Button size="sm" variant="outline" onClick={addMethod}>
                <Plus className="mr-1 h-4 w-4" /> Add method
              </Button>
            </div>
            <div className="space-y-2">
              {methods.map((m, i) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-md border border-border p-3"
                >
                  <Input
                    value={m.label}
                    onChange={(e) => {
                      const next = [...methods];
                      next[i] = { ...m, label: e.target.value };
                      setMethods(next);
                    }}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={m.enabled}
                      onCheckedChange={(v) => {
                        const next = [...methods];
                        next[i] = { ...m, enabled: v };
                        setMethods(next);
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {m.enabled ? "On" : "Off"}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setMethods(methods.filter((_, idx) => idx !== i))
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {methods.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No payment methods. Add one to allow checkout.
                </p>
              )}
            </div>
            <Button
              onClick={savePayment}
              disabled={saving}
              className="mt-4 bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
            >
              {saving ? "Saving…" : "Save payment methods"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-3">
          <div className="space-y-4 rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold">Delivery charges</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="flat">Flat shipping rate ($)</Label>
                <Input
                  id="flat"
                  type="number"
                  min="0"
                  step="0.01"
                  value={flatRate}
                  onChange={(e) => setFlatRate(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Charged on every order below the free-shipping threshold.
                </p>
              </div>
              <div>
                <Label htmlFor="free">Free shipping over ($)</Label>
                <Input
                  id="free"
                  type="number"
                  min="0"
                  step="0.01"
                  value={freeThreshold}
                  onChange={(e) => setFreeThreshold(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Set to 0 to always charge the flat rate.
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="note">Shipping note (optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Delivered in 3-5 business days."
                rows={2}
              />
            </div>
            <Button
              onClick={saveShipping}
              disabled={saving}
              className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
            >
              {saving ? "Saving…" : "Save shipping settings"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
