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
      status: order.status ?? "placed",
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

/**
 * Canonical fulfilment lifecycle. New orders land at `placed`; the admin moves
 * them forward. Older rows may still carry `pre_order`/`paid` — treat those as
 * `placed` for display.
 */
export const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** A full order row as read back from the database (admin + tracking). */
export type OrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  customer_name: string;
  email: string;
  phone: string | null;
  flat_building: string | null;
  locality: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  items: SavedOrderItem[];
  subtotal: number;
  shipping: number | null;
  total: number;
  payment_method: string | null;
  shipping_courier: string | null;
  payment_id: string | null;
  payment_status: string | null;
  email_sent: boolean;
  awb: string | null;
};

const ORDER_COLUMNS =
  "id, order_number, created_at, status, customer_name, email, phone, flat_building, locality, address_line, city, state, pincode, items, subtotal, shipping, total, payment_method, shipping_courier, payment_id, payment_status, email_sent, awb";

/** All orders, newest first. Returns [] if Supabase isn't configured / errors. */
export async function listOrders(): Promise<OrderRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) {
    console.error("[orders] listOrders failed", error.message);
    return [];
  }
  return (data ?? []) as OrderRow[];
}

/** A single order by its human reference (order_number), or null. */
export async function getOrderByNumber(orderNumber: string): Promise<OrderRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) {
    console.error("[orders] getOrderByNumber failed", error.message);
    return null;
  }
  return (data as OrderRow) ?? null;
}

/** Fields the admin may update on an order. */
export type OrderPatch = {
  status?: string;
  awb?: string | null;
  shipping_courier?: string | null;
  payment_status?: string | null;
};

/** Apply an admin edit to an order. Returns the updated row, or null on error. */
export async function updateOrder(id: string, patch: OrderPatch): Promise<OrderRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const clean: OrderPatch = {};
  if (patch.status !== undefined) clean.status = patch.status;
  if (patch.awb !== undefined) clean.awb = patch.awb;
  if (patch.shipping_courier !== undefined) clean.shipping_courier = patch.shipping_courier;
  if (patch.payment_status !== undefined) clean.payment_status = patch.payment_status;
  const { data, error } = await supabase
    .from("orders")
    .update(clean)
    .eq("id", id)
    .select(ORDER_COLUMNS)
    .single();
  if (error) {
    console.error("[orders] updateOrder failed", error.message);
    return null;
  }
  return (data as OrderRow) ?? null;
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
