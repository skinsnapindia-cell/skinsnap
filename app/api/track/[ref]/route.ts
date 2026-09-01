import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public order tracking by reference number. Deliberately returns only
 * non-sensitive fields — status, items, courier/AWB, city/state — never the
 * customer's email, phone, or street address, since the endpoint is guarded by
 * the reference number alone.
 */
export async function GET(
  _req: Request,
  { params }: { params: { ref: string } }
) {
  const ref = decodeURIComponent(params.ref || "").trim().toUpperCase();
  if (!ref) {
    return NextResponse.json({ error: "Enter your order reference number." }, { status: 400 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Order tracking is temporarily unavailable." },
      { status: 503 }
    );
  }

  const order = await getOrderByNumber(ref);
  if (!order) {
    return NextResponse.json(
      { error: "No order found with that reference number. Double-check and try again." },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      order: {
        orderNumber: order.order_number,
        placedAt: order.created_at,
        status: order.status,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        courier: order.shipping_courier,
        awb: order.awb,
        items: (order.items || []).map((i) => ({ title: i.title, qty: i.qty })),
        total: order.total,
        city: order.city,
        state: order.state,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
