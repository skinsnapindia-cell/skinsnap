import { NextResponse } from "next/server";
import { autosuggest, isMapplsConfigured } from "@/lib/mappls";

/**
 * Address autocomplete proxy (Mappls). Keeps the OAuth secret server-side.
 * Returns { status: "unconfigured" } when keys aren't set so the checkout
 * field degrades to a plain text input instead of erroring.
 */

export const runtime = "nodejs";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (q.length < 3) return NextResponse.json({ status: "ok", suggestions: [] });
  if (!isMapplsConfigured()) return NextResponse.json({ status: "unconfigured" });

  try {
    const suggestions = await autosuggest(q);
    return NextResponse.json({ status: "ok", suggestions });
  } catch (err) {
    console.error("[address-search]", err);
    return NextResponse.json({ status: "unavailable" });
  }
}
