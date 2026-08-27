import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";
import { resolveOrderPricing } from "@/lib/orderPricing";
import {
  createRazorpayOrder,
  isRazorpayConfigured,
  razorpayKeyId,
} from "@/lib/razorpay";

/**
 * Creates a Razorpay order for a PREPAID checkout. The amount is computed
 * server-side from the cart (slug + qty) via the catalog — the browser never
 * dictates the price. Prepaid orders ship free, so the amount is the subtotal.
 */

export const runtime = "nodejs";

type RateItem = { slug: string; qty: number };

export async function POST(req: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Online payment isn't configured. Please choose Cash on Delivery." },
      { status: 500 }
    );
  }

  let body: { items?: RateItem[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const priced = resolveOrderPricing(
    items.map((i) => ({ slug: i.slug, qty: i.qty })),
    getProduct
  );
  if (priced.lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  // Prepaid ships free → charge the subtotal only.
  const amountPaise = Math.round(priced.subtotal * 100);
  if (amountPaise <= 0) {
    return NextResponse.json({ error: "Invalid order amount." }, { status: 400 });
  }

  try {
    const order = await createRazorpayOrder({
      amountPaise,
      receipt: `ss_${Date.now()}`,
      notes: { cart: priced.lines.map((l) => `${l.qty}x ${l.slug}`).join(", ") },
    });
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId(),
    });
  } catch (err) {
    console.error("[razorpay/order]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not start payment." },
      { status: 502 }
    );
  }
}
