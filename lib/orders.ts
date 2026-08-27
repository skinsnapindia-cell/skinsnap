import { getSupabase } from "@/lib/supabase";

/**
 * Order persistence. SERVER-ONLY.
 *
 * Every function here is deliberately non-throwing: the database is a record
 * of the sale, not a gate on it. If Supabase is down we still want the
 * customer's order to go through and their email to send — we log loudly and
 * carry on rather than showing them a failure for our infrastructure problem.
 */

export type SavedOrderItem = {
  slug?: string;
  title: string;
  qty: number;
  /** per-unit price actually charged (may be fractional under tier pricing) */
  priceEach?: number;
  lineTotal?: string;
  /** undiscounted per-unit price — snapshot of the regular price at order time */
  regularEach?: number;
  /** discount applied to this line at order time */
  savings?: number;
};

export type NewOrder = {
  orderNumber: string;
  name: string;
  email: string;
  phone?: string;
  address: {
    flat?: string;
    street?: string;
    area?: string;
    line?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  items: SavedOrderItem[];
  subtotal: number;
  shipping: number | null;
  total: number;
  paymentMethod: string;
  shippingCourier?: string | null;
  /** order lifecycle status; defaults to 'pre_order' */
  status?: string;
  /** razorpay_payment_id for prepaid orders, null for COD */
  paymentId?: string | null;
  /** 'paid' (prepaid) | 'cod' */
  paymentStatus?: string | null;
};

/** Order reference shared across the DB, the email and Shiprocket, e.g. SS-260717-A3F9. */
export function generateOrderNumber(): string {
  const d = new Date();
  const date = [
    String(d.getFullYear()).slice(2),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SS-${date}-${rand}`;
}

/** Insert a new order. Returns the row id, or null if it couldn't be saved. */
export async function saveOrder(order: NewOrder): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: order.orderNumber,
      status: order.status ?? "pre_order",
      payment_id: order.paymentId ?? null,
      payment_status: order.paymentStatus ?? null,
      customer_name: order.name,
      email: order.email,
      phone: order.phone ?? null,
      flat_building: order.address.flat ?? null,
      locality: order.address.area ?? null,
      address_line: order.address.line ?? null,
      city: order.address.city ?? null,
      state: order.address.state ?? null,
      pincode: order.address.pincode ?? null,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      payment_method: order.paymentMethod,
      shipping_courier: order.shippingCourier ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error(
      `[orders] FAILED to save ${order.orderNumber} for ${order.email} — order is NOT in the database.`,
      error.message
    );
    return null;
  }
  return data?.id ?? null;
}

/** Flag that the confirmation email went out. */
export async function markEmailSent(id: string | null): Promise<void> {
  if (!id) return;
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from("orders")
    .update({ email_sent: true })
    .eq("id", id);
  if (error) console.error("[orders] could not flag email_sent", error.message);
}
