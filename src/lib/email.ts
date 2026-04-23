import { supabase } from "@/integrations/supabase/client";

export type EmailType =
  | "order_confirmation"
  | "welcome"
  | "password_reset"
  | "admin_new_order";

/**
 * Fire-and-forget email send via the `send-email` edge function.
 * Errors are swallowed (logged only) so they never block UX flows.
 */
export async function sendEmail(
  type: EmailType,
  to: string | string[],
  data: Record<string, unknown> = {},
) {
  try {
    const { error } = await supabase.functions.invoke("send-email", {
      body: { type, to, data },
    });
    if (error) console.error("[sendEmail]", type, error);
  } catch (err) {
    console.error("[sendEmail] threw", err);
  }
}

/** Pull all admin auth emails so order notifications can reach every admin. */
export async function getAdminEmails(): Promise<string[]> {
  const { data: adminRoles } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");
  const ids = (adminRoles ?? []).map((r) => r.user_id);
  if (!ids.length) return [];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("email")
    .in("id", ids);
  return (profiles ?? [])
    .map((p) => p.email)
    .filter((e): e is string => !!e && e.includes("@"));
}
