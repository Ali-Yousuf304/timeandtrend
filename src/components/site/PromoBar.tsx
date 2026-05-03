import { useLocation } from "@tanstack/react-router";
import { usePromoMessages } from "@/hooks/use-promo-messages";

export function PromoBar() {
  const { pathname } = useLocation();
  const { messages } = usePromoMessages(true);

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  if (messages.length === 0) return null;

  return (
    <div className="overflow-hidden bg-[var(--ink)] py-2">
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
  );
}
