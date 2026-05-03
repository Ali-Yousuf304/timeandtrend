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
        "List orders with optional filters. Returns id, total, status, payment_status, fulfillment_status, customer name, created_at.",
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
        "Update status / payment_status / fulfillment_status for one or more orders. Provide either order_ids (array of UUIDs) OR a numeric range using id_range_from/id_range_to which matches the SHORT id (first 8 chars).",
      parameters: {
        type: "object",
        properties: {
          order_ids: { type: "array", items: { type: "string" } },
          id_short_prefixes: {
            type: "array",
            items: { type: "string" },
            description: "Match orders whose id starts with any of these short prefixes (e.g. ['1001','1002'])",
          },
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
];

async function callTool(name: string, args: any, db: any) {
  switch (name) {
    case "list_orders": {
      let q = db.from("orders").select("id,total,status,payment_status,fulfillment_status,shipping_name,created_at");
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
      if (args.id_short_prefixes?.length) {
        const { data } = await db.from("orders").select("id");
        const matches = (data ?? [])
          .filter((o: any) =>
            args.id_short_prefixes.some((p: string) => o.id.startsWith(p)),
          )
          .map((o: any) => o.id);
        ids = [...ids, ...matches];
      }
      if (!ids.length) return { error: "No orders matched" };
      const { error, count } = await db.from("orders").update(update).in("id", ids).select("id", { count: "exact" });
      if (error) return { error: error.message };
      return { updated: count ?? ids.length };
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

    const systemPrompt = `You are an admin assistant for the Time & Trend e-commerce store. You can perform DB operations via tools. Be concise. After each operation, summarize what was done in 1-2 sentences. If the user's intent is unclear or destructive (delete, bulk update many records), confirm before acting. When the user mentions order numbers like "1001 to 1009", treat them as short id prefixes. Today is ${new Date().toISOString().slice(0, 10)}.`;

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
