import { NextResponse } from "next/server";
import { normalizeState } from "@/lib/indiaStates";

/**
 * Looks up an Indian PIN code and returns its city (district), state, and the
 * list of localities/areas it covers — so checkout can auto-fill City + State
 * and offer an area dropdown.
 *
 * Proxies India Post's free public API (no key) server-side, which avoids any
 * browser CORS issues and lets us normalise the response shape.
 * Cached for a day — PIN-code geography doesn't change.
 */

export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  const code = (params.code || "").trim();
  if (!/^[1-9][0-9]{5}$/.test(code)) {
    return NextResponse.json(
      { status: "invalid", error: "Enter a valid 6-digit PIN code." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
      next: { revalidate: 86400 },
    });
    const data = await res.json().catch(() => null);
    const entry = Array.isArray(data) ? data[0] : null;

    if (!entry || entry.Status !== "Success" || !entry.PostOffice?.length) {
      return NextResponse.json({ status: "notfound" });
    }

    const offices = entry.PostOffice as Array<{
      Name?: string;
      District?: string;
      State?: string;
    }>;

    const first = offices[0];
    // de-duplicate + sort locality names for the dropdown
    const areas = Array.from(
      new Set(offices.map((o) => o.Name).filter(Boolean) as string[])
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      status: "ok",
      city: first.District || "",
      state: normalizeState(first.State || ""),
      areas,
    });
  } catch {
    // Don't block checkout if the lookup service is down — the user can still
    // type city/state manually.
    return NextResponse.json({ status: "unavailable" });
  }
}
