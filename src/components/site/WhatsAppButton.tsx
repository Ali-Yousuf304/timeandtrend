import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-settings";

export function WhatsAppButton() {
  const { settings } = useSiteSettings();
  const raw = settings?.whatsapp_number?.trim();
  if (!raw) return null;

  // Strip everything that isn't a digit so wa.me works correctly.
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;

  const href = `https://wa.me/${digits}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-110 hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" strokeWidth={0} />
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
    </a>
  );
}
