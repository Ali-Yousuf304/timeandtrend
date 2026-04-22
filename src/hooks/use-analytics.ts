import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@tanstack/react-router";

const SESSION_KEY = "tt_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export type AnalyticsEventType =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "purchase_completed"
  | "wishlist_add";

export async function trackEvent(
  event_type: AnalyticsEventType,
  opts: {
    product_id?: string;
    path?: string;
    user_id?: string | null;
    metadata?: Record<string, unknown>;
  } = {},
) {
  try {
    await supabase.from("analytics_events").insert({
      event_type,
      session_id: getSessionId(),
      user_id: opts.user_id ?? null,
      product_id: opts.product_id ?? null,
      path: opts.path ?? (typeof window !== "undefined" ? window.location.pathname : null),
      metadata: opts.metadata ?? {},
    });
  } catch {
    // ignore
  }
}

/** Track page views on every route change. */
export function usePageViewTracker() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const last = React.useRef<string | null>(null);

  React.useEffect(() => {
    // skip admin routes
    if (pathname.startsWith("/admin")) return;
    if (last.current === pathname) return;
    last.current = pathname;
    trackEvent("page_view", { path: pathname, user_id: user?.id ?? null });
  }, [pathname, user?.id]);
}
