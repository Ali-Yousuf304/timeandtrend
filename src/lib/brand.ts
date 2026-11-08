export const STORE_NAME = "Subhani Studio";

export function storeName(settings?: { store_name?: string | null } | null) {
  return settings?.store_name?.trim() || STORE_NAME;
}

export function pageHead(page: string, description: string) {
  const title = `${page} — ${STORE_NAME}`;
  return { meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] };
}