import { NextResponse } from "next/server";
import { getCheapestQuote, isShiprocketConfigured, pickupPincode } from "@/lib/shiprocket";
import { PARCEL_DIMS_CM, isValidPincode, parcelWeightKg } from "@/lib/shipping";

/**
 * Quotes the COD shipping charge for a cart + delivery PIN code, via
 * Shiprocket's courier serviceability API.
 *
 * Never returns an error for an unconfigured account or an unserviceable PIN —
 * the checkout falls back to "shipping charges may apply" instead of blocking
 * the customer from ordering.
 */

export const runtime = "nodejs";

type RateItem = { slug: string; qty: number };

export async function POST(req: Request) {
  let body: { pincode?: string; items?: RateItem[]; subtotal?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { pincode, items, subtotal } = body;

  if (!pincode || !isValidPincode(pincode)) {
    return NextResponse.json(
      { error: "Enter a valid 6-digit PIN code." },
      { status: 400 }
    );
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  // Not set up yet (or pickup PIN missing) — degrade to the generic notice.
  if (!isShiprocketConfigured() || !pickupPincode()) {
    return NextResponse.json({ status: "unconfigured" });
  }

  try {
    const quote = await getCheapestQuote({
      deliveryPincode: pincode,
      weightKg: parcelWeightKg(items),
      declaredValue: Number(subtotal) || 0,
      cod: true,
    });

    if (!quote) {
      return NextResponse.json({ status: "unserviceable" });
    }

    return NextResponse.json({
      status: "ok",
      rate: Math.round(quote.rate),
      courier: quote.courierName,
      etdDays: quote.etdDays,
      weightKg: parcelWeightKg(items),
      dims: PARCEL_DIMS_CM,
    });
  } catch (err) {
    // A Shiprocket outage must not block checkout.
    console.error("[shipping-rate]", err);
    return NextResponse.json({ status: "unavailable" });
  }
}
