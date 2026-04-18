import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-settings";

export function Footer() {
  const { settings } = useSiteSettings();
  return (
    <footer className="bg-[var(--ink)] text-[var(--ink-foreground)]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 md:grid-cols-3 md:px-8">
        <div>
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt="Logo"
              className="h-12 max-w-[180px] object-contain brightness-0 invert"
            />
          ) : (
            <h3 className="font-display text-xl font-semibold">
              Time <span className="text-[var(--gold)]">&amp;</span> Trend
            </h3>
          )}
          <p className="mt-3 text-sm italic text-white/70">
            "Luxury on Your Wrist, Every Day."
          </p>
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
          <div className="mt-4 flex gap-3">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © 2025 Time &amp; Trend. All Rights Reserved.
      </div>
    </footer>
  );
}
