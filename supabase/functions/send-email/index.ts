// Generic email-sending edge function powered by Resend.
// Accepts: { type, to, data }
//   type: "order_confirmation" | "welcome" | "password_reset" | "admin_new_order"
//   to: recipient email
//   data: payload (order details, etc)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Time & Trend <noreply@timeandtrend.store>";

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}
interface OrderData {
  id: string;
  total: number;
  subtotal?: number;
  shipping_amount?: number;
  shipping_name?: string;
  shipping_address_line1?: string;
  shipping_city?: string;
  shipping_country?: string;
  shipping_phone?: string;
  payment_method?: string;
  customer_email?: string;
  items: OrderItem[];
}

function styledShell(inner: string) {
  return `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;background:#f6f6f6;margin:0;padding:24px;color:#1a1a1a;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="background:#1a1a1a;padding:24px;text-align:center;">
        <h1 style="color:#d4af37;margin:0;font-family:Georgia,serif;font-size:28px;">Time &amp; Trend</h1>
        <p style="color:#ffffff;opacity:0.7;margin:6px 0 0;font-size:12px;letter-spacing:0.2em;">LUXURY ON YOUR WRIST</p>
      </div>
      <div style="padding:32px 28px;">${inner}</div>
      <div style="background:#fafafa;padding:18px;text-align:center;font-size:11px;color:#888;">
        © ${new Date().getFullYear()} Time &amp; Trend. All rights reserved.
      </div>
    </div>
  </body></html>`;
}

function orderRows(items: OrderItem[]) {
  return items
    .map(
      (it) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${it.product_name} <span style="color:#888;">× ${it.quantity}</span></td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">Rs. ${(it.unit_price * it.quantity).toLocaleString()}</td>
      </tr>`,
    )
    .join("");
}

function orderConfirmationHtml(d: OrderData) {
  return styledShell(`
    <h2 style="margin:0 0 8px;font-size:22px;">Thank you for your order! 🎉</h2>
    <p style="color:#555;margin:0 0 20px;">Hi ${d.shipping_name ?? "there"}, we've received your order and will process it shortly.</p>
    <div style="background:#fafafa;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;color:#888;">ORDER NUMBER</p>
      <p style="margin:4px 0 0;font-family:monospace;font-size:14px;font-weight:bold;">#${d.id.slice(0, 8).toUpperCase()}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${orderRows(d.items)}
      <tr><td style="padding:10px 0;color:#666;">Subtotal</td><td style="padding:10px 0;text-align:right;color:#666;">Rs. ${(d.subtotal ?? 0).toLocaleString()}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Shipping</td><td style="padding:4px 0;text-align:right;color:#666;">Rs. ${(d.shipping_amount ?? 0).toLocaleString()}</td></tr>
      <tr><td style="padding:10px 0;font-weight:bold;font-size:16px;">Total</td><td style="padding:10px 0;text-align:right;font-weight:bold;font-size:16px;color:#d4af37;">Rs. ${d.total.toLocaleString()}</td></tr>
    </table>
    ${
      d.shipping_address_line1
        ? `<div style="margin-top:24px;padding:16px;background:#fafafa;border-radius:8px;">
            <p style="margin:0 0 6px;font-size:12px;color:#888;">SHIPPING TO</p>
            <p style="margin:0;line-height:1.5;">${d.shipping_name ?? ""}<br>${d.shipping_address_line1}<br>${d.shipping_city ?? ""}, ${d.shipping_country ?? ""}</p>
          </div>`
        : ""
    }
    <p style="margin-top:24px;color:#555;">We'll send you another email when your order ships.</p>
  `);
}

function welcomeHtml(name: string) {
  return styledShell(`
    <h2 style="margin:0 0 12px;font-size:22px;">Welcome, ${name}! 👋</h2>
    <p style="color:#555;line-height:1.6;">Thank you for joining <strong>Time &amp; Trend</strong>. You're now part of a community that values timeless design and craftsmanship.</p>
    <p style="color:#555;line-height:1.6;">Browse our latest collections, save your favorites to your wishlist, and enjoy free shipping on orders above the threshold.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="https://timeandtrend.store/collections" style="display:inline-block;background:#d4af37;color:#1a1a1a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Start Shopping</a>
    </div>
  `);
}

function passwordResetHtml(link: string) {
  return styledShell(`
    <h2 style="margin:0 0 12px;font-size:22px;">Reset your password</h2>
    <p style="color:#555;line-height:1.6;">We received a request to reset your password. Click the button below to create a new one. This link expires in 1 hour.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${link}" style="display:inline-block;background:#d4af37;color:#1a1a1a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
    </div>
    <p style="color:#888;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
  `);
}

function adminNewOrderHtml(d: OrderData) {
  return styledShell(`
    <h2 style="margin:0 0 12px;font-size:22px;">🛍️ New order received</h2>
    <div style="background:#fafafa;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;color:#888;">ORDER #${d.id.slice(0, 8).toUpperCase()}</p>
      <p style="margin:6px 0 0;font-size:18px;font-weight:bold;color:#d4af37;">Rs. ${d.total.toLocaleString()}</p>
    </div>
    <p><strong>Customer:</strong> ${d.shipping_name ?? "—"} (${d.customer_email ?? "—"})<br>
    <strong>Phone:</strong> ${d.shipping_phone ?? "—"}<br>
    <strong>Payment:</strong> ${d.payment_method ?? "—"}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
      ${orderRows(d.items)}
    </table>
    ${
      d.shipping_address_line1
        ? `<p style="margin-top:16px;color:#555;"><strong>Ship to:</strong><br>${d.shipping_address_line1}, ${d.shipping_city ?? ""}, ${d.shipping_country ?? ""}</p>`
        : ""
    }
    <p style="margin-top:24px;"><a href="https://timeandtrend.store/admin/orders" style="color:#d4af37;font-weight:bold;">→ View in admin panel</a></p>
  `);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  try {
    const { type, to, data } = await req.json();
    if (!type || !to) {
      return new Response(JSON.stringify({ error: "Missing type or to" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let subject = "";
    let html = "";
    switch (type) {
      case "order_confirmation":
        subject = `Order confirmation #${(data.id ?? "").slice(0, 8).toUpperCase()}`;
        html = orderConfirmationHtml(data as OrderData);
        break;
      case "welcome":
        subject = "Welcome to Time & Trend";
        html = welcomeHtml(data?.name ?? "Friend");
        break;
      case "password_reset":
        subject = "Reset your Time & Trend password";
        html = passwordResetHtml(data?.link ?? "#");
        break;
      case "admin_new_order":
        subject = `🛍️ New order — Rs. ${(data.total ?? 0).toLocaleString()}`;
        html = adminNewOrderHtml(data as OrderData);
        break;
      default:
        return new Response(JSON.stringify({ error: "Unknown type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const recipients = Array.isArray(to) ? to : [to];
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM, to: recipients, subject, html }),
    });
    const body = await res.json();
    if (!res.ok) {
      console.error("Resend error", body);
      return new Response(JSON.stringify({ error: body }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true, id: body.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-email error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
