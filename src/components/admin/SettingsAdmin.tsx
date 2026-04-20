import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  CreditCard,
  Truck,
  ImageIcon,
  Upload,
  MessageCircle,
} from "lucide-react";
import { useSiteSettings, type PaymentMethod } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

type SettingsSection = "payment" | "shipping" | "logo" | "whatsapp";

const sections: { id: SettingsSection; label: string; icon: typeof CreditCard }[] = [
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "logo", label: "Logo", icon: ImageIcon },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
];

export function SettingsAdmin() {
  const { settings, loading, reload } = useSiteSettings();
  const [active, setActive] = React.useState<SettingsSection>("payment");
  const [methods, setMethods] = React.useState<PaymentMethod[]>([]);
  const [flatRate, setFlatRate] = React.useState("");
  const [freeThreshold, setFreeThreshold] = React.useState("");
  const [note, setNote] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setMethods(settings.payment_methods);
      setFlatRate(String(settings.shipping_flat_rate));
      setFreeThreshold(String(settings.shipping_free_threshold));
      setNote(settings.shipping_note ?? "");
      setLogoUrl(settings.logo_url ?? "");
      setWhatsapp(settings.whatsapp_number ?? "");
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

  async function update(patch: Record<string, unknown>, successMsg: string) {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update(patch)
      .eq("id", settings.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(successMsg);
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
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure payment, shipping, branding and contact details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* Sidebar nav */}
        <aside>
          {/* Mobile: horizontal scroll chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium",
                  active === s.id
                    ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            ))}
          </div>
          {/* Desktop: vertical sidebar */}
          <nav className="hidden flex-col gap-1 rounded-lg border border-border bg-card p-2 md:flex">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active === s.id
                    ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          {active === "payment" && (
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
                onClick={() =>
                  update({ payment_methods: methods as never }, "Payment methods updated")
                }
                disabled={saving}
                className="mt-4 bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
              >
                {saving ? "Saving…" : "Save payment methods"}
              </Button>
            </div>
          )}

          {active === "shipping" && (
            <div className="space-y-4 rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">Delivery charges</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="flat">Flat shipping rate (Rs.)</Label>
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
                  <Label htmlFor="free">Free shipping over (Rs.)</Label>
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
                onClick={() =>
                  update(
                    {
                      shipping_flat_rate: Number(flatRate) || 0,
                      shipping_free_threshold: Number(freeThreshold) || 0,
                      shipping_note: note || null,
                    },
                    "Shipping settings updated",
                  )
                }
                disabled={saving}
                className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
              >
                {saving ? "Saving…" : "Save shipping settings"}
              </Button>
            </div>
          )}

          {active === "logo" && (
            <div className="space-y-4 rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">Website logo</h3>
              <p className="text-xs text-muted-foreground">
                Upload an image to replace the text logo in the header and footer.
                Transparent PNGs work best. Recommended height: 40-60px.
              </p>

              {logoUrl && (
                <div className="flex items-center gap-4 rounded-md border border-border bg-muted/30 p-4">
                  <img
                    src={logoUrl}
                    alt="Current logo"
                    className="h-12 max-w-[180px] object-contain"
                  />
                  <div className="flex-1 break-all text-xs text-muted-foreground">
                    {logoUrl}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setLogoUrl("")}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div>
                <Label htmlFor="logo-upload" className="text-sm">
                  Upload logo image
                </Label>
                <div className="mt-1 flex items-center gap-3">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                  {uploading && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Upload className="h-3.5 w-3.5 animate-pulse" /> Uploading…
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="logo-url" className="text-sm">
                  Or paste an image URL
                </Label>
                <Input
                  id="logo-url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <Button
                onClick={() => update({ logo_url: logoUrl || null }, "Logo updated")}
                disabled={saving}
                className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
              >
                {saving ? "Saving…" : "Save logo"}
              </Button>
            </div>
          )}

          {active === "whatsapp" && (
            <div className="space-y-4 rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">WhatsApp contact</h3>
              <p className="text-xs text-muted-foreground">
                Number used by the floating WhatsApp button shown on every page.
                Include the country code, no spaces (e.g. <code>923001234567</code>).
                Leave empty to hide the button.
              </p>

              <div>
                <Label htmlFor="wa">WhatsApp number</Label>
                <Input
                  id="wa"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. 923001234567"
                  inputMode="tel"
                />
              </div>

              <Button
                onClick={() =>
                  update(
                    { whatsapp_number: whatsapp.trim() || null },
                    "WhatsApp number updated",
                  )
                }
                disabled={saving}
                className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
              >
                {saving ? "Saving…" : "Save WhatsApp number"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
