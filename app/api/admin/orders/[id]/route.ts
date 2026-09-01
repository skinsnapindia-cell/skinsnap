import { NextResponse } from "next/server";
import { isAuthedRequest } from "@/lib/adminAuth";
import { ORDER_STATUSES, updateOrder, type OrderPatch } from "@/lib/orders";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: OrderPatch;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const patch: OrderPatch = {};
  if (body.status !== undefined) {
    if (!ORDER_STATUSES.includes(body.status as (typeof ORDER_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (body.awb !== undefined) patch.awb = body.awb ? String(body.awb).trim() : null;
  if (body.shipping_courier !== undefined) {
    patch.shipping_courier = body.shipping_courier ? String(body.shipping_courier).trim() : null;
  }
  if (body.payment_status !== undefined) patch.payment_status = body.payment_status;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const updated = await updateOrder(params.id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Could not update the order." }, { status: 500 });
  }
  return NextResponse.json({ order: updated });
}
