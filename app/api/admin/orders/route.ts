import { NextResponse } from "next/server";
import { isAuthedRequest } from "@/lib/adminAuth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listOrders } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAuthedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Order database not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).", orders: [] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
  const orders = await listOrders();
  // Never let the browser cache the order list — it must always reflect the
  // latest statuses after an admin edit.
  return NextResponse.json({ orders }, { headers: { "Cache-Control": "no-store" } });
}
