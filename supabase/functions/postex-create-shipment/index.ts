// PostEx Pakistan — create shipment for an order
// Endpoint: POST /functions/v1/postex-create-shipment  body: { orderId: string }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return json({ error: "orderId is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const userId = userData?.user?.id;
    if (!userId) return json({ error: "Unauthorized" }, 401);
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    // Load order + items
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, order_items(product_name,quantity)")
      .eq("id", orderId)
      .maybeSingle();
    if (orderErr || !order) return json({ error: "Order not found" }, 404);

    if (order.postex_tracking_number) {
      return json({
        trackingNumber: order.postex_tracking_number,
        alreadyShipped: true,
        shipmentData: order.postex_shipment_data,
      });
    }

    // Load PostEx config from site_settings
    const { data: settings } = await supabase
      .from("site_settings")
      .select(
        "postex_api_key, postex_pickup_address_code, contact_phone, contact_address",
      )
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const apiKey = settings?.postex_api_key as string | undefined;
    const pickupAddressCode = settings?.postex_pickup_address_code as string | undefined;
    if (!apiKey) {
      return json({ error: "PostEx API key not configured in Settings → Shipping" }, 400);
    }
    if (!pickupAddressCode) {
      return json(
        { error: "PostEx pickup address code not configured in Settings → Shipping" },
        400,
      );
    }

    // Build PostEx payload
    const itemsCount = (order.order_items as Array<{ quantity: number }>).reduce(
      (s, it) => s + Number(it.quantity ?? 1),
      0,
    );
    const itemsDescription = (order.order_items as Array<{ product_name: string; quantity: number }>)
      .map((it) => `${it.quantity}x ${it.product_name}`)
      .join(", ")
      .slice(0, 250);

    const isCOD = (order.payment_method ?? "cod").toLowerCase() === "cod"
      && order.payment_status !== "paid";
    const transactionType = isCOD ? "COD" : "PREPAID";
    const codAmount = isCOD ? Number(order.total) : 0;

    // PostEx v3 create-order — exact field names per official spec.
    // Only `pickupAddressCode` is valid; there is no `storeAddressCode`.
    const orderRefNumber =
      (order.order_number as string | null) || order.id.slice(0, 12).toUpperCase();

    const payload = {
      cityName: order.shipping_city ?? "",
      customerName: order.shipping_name ?? "Customer",
      customerPhone: (order.shipping_phone ?? "").replace(/\s+/g, ""),
      deliveryAddress:
        [order.shipping_address_line1, order.shipping_address_line2]
          .filter(Boolean)
          .join(", ") || "—",
      invoiceDivision: 1,
      invoicePayment: codAmount,
      items: itemsCount || 1,
      orderDetail: itemsDescription || "Order",
      orderRefNumber,
      orderType: "Normal",
      pickupAddressCode,
      transactionNotes: `Order #${orderRefNumber}`,
      transactionType,
    };

    console.log("PostEx payload:", JSON.stringify(payload));

    const postexRes = await fetch(
      "https://api.postex.pk/services/integration/api/order/v3/create-order",
      {
        method: "POST",
        headers: {
          "token": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const postexData = await postexRes.json().catch(() => ({}));
    console.log("PostEx response:", postexRes.status, JSON.stringify(postexData));

    if (!postexRes.ok || (postexData?.statusCode && String(postexData.statusCode) !== "200")) {
      console.error("PostEx error:", postexData);
      const upstreamMsg =
        postexData?.statusMessage ||
        postexData?.message ||
        `PostEx API failed (${postexRes.status})`;
      return json(
        {
          error:
            upstreamMsg === "INVALID MERCHANT STORE ADDRESS CODE"
              ? `PostEx rejected pickup address code "${pickupAddressCode}". This code must match a pickup address registered in your PostEx merchant dashboard. Log in to PostEx → Pickup Addresses to see valid codes.`
              : upstreamMsg,
          upstreamMessage: upstreamMsg,
          sentPayload: payload,
          details: postexData,
        },
        502,
      );
    }

    const trackingNumber: string | undefined =
      postexData?.dist?.trackingNumber ?? postexData?.trackingNumber ?? postexData?.data?.trackingNumber;

    if (!trackingNumber) {
      return json({ error: "No tracking number returned by PostEx", details: postexData }, 502);
    }

    // Save back to order
    await supabase
      .from("orders")
      .update({
        postex_tracking_number: trackingNumber,
        postex_shipment_data: postexData,
        fulfillment_status: "shipped",
      })
      .eq("id", orderId);

    return json({ trackingNumber, shipmentData: postexData });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
