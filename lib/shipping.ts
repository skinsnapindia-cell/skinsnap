import { products } from "@/lib/products";

/**
 * Parcel dimensions (cm) declared to Shiprocket for every shipment.
 *
 * ⚠️ PLACEHOLDER ESTIMATES — measure a real packed parcel and replace these
 * before going live. Shiprocket bills on volumetric weight when it exceeds
 * actual weight, so wrong dimensions mean wrong quotes and reweigh penalties.
 */
export const PARCEL_DIMS_CM = { length: 20, breadth: 15, height: 3 };

/** Packaging (mailer, filler) added on top of product weight, in kg. */
const PACKAGING_WEIGHT_KG = 0.04;

/** Shiprocket rejects zero-weight shipments; never quote below this. */
const MIN_BILLABLE_KG = 0.05;

export type ShippableItem = { slug: string; qty: number };

/**
 * Total shipped weight (kg) for a set of cart items, including packaging.
 * Unknown slugs are ignored rather than silently weighted as 0.
 */
export function parcelWeightKg(items: ShippableItem[]): number {
  const productWeight = items.reduce((sum, item) => {
    const product = products.find((p) => p.slug === item.slug);
    if (!product) return sum;
    return sum + product.weightKg * item.qty;
  }, 0);

  const total = productWeight > 0 ? productWeight + PACKAGING_WEIGHT_KG : 0;
  // round to 2dp — Shiprocket quotes in kg and long floats confuse their API
  return Math.max(MIN_BILLABLE_KG, Math.round(total * 100) / 100);
}

/** A 6-digit Indian PIN code. */
export function isValidPincode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin);
}
