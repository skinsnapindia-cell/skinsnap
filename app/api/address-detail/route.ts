import { NextResponse } from "next/server";
import { geocodeAddress, isMapplsConfigured } from "@/lib/mappls";

/**
 * Resolves a selected suggestion (its text) to a structured address +
 * coordinates, so checkout can fill City/State/PIN and centre the map preview.
 * Degrades gracefully — the caller can still use the raw suggestion text.
 */

export const runtime = "nodejs";

export async function GET(req: Request) {
  const address = new URL(req.url).searchParams.get("address")?.trim() || "";
  if (!address) return NextResponse.json({ status: "invalid" }, { status: 400 });
  if (!isMapplsConfigured()) return NextResponse.json({ status: "unconfigured" });

  try {
    const detail = await geocodeAddress(address);
    if (!detail) return NextResponse.json({ status: "notfound" });
    return NextResponse.json({ status: "ok", detail });
  } catch (err) {
    console.error("[address-detail]", err);
    return NextResponse.json({ status: "unavailable" });
  }
}
