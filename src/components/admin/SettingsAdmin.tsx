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
  Building2,
  Upload,
  MessageCircle,
  Share2,
  Megaphone,
  GripVertical,
  Hash,
} from "lucide-react";
import {
  useSiteSettings,
  type PaymentMethod,
  type SocialLinks,
  defaultSocialLinks,
} from "@/hooks/use-settings";
import { usePromoMessages, type PromoMessage } from "@/hooks/use-promo-messages";
import { cn } from "@/lib/utils";

type SettingsSection =
  | "general"
  | "promo"
  | "orders"
  | "payment"
  | "shipping"
  | "whatsapp"
  | "social";

const sections: { id: SettingsSection; label: string; icon: typeof CreditCard }[] = [
  { id: "general", label: "General", icon: Building2 },
  { id: "promo", label: "Promo Bar", icon: Megaphone },
  { id: "orders", label: "Orders", icon: Hash },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "social", label: "Social Media", icon: Share2 },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
];

const SOCIAL_KEYS: (keyof SocialLinks)[] = ["instagram", "facebook", "tiktok", "youtube"];
const SOCIAL_LABELS: Record<keyof SocialLinks, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export function SettingsAdmin() {
  const { settings, loading, reload } = useSiteSettings();
  const [active, setActive] = React.useState<SettingsSection>("general");

  // General
  const [storeName, setStoreName] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("");
  const [contactAddress, setContactAddress] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [logoUploading, setLogoUploading] = React.useState(false);

  // Payment
  const [methods, setMethods] = React.useState<PaymentMethod[]>([]);

  // Shipping
  const [flatRate, setFlatRate] = React.useState("");
  const [freeThreshold, setFreeThreshold] = React.useState("");
  const [note, setNote] = React.useState("");
  const [postexKey, setPostexKey] = React.useState("");
  const [postexPickup, setPostexPickup] = React.useState("");

  // WhatsApp
  const [whatsapp, setWhatsapp] = React.useState("");
  const [whatsappEnabled, setWhatsappEnabled] = React.useState(true);

  // Social
  const [social, setSocial] = React.useState<SocialLinks>(defaultSocialLinks);

  // Order numbering
  const [orderPrefix, setOrderPrefix] = React.useState("");
  const [orderSuffix, setOrderSuffix] = React.useState("");
  const [orderNext, setOrderNext] = React.useState("1000");

  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name ?? "");
      setContactEmail(settings.contact_email ?? "");
      setContactPhone(settings.contact_phone ?? "");
      setContactAddress(settings.contact_address ?? "");
      setLogoUrl(settings.logo_url ?? "");
      setMethods(settings.payment_methods);
      setFlatRate(String(settings.shipping_flat_rate));
      setFreeThreshold(String(settings.shipping_free_threshold));
      setNote(settings.shipping_note ?? "");
      setPostexKey(settings.postex_api_key ?? "");
      setPostexPickup(settings.postex_pickup_address_code ?? "");
      setWhatsapp(settings.whatsapp_number ?? "");
      setWhatsappEnabled(settings.whatsapp_enabled);
      setSocial(settings.social_links);
      setOrderPrefix(settings.order_number_prefix ?? "");
      setOrderSuffix(settings.order_number_suffix ?? "");
      setOrderNext(String(settings.order_number_next ?? 1000));
    }
  }, [settings]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    setLogoUploading(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("site-assets")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (upErr) {
      setLogoUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    setLogoUrl(data.publicUrl);
    setLogoUploading(false);
    toast.success("Logo uploaded — click Save to apply");
  }

  async function update(patch: Record<string, unknown>, successMsg: string) {
    if (!settings) return;
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("site_settings") as any)
      .update(patch)
      .eq("id", settings.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(successMsg);
      reload();
    }
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
          Configure your store, payments, shipping, and integrations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <aside>
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

        <div className="min-w-0">
          {active === "general" && (
            <div className="space-y-4 rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">Store details</h3>
              <p className="text-xs text-muted-foreground">
                These values power the Contact page, footer, and WhatsApp button.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="store-name">Store name</Label>
                  <Input
                    id="store-name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Time & Trend"
                  />
                </div>
                <div>
                  <Label htmlFor="store-email">Contact email</Label>
                  <Input
                    id="store-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="hello@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="store-phone">Contact phone</Label>
                  <Input
                    id="store-phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+92 300 0000000"
                  />
                </div>
                <div>
                  <Label htmlFor="store-address">Address</Label>
                  <Input
                    id="store-address"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="Karachi, Pakistan"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-semibold">Logo</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Used in the header and footer. Transparent PNG recommended.
                </p>

                {logoUrl && (
                  <div className="mt-3 flex items-center gap-4 rounded-md border border-border bg-muted/30 p-4">
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

                <div className="mt-3">
                  <Label htmlFor="logo-upload" className="text-sm">
                    Upload logo image
                  </Label>
                  <div className="mt-1 flex items-center gap-3">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={logoUploading}
                    />
                    {logoUploading && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Upload className="h-3.5 w-3.5 animate-pulse" /> Uploading…
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() =>
                  update(
                    {
                      store_name: storeName.trim() || null,
                      contact_email: contactEmail.trim() || null,
                      contact_phone: contactPhone.trim() || null,
                      contact_address: contactAddress.trim() || null,
                      logo_url: logoUrl || null,
                    },
                    "General settings saved",
                  )
                }
                disabled={saving}
                className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
              >
                {saving ? "Saving…" : "Save general settings"}
              </Button>
            </div>
          )}

          {active === "payment" && (
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Checkout payment methods</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setMethods([
                      ...methods,
                      { id: `m_${Date.now()}`, label: "New method", enabled: true },
                    ])
                  }
                >
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
                    <Switch
                      checked={m.enabled}
                      onCheckedChange={(v) => {
                        const next = [...methods];
                        next[i] = { ...m, enabled: v };
                        setMethods(next);
                      }}
                    />
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
                  update({ payment_methods: methods }, "Payment methods updated")
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
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold">PostEx Pakistan (Courier)</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Required to ship orders via PostEx from each order's details panel.
                </p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="postex-key">PostEx API key (token)</Label>
                    <Input
                      id="postex-key"
                      type="password"
                      autoComplete="off"
                      value={postexKey}
                      onChange={(e) => setPostexKey(e.target.value)}
                      placeholder="Paste PostEx API token"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postex-pickup">Pickup address code</Label>
                    <Input
                      id="postex-pickup"
                      value={postexPickup}
                      onChange={(e) => setPostexPickup(e.target.value)}
                      placeholder="e.g. 001"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={() =>
                  update(
                    {
                      shipping_flat_rate: Number(flatRate) || 0,
                      shipping_free_threshold: Number(freeThreshold) || 0,
                      shipping_note: note || null,
                      postex_api_key: postexKey.trim() || null,
                      postex_pickup_address_code: postexPickup.trim() || null,
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

          {active === "whatsapp" && (
            <div className="space-y-4 rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">WhatsApp contact</h3>
              <p className="text-xs text-muted-foreground">
                Include country code without spaces (e.g. <code>923001234567</code>).
              </p>

              <div className="flex items-center gap-3 rounded-md border border-border p-3">
                <Switch
                  checked={whatsappEnabled}
                  onCheckedChange={setWhatsappEnabled}
                />
                <div>
                  <p className="text-sm font-medium">Enable WhatsApp button</p>
                  <p className="text-xs text-muted-foreground">
                    Show the floating WhatsApp button on every page.
                  </p>
                </div>
              </div>

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
                    {
                      whatsapp_number: whatsapp.trim() || null,
                      whatsapp_enabled: whatsappEnabled,
                    },
                    "WhatsApp settings updated",
                  )
                }
                disabled={saving}
                className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
              >
                {saving ? "Saving…" : "Save WhatsApp settings"}
              </Button>
            </div>
          )}

          {active === "social" && (
            <div className="space-y-4 rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">Social media links</h3>
              <p className="text-xs text-muted-foreground">
                Enabled links with a URL appear in the footer.
              </p>

              <div className="space-y-3">
                {SOCIAL_KEYS.map((key) => (
                  <div
                    key={key}
                    className="space-y-2 rounded-md border border-border p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-sm font-medium">
                        {SOCIAL_LABELS[key]}
                      </Label>
                      <Switch
                        checked={social[key].enabled}
                        onCheckedChange={(v) =>
                          setSocial({
                            ...social,
                            [key]: { ...social[key], enabled: v },
                          })
                        }
                      />
                    </div>
                    <Input
                      value={social[key].url}
                      onChange={(e) =>
                        setSocial({
                          ...social,
                          [key]: { ...social[key], url: e.target.value },
                        })
                      }
                      placeholder={`https://${key}.com/yourhandle`}
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={() => update({ social_links: social }, "Social links saved")}
                disabled={saving}
                className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
              >
                {saving ? "Saving…" : "Save social links"}
              </Button>
            </div>
          )}

          {active === "promo" && <PromoManager />}
        </div>
      </div>
    </div>
  );
}

function PromoManager() {
  const { messages, reload } = usePromoMessages(false);
  const [local, setLocal] = React.useState<PromoMessage[]>([]);
  const [newMsg, setNewMsg] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setLocal(messages);
  }, [messages]);

  async function add() {
    if (!newMsg.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("promo_messages")
      .insert({ message: newMsg.trim(), active: true, sort_order: local.length });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      setNewMsg("");
      toast.success("Promo added");
      reload();
    }
  }

  async function save(m: PromoMessage) {
    const { error } = await supabase
      .from("promo_messages")
      .update({ message: m.message, active: m.active, sort_order: m.sort_order })
      .eq("id", m.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      reload();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("promo_messages").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      reload();
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div>
        <h3 className="font-semibold">Promo bar messages</h3>
        <p className="text-xs text-muted-foreground">
          Shown in a continuous running strip in the footer. Disable any message to
          hide it without deleting.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="e.g. Free shipping on orders over Rs. 5000"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void add();
            }
          }}
        />
        <Button
          onClick={add}
          disabled={saving || !newMsg.trim()}
          className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
        >
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {local.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No promo messages yet.
        </p>
      ) : (
        <div className="space-y-2">
          {local.map((m, i) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-md border border-border p-3"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Input
                value={m.message}
                onChange={(e) => {
                  const next = [...local];
                  next[i] = { ...m, message: e.target.value };
                  setLocal(next);
                }}
                className="flex-1"
              />
              <Switch
                checked={m.active}
                onCheckedChange={(v) => {
                  const next = [...local];
                  next[i] = { ...m, active: v };
                  setLocal(next);
                }}
              />
              <Button size="sm" variant="outline" onClick={() => save(local[i])}>
                Save
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(m.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
