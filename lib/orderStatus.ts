/**
 * Client-safe order-status presentation. No server imports here so both the
 * admin dashboard and the public tracking page can use it.
 */

export const STATUS_FLOW = [
  "placed",
  "confirmed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export const ALL_STATUSES = [...STATUS_FLOW, "cancelled", "refunded"] as const;

type Meta = { label: string; color: string; bg: string };

const META: Record<string, Meta> = {
  placed: { label: "Placed", color: "#8A6A2E", bg: "#FBEEDA" },
  confirmed: { label: "Confirmed", color: "#5B4FA0", bg: "#EAE6F7" },
  shipped: { label: "Shipped", color: "#2F6DA3", bg: "#E1EEF8" },
  out_for_delivery: { label: "Out for delivery", color: "#A15E38", bg: "#F7E6D8" },
  delivered: { label: "Delivered", color: "#5E7C4E", bg: "#EAF1E4" },
  cancelled: { label: "Cancelled", color: "#B4483F", bg: "#F7E1DE" },
  refunded: { label: "Refunded", color: "#7A5CA8", bg: "#EFE7F7" },
  // legacy values still in older rows
  pre_order: { label: "Placed", color: "#8A6A2E", bg: "#FBEEDA" },
  paid: { label: "Placed", color: "#8A6A2E", bg: "#FBEEDA" },
};

export function statusMeta(status: string): Meta {
  return META[status] ?? { label: status || "—", color: "#6B6357", bg: "#EFE7D9" };
}

/** 0-based index of a status within the linear flow (−1 if cancelled/unknown). */
export function statusStep(status: string): number {
  const norm = status === "pre_order" || status === "paid" ? "placed" : status;
  return (STATUS_FLOW as readonly string[]).indexOf(norm);
}

export function isCancelled(status: string): boolean {
  return status === "cancelled";
}

export function isRefunded(status: string): boolean {
  return status === "refunded";
}

/** Terminal negative states that don't follow the delivery progress track. */
export function isTerminal(status: string): boolean {
  return status === "cancelled" || status === "refunded";
}
