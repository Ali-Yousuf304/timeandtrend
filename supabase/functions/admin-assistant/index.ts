// Admin Assistant edge function — uses Lovable AI Gateway with tool calling
// to perform privileged DB operations on behalf of authenticated admins.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const tools = [
  {
    type: "function",
    function: {
      name: "list_orders",
      description:
        "List orders with optional filters. Returns id, order_number (e.g. 'TT-1001'), total, status, payment_status, fulfillment_status, customer name, created_at.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filter by order status (pending, processing, shipped, delivered, cancelled)" },
          payment_status: { type: "string" },
          fulfillment_status: { type: "string" },
          since_days: { type: "number", description: "Only orders within last N days" },
          limit: { type: "number", description: "Default 20, max 100" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_orders_status",
      description:
        "Update status / payment_status / fulfillment_status for one or more orders. References like 'TT-1001', '#TT-1001' or '1001' are ORDER NUMBERS — use order_numbers. 8-character hex like 'B034E685' is a SHORT id — use id_short_prefixes. order_ids is ONLY for full UUIDs. When the user says 'Delivered and Paid', set status='delivered', fulfillment_status='delivered', payment_status='paid'.",
      parameters: {
        type: "object",
        properties: {
          order_ids: { type: "array", items: { type: "string" }, description: "Full UUIDs only — never order numbers or short ids" },
          order_numbers: {
            type: "array",
            items: { type: "string" },
            description: "Order numbers like ['TT-1001', '#TT-1002', '1003'] — matched case-insensitively; bare numbers are expanded with the configured prefix/suffix",
          },
          id_short_prefixes: {
            type: "array",
            items: { type: "string" },
            description: "8-char hex short ids like ['B034E685'] — matched case-insensitively against the start of the order UUID",
          },
          number_range_from: { type: "number", description: "Start of a numeric order-number range, e.g. 1001 for '1001 to 1009'" },
          number_range_to: { type: "number", description: "End of a numeric order-number range, e.g. 1009" },
          status: { type: "string" },
          payment_status: { type: "string" },
          fulfillment_status: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_discount",
      description: "Create a discount/promo code.",
      parameters: {
        type: "object",
        required: ["code", "discount_type", "discount_value"],
        properties: {
          code: { type: "string" },
          discount_type: { type: "string", enum: ["percentage", "fixed"] },
          discount_value: { type: "number" },
          min_order_amount: { type: "number" },
          usage_limit: { type: "number" },
          active: { type: "boolean" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_discount",
      description: "Update an existing discount by code.",
      parameters: {
        type: "object",
        required: ["code"],
        properties: {
          code: { type: "string" },
          active: { type: "boolean" },
          discount_value: { type: "number" },
          usage_limit: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_discount",
      description: "Delete a discount by code.",
      parameters: {
        type: "object",
        required: ["code"],
        properties: { code: { type: "string" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_products",
      description: "List products with optional filter by category or style.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string" },
          style: { type: "string" },
          name_contains: { type: "string" },
          limit: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_products",
      description:
        "Bulk update products. Filter by category/style/ids and apply changes (badges add/remove, price multiplier, etc.)",
      parameters: {
        type: "object",
        properties: {
          filter_category: { type: "string" },
          filter_style: { type: "string" },
          product_ids: { type: "array", items: { type: "string" } },
          add_badge: { type: "string", enum: ["new", "bestseller"] },
          remove_badge: { type: "string", enum: ["new", "bestseller"] },
          price_multiplier: { type: "number", description: "Multiply price by this (e.g. 0.9 for 10% off)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "sales_summary",
      description: "Compute revenue / order counts for a window (today, yesterday, 7d, 30d, all).",
      parameters: {
        type: "object",
        properties: {
          window: { type: "string", enum: ["today", "yesterday", "7d", "30d", "all"] },
        },
      },
    },
  },
  ...[
    ["list_customer_queries", "List customer queries (newest first).", { is_read: { type: "boolean" }, limit: { type: "number" } }],
    ["reply_customer_query", "Reply to a customer query as admin and mark it read. Identify by query_id, or by query_email and/or query_name_contains (most recent match).", { query_id: { type: "string" }, query_email: { type: "string" }, query_name_contains: { type: "string" }, reply_message: { type: "string" } }, ["reply_message"]],
    ["mark_customer_query_read", "Mark a customer query read/unread. Identify by query_id or query_email/query_name_contains.", { query_id: { type: "string" }, query_email: { type: "string" }, query_name_contains: { type: "string" }, is_read: { type: "boolean" } }],
    ["list_collections", "List collections.", {}],
    ["update_collection", "Update a collection by id, or name/slug match.", { id: { type: "string" }, name_or_slug: { type: "string" }, active: { type: "boolean" }, sort_order: { type: "number" }, name: { type: "string" } }],
    ["list_banners", "List homepage banners.", {}],
    ["update_banner", "Update a banner by id or title match.", { id: { type: "string" }, title_match: { type: "string" }, active: { type: "boolean" }, sort_order: { type: "number" }, title: { type: "string" }, subtitle: { type: "string" }, cta_label: { type: "string" }, cta_link: { type: "string" } }],
    ["create_banner", "Create a banner. image (URL) is required.", { title: { type: "string" }, image: { type: "string" }, subtitle: { type: "string" }, cta_label: { type: "string" }, cta_link: { type: "string" }, active: { type: "boolean" }, sort_order: { type: "number" } }, ["title"]],
    ["list_reviews", "List product reviews.", { enabled: { type: "boolean" }, product_name_contains: { type: "string" }, limit: { type: "number" } }],
    ["update_review", "Enable/disable a review by id.", { id: { type: "string" }, enabled: { type: "boolean" } }, ["id"]],
    ["delete_review", "Delete a review by id (destructive — confirm first).", { id: { type: "string" } }, ["id"]],
    ["get_settings", "Get store settings.", {}],
    ["update_settings", "Update store settings. Allowed fields: store_name, contact_email, contact_phone, contact_address, whatsapp_number, whatsapp_enabled, shipping_flat_rate, shipping_free_threshold, shipping_note, social_links, order_number_prefix, order_number_suffix, payment_methods.", { fields: { type: "object" } }, ["fields"]],
    ["list_customers", "List customer profiles.", { email_contains: { type: "string" }, limit: { type: "number" } }],
    ["list_promo_messages", "List promo bar messages.", {}],
    ["update_promo_message", "Update a promo bar message by id.", { id: { type: "string" }, active: { type: "boolean" }, message: { type: "string" }, sort_order: { type: "number" } }, ["id"]],
  ].map(([name, description, properties, required]: any) => ({
    type: "function",
    function: { name, description, parameters: { type: "object", properties, ...(required ? { required } : {}) } },
  })),
];

const SETTINGS_ALLOWED = [
  "store_name", "contact_email", "contact_phone", "contact_address", "whatsapp_number", "whatsapp_enabled",
  "shipping_flat_rate", "shipping_free_threshold", "shipping_note", "social_links",
  "order_number_prefix", "order_number_suffix", "payment_methods",
];

async function resolveQueryId(args: any, db: any): Promise<string | null> {
  if (args.query_id) return args.query_id;
  if (!args.query_email && !args.query_name_contains) return null;
  let q = db.from("customer_queries").select("id");
  if (args.query_email) q = q.ilike("email", args.query_email.trim());
  if (args.query_name_contains) q = q.ilike("name", `%${args.query_name_contains}%`);
  const { data } = await q.order("created_at", { ascending: false }).limit(1);
  return data?.[0]?.id ?? null;
}

const pick = (args: any, keys: string[]) => {
  const o: any = {};
  for (const k of keys) if (args[k] !== undefined) o[k] = args[k];
  return o;
};

async function callTool(name: string, args: any, db: any) {
  switch (name) {
    case "list_orders": {
      let q = db.from("orders").select("id,order_number,total,status,payment_status,fulfillment_status,shipping_name,created_at");
      if (args.status) q = q.eq("status", args.status);
      if (args.payment_status) q = q.eq("payment_status", args.payment_status);
      if (args.fulfillment_status) q = q.eq("fulfillment_status", args.fulfillment_status);
      if (args.since_days) {
        const d = new Date();
        d.setDate(d.getDate() - args.since_days);
        q = q.gte("created_at", d.toISOString());
      }
      q = q.order("created_at", { ascending: false }).limit(Math.min(args.limit ?? 20, 100));
      const { data, error } = await q;
      if (error) return { error: error.message };
      return { orders: data };
    }
    case "update_orders_status": {
      const update: any = {};
      if (args.status) update.status = args.status;
      if (args.payment_status) update.payment_status = args.payment_status;
      if (args.fulfillment_status) update.fulfillment_status = args.fulfillment_status;
      if (Object.keys(update).length === 0) return { error: "No fields to update" };

      let ids: string[] = args.order_ids ?? [];
      const notFound: string[] = [];

      const clean = (s: string) => String(s).trim().replace(/^#+/, "").trim();

      // Short-id prefixes: case-insensitive, "#" stripped
      if (args.id_short_prefixes?.length) {
        const prefixes = args.id_short_prefixes.map((p: string) => clean(p).toLowerCase());
        const { data } = await db.from("orders").select("id");
        const matches = (data ?? [])
          .filter((o: any) =>
            prefixes.some((p: string) => o.id.toLowerCase().startsWith(p)),
          )
          .map((o: any) => o.id);
        ids = [...ids, ...matches];
      }

      // Order numbers: expand numeric ranges, then resolve against order_number
      const numberRefs: string[] = [...(args.order_numbers ?? [])];
      if (args.number_range_from != null && args.number_range_to != null) {
        for (let n = args.number_range_from; n <= args.number_range_to; n++) {
          numberRefs.push(String(n));
        }
      }
      if (numberRefs.length) {
        const { data: settings } = await db
          .from("site_settings")
          .select("order_number_prefix,order_number_suffix")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        const prefix = settings?.order_number_prefix ?? "";
        const suffix = settings?.order_number_suffix ?? "";

        const { data: allOrders } = await db.from("orders").select("id,order_number");
        const byNumber = new Map<string, string>();
        for (const o of allOrders ?? []) {
          if (o.order_number) byNumber.set(String(o.order_number).toLowerCase(), o.id);
        }
        for (const ref of numberRefs) {
          const c = clean(ref);
          let hit = byNumber.get(c.toLowerCase());
          if (!hit) hit = byNumber.get(`${prefix}${c}${suffix}`.toLowerCase());
          if (hit) ids.push(hit);
          else notFound.push(ref);
        }
      }

      ids = [...new Set(ids)];
      if (!ids.length) return { error: "No orders matched", not_found: notFound };
      const { error, count } = await db.from("orders").update(update).in("id", ids).select("id", { count: "exact" });
      if (error) return { error: error.message };
      return { updated: count ?? ids.length, not_found: notFound.length ? notFound : undefined };
    }
    case "create_discount": {
      const { data, error } = await db.from("discounts").insert({
        code: args.code.toUpperCase(),
        discount_type: args.discount_type,
        discount_value: args.discount_value,
        min_order_amount: args.min_order_amount ?? 0,
        usage_limit: args.usage_limit ?? null,
        active: args.active ?? true,
      }).select().single();
      if (error) return { error: error.message };
      return { created: data };
    }
    case "update_discount": {
      const update: any = {};
      if (args.active !== undefined) update.active = args.active;
      if (args.discount_value !== undefined) update.discount_value = args.discount_value;
      if (args.usage_limit !== undefined) update.usage_limit = args.usage_limit;
      const { data, error } = await db.from("discounts").update(update).eq("code", args.code.toUpperCase()).select();
      if (error) return { error: error.message };
      return { updated: data };
    }
    case "delete_discount": {
      const { error } = await db.from("discounts").delete().eq("code", args.code.toUpperCase());
      if (error) return { error: error.message };
      return { deleted: args.code };
    }
    case "list_products": {
      let q = db.from("products").select("id,name,category,style,price,badges");
      if (args.category) q = q.eq("category", args.category);
      if (args.style) q = q.eq("style", args.style);
      if (args.name_contains) q = q.ilike("name", `%${args.name_contains}%`);
      q = q.limit(Math.min(args.limit ?? 50, 200));
      const { data, error } = await q;
      if (error) return { error: error.message };
      return { products: data };
    }
    case "update_products": {
      let q = db.from("products").select("id,price,badges");
      if (args.filter_category) q = q.eq("category", args.filter_category);
      if (args.filter_style) q = q.eq("style", args.filter_style);
      if (args.product_ids?.length) q = q.in("id", args.product_ids);
      const { data: rows, error: selErr } = await q;
      if (selErr) return { error: selErr.message };
      let updated = 0;
      for (const row of rows ?? []) {
        const update: any = {};
        if (args.add_badge) {
          const set = new Set([...(row.badges ?? []), args.add_badge]);
          update.badges = Array.from(set);
        }
        if (args.remove_badge) {
          update.badges = (row.badges ?? []).filter((b: string) => b !== args.remove_badge);
        }
        if (args.price_multiplier) {
          update.price = Math.round(Number(row.price) * args.price_multiplier);
        }
        if (Object.keys(update).length === 0) continue;
        const { error } = await db.from("products").update(update).eq("id", row.id);
        if (!error) updated++;
      }
      return { updated };
    }
    case "sales_summary": {
      const now = new Date();
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      let from: Date | null = null;
      let to: Date | null = null;
      const w = args.window ?? "7d";
      if (w === "today") from = start;
      else if (w === "yesterday") {
        from = new Date(start);
        from.setDate(from.getDate() - 1);
        to = start;
      } else if (w === "7d") {
        from = new Date(start);
        from.setDate(from.getDate() - 6);
      } else if (w === "30d") {
        from = new Date(start);
        from.setDate(from.getDate() - 29);
      }
      let q = db.from("orders").select("total,status");
      if (from) q = q.gte("created_at", from.toISOString());
      if (to) q = q.lt("created_at", to.toISOString());
      const { data, error } = await q;
      if (error) return { error: error.message };
      const orders = data ?? [];
      const revenue = orders.filter((o: any) => o.status !== "cancelled").reduce((s: number, o: any) => s + Number(o.total), 0);
      return { window: w, revenue, order_count: orders.length };
    }
    case "list_customer_queries": {
      let q = db.from("customer_queries").select("id,name,email,message,is_read,created_at");
      if (args.is_read !== undefined) q = q.eq("is_read", args.is_read);
      const { data, error } = await q.order("created_at", { ascending: false }).limit(Math.min(args.limit ?? 20, 100));
      if (error) return { error: error.message };
      return { queries: data };
    }
    case "reply_customer_query": {
      if (!args.reply_message) return { error: "reply_message is required" };
      const qid = await resolveQueryId(args, db);
      if (!qid) return { error: "Customer query not found" };
      const { error } = await db.from("customer_query_replies").insert({ query_id: qid, author_role: "admin", message: args.reply_message });
      if (error) return { error: error.message };
      await db.from("customer_queries").update({ is_read: true }).eq("id", qid);
      return { replied: true, query_id: qid };
    }
    case "mark_customer_query_read": {
      const qid = await resolveQueryId(args, db);
      if (!qid) return { error: "Customer query not found" };
      const { error } = await db.from("customer_queries").update({ is_read: args.is_read ?? true }).eq("id", qid);
      if (error) return { error: error.message };
      return { query_id: qid, is_read: args.is_read ?? true };
    }
    case "list_collections": {
      const { data, error } = await db.from("collections").select("id,name,slug,kind,active,sort_order").order("sort_order");
      if (error) return { error: error.message };
      return { collections: data };
    }
    case "update_collection": {
      const update = pick(args, ["active", "sort_order", "name"]);
      if (!Object.keys(update).length) return { error: "No fields to update" };
      let id = args.id;
      if (!id && args.name_or_slug) {
        const m = args.name_or_slug.trim();
        const { data } = await db.from("collections").select("id").or(`name.ilike.%${m}%,slug.ilike.%${m}%`).limit(1);
        id = data?.[0]?.id;
      }
      if (!id) return { error: "Collection not found" };
      const { data, error } = await db.from("collections").update(update).eq("id", id).select();
      if (error) return { error: error.message };
      return { updated: data };
    }
    case "list_banners": {
      const { data, error } = await db.from("banners").select("id,title,subtitle,eyebrow,image,cta_label,cta_link,active,sort_order").order("sort_order");
      if (error) return { error: error.message };
      return { banners: data };
    }
    case "update_banner": {
      const update = pick(args, ["active", "sort_order", "title", "subtitle", "cta_label", "cta_link"]);
      if (!Object.keys(update).length) return { error: "No fields to update" };
      let id = args.id;
      if (!id && args.title_match) {
        const { data } = await db.from("banners").select("id").ilike("title", `%${args.title_match}%`).limit(1);
        id = data?.[0]?.id;
      }
      if (!id) return { error: "Banner not found" };
      const { data, error } = await db.from("banners").update(update).eq("id", id).select();
      if (error) return { error: error.message };
      return { updated: data };
    }
    case "create_banner": {
      if (!args.image || typeof args.image !== "string") return { error: "An image URL is required to create a banner. Please provide one." };
      const { data, error } = await db.from("banners").insert({
        title: args.title, image: args.image, subtitle: args.subtitle ?? null,
        cta_label: args.cta_label ?? null, cta_link: args.cta_link ?? null,
        active: args.active ?? true, sort_order: args.sort_order ?? 0,
      }).select().single();
      if (error) return { error: error.message };
      return { created: data };
    }
    case "list_reviews": {
      let q = db.from("reviews").select("id,product_id,rating,title,body,enabled,created_at");
      if (args.enabled !== undefined) q = q.eq("enabled", args.enabled);
      if (args.product_name_contains) {
        const { data: prods } = await db.from("products").select("id,name").ilike("name", `%${args.product_name_contains}%`);
        const ids = (prods ?? []).map((p: any) => p.id);
        if (!ids.length) return { reviews: [] };
        q = q.in("product_id", ids);
      }
      const { data, error } = await q.order("created_at", { ascending: false }).limit(Math.min(args.limit ?? 20, 100));
      if (error) return { error: error.message };
      const pids = [...new Set((data ?? []).map((r: any) => r.product_id))];
      const names = new Map<string, string>();
      if (pids.length) {
        const { data: prods } = await db.from("products").select("id,name").in("id", pids);
        for (const p of prods ?? []) names.set(p.id, p.name);
      }
      return { reviews: (data ?? []).map((r: any) => ({ ...r, product_name: names.get(r.product_id) ?? null })) };
    }
    case "update_review": {
      if (args.enabled === undefined) return { error: "No fields to update" };
      const { data, error } = await db.from("reviews").update({ enabled: args.enabled }).eq("id", args.id).select("id,enabled");
      if (error) return { error: error.message };
      return { updated: data };
    }
    case "delete_review": {
      const { error } = await db.from("reviews").delete().eq("id", args.id);
      if (error) return { error: error.message };
      return { deleted: args.id };
    }
    case "get_settings": {
      const { data, error } = await db.from("site_settings").select("*").order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (error) return { error: error.message };
      if (!data) return { settings: null };
      const { postex_api_key: _redacted, ...safe } = data;
      return { settings: safe };
    }
    case "update_settings": {
      const fields = args.fields ?? {};
      const update = pick(fields, SETTINGS_ALLOWED);
      const rejected = Object.keys(fields).filter((k) => !SETTINGS_ALLOWED.includes(k));
      if (!Object.keys(update).length) return { error: "No allowed fields to update", rejected };
      const { data: row } = await db.from("site_settings").select("id").order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (!row) return { error: "Settings row not found" };
      const { error } = await db.from("site_settings").update(update).eq("id", row.id);
      if (error) return { error: error.message };
      return { updated_fields: Object.keys(update), rejected: rejected.length ? rejected : undefined };
    }
    case "list_customers": {
      let q = db.from("profiles").select("id,display_name,email,phone,city,created_at");
      if (args.email_contains) q = q.ilike("email", `%${args.email_contains}%`);
      const { data, error } = await q.order("created_at", { ascending: false }).limit(Math.min(args.limit ?? 20, 100));
      if (error) return { error: error.message };
      return { customers: data };
    }
    case "list_promo_messages": {
      const { data, error } = await db.from("promo_messages").select("id,message,active,sort_order").order("sort_order");
      if (error) return { error: error.message };
      return { promo_messages: data };
    }
    case "update_promo_message": {
      const update = pick(args, ["active", "message", "sort_order"]);
      if (!Object.keys(update).length) return { error: "No fields to update" };
      const { data, error } = await db.from("promo_messages").update(update).eq("id", args.id).select();
      if (error) return { error: error.message };
      return { updated: data };
    }
    default:
      return { error: `Unknown tool ${name}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Verify caller is admin
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleData } = await admin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleData) return new Response(JSON.stringify({ error: "Forbidden — admin only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { messages } = await req.json();

    const systemPrompt = `You are an admin assistant for the Time & Trend e-commerce store. You can perform DB operations via tools across the whole admin panel: orders, discounts, products, sales, customer queries (list, reply, mark read), collections, banners (list, create, update), reviews (list, enable/disable, delete), store settings (view/update; PostEx credentials are never exposed or editable here), customers, and promo bar messages. Be concise. Always reply in the same language and script the admin used in their message — including Roman Urdu (Urdu written in Latin letters) — matching their tone; keep tool/function calls and DB field values in English/as-is. After each operation, summarize what was done in 1-2 sentences. If the user's intent is unclear or destructive (delete_review, delete_discount, anything deleting data, or bulk updates affecting many records), confirm before acting. Customer-query replies are read directly by the customer — write them professionally, warmly and on-brand for Time & Trend. Order references like 'TT-1001', '#TT-1001' or '1001' are ORDER NUMBERS — pass them to update_orders_status via order_numbers (ranges like '1001 to 1009' via number_range_from/number_range_to). 8-character hex like 'B034E685' is a SHORT id — use id_short_prefixes. NEVER put order numbers or short ids into order_ids; that array is for full UUIDs only. When the user says 'Delivered and Paid', set status='delivered', fulfillment_status='delivered', payment_status='paid'. If a tool result includes not_found, mention those references in your reply. Today is ${new Date().toISOString().slice(0, 10)}.`;

    const conversation: any[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Tool-calling loop (max 5 rounds)
    for (let round = 0; round < 5; round++) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: conversation,
          tools,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (res.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        console.error("Gateway error", err);
        return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const data = await res.json();
      const msg = data.choices?.[0]?.message;
      if (!msg) break;
      conversation.push(msg);

      const calls = msg.tool_calls;
      if (!calls?.length) {
        return new Response(JSON.stringify({ reply: msg.content ?? "" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      for (const call of calls) {
        let args: any = {};
        try { args = JSON.parse(call.function.arguments || "{}"); } catch {}
        const result = await callTool(call.function.name, args, admin);
        conversation.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
    }

    return new Response(JSON.stringify({ reply: "Done." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("admin-assistant error", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
