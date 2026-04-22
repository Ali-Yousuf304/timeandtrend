import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-settings";
import { usePromoMessages } from "@/hooks/use-promo-messages";
import { Facebook, Instagram, Youtube } from "lucide-react";

// Simple TikTok glyph (lucide has no TikTok icon)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3A8.5 8.5 0 0 1 17 9.3V15a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3h2.5z" />
    </svg>
  );
}

export function Footer() {
  const { settings } = useSiteSettings();
  const { messages } = usePromoMessages(true);

  const social = settings?.social_links;
  const links: { key: string; url: string; Icon: React.ComponentType<{ className?: string }>; label: string }[] = [];
  if (social?.instagram.enabled && social.instagram.url)
    links.push({ key: "ig", url: social.instagram.url, Icon: Instagram, label: "Instagram" });
  if (social?.facebook.enabled && social.facebook.url)
    links.push({ key: "fb", url: social.facebook.url, Icon: Facebook, label: "Facebook" });
  if (social?.tiktok.enabled && social.tiktok.url)
    links.push({ key: "tt", url: social.tiktok.url, Icon: TikTokIcon, label: "TikTok" });
  if (social?.youtube.enabled && social.youtube.url)
    links.push({ key: "yt", url: social.youtube.url, Icon: Youtube, label: "YouTube" });

  return (
    <footer className="bg-[var(--ink)] text-[var(--ink-foreground)]">
      {/* Running promo bar */}
      {messages.length > 0 && (
        <div className="overflow-hidden border-b border-white/10 bg-[var(--gold)]/10 py-2">
          <div className="marquee whitespace-nowrap text-xs font-medium uppercase tracking-[0.2em] text-[var(--gold)]">
            <div className="marquee-track">
              {[...messages, ...messages].map((m, i) => (
                <span key={`${m.id}-${i}`} className="mx-8 inline-flex items-center gap-8">
                  <span>{m.message}</span>
                  <span className="text-white/30">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 md:grid-cols-3 md:px-8">
        <div>
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.store_name ?? "Logo"}
              className="h-12 max-w-[180px] object-contain brightness-0 invert"
            />
          ) : (
            <h3 className="font-display text-xl font-semibold">
              {settings?.store_name ?? (
                <>Time <span className="text-[var(--gold)]">&amp;</span> Trend</>
              )}
            </h3>
          )}
          <p className="mt-3 text-sm italic text-white/70">
            "Luxury on Your Wrist, Every Day."
          </p>
          {(settings?.contact_email || settings?.contact_phone || settings?.contact_address) && (
            <ul className="mt-4 space-y-1 text-xs text-white/60">
              {settings?.contact_email && <li>{settings.contact_email}</li>}
              {settings?.contact_phone && <li>{settings.contact_phone}</li>}
              {settings?.contact_address && <li>{settings.contact_address}</li>}
            </ul>
          )}
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link to="/collections" className="hover:text-[var(--gold)]">Collections</Link></li>
            <li><Link to="/bestsellers" className="hover:text-[var(--gold)]">Best Sellers</Link></li>
            <li><Link to="/about" className="hover:text-[var(--gold)]">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-[var(--gold)]">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold">Follow Us</h3>
          {links.length === 0 ? (
            <p className="mt-4 text-xs text-white/50">Social links coming soon.</p>
          ) : (
            <div className="mt-4 flex gap-3">
              {links.map(({ key, url, Icon, label }) => (
                <a
                  key={key}
                  href={url}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © 2025 {settings?.store_name ?? "Time & Trend"}. All Rights Reserved.
      </div>
    </footer>
  );
}
