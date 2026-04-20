import { useSiteSettings } from "@/hooks/use-settings";

export function WhatsAppButton() {
  const { settings } = useSiteSettings();
  const raw = settings?.whatsapp_number?.trim();
  if (!raw) return null;

  // Strip everything that isn't a digit so the link works correctly.
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;

  const href = `https://api.whatsapp.com/send/?phone=${digits}&text=.&type=phone_number&app_absent=0`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        event.preventDefault();
        window.open(href, "_blank", "noopener,noreferrer");
      }}
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-110 hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
    >
      {/* Official WhatsApp logo */}
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.385.696 4.605 1.893 6.476L4 29l7.71-1.852A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3Zm0 21.818a9.79 9.79 0 0 1-4.99-1.366l-.358-.213-4.575 1.099 1.115-4.46-.234-.367A9.81 9.81 0 1 1 16.001 24.818Zm5.39-7.34c-.295-.148-1.747-.862-2.018-.96-.27-.099-.467-.148-.665.148-.197.295-.762.96-.935 1.158-.172.197-.345.222-.64.074-.295-.148-1.246-.459-2.373-1.464-.877-.782-1.469-1.748-1.642-2.043-.172-.295-.018-.454.13-.601.133-.132.295-.345.443-.517.148-.173.197-.296.295-.493.099-.197.05-.37-.025-.518-.074-.148-.665-1.604-.911-2.197-.24-.577-.485-.499-.665-.508l-.566-.01a1.09 1.09 0 0 0-.79.37c-.27.296-1.034 1.01-1.034 2.464 0 1.453 1.058 2.857 1.206 3.054.148.197 2.083 3.182 5.05 4.46.706.305 1.256.487 1.685.624.708.225 1.353.193 1.863.117.568-.085 1.747-.713 1.994-1.402.246-.69.246-1.28.172-1.402-.073-.123-.27-.197-.566-.345Z" />
      </svg>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
    </a>
  );
}
