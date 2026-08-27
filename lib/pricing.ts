/**
 * Configurable, per-product "Buy More, Save More" quantity pricing.
 *
 * A product may declare `pricingTiers` — an ascending list of {qty, total}
 * fixed-total price breaks. The price for a given quantity is:
 *   - the tier's `total` when qty exactly matches a tier, otherwise
 *   - for qty above the highest tier: the highest tier's per-unit price × qty,
 *   - for a gap between tiers (non-contiguous configs): the nearest lower
 *     tier's per-unit price × qty.
 *
 * Products WITHOUT `pricingTiers` fall back to the existing flat pricing
 * (`priceNum × qty`) — so nothing changes for them.
 *
 * All amounts are in whole rupees for what we actually charge; per-unit figures
 * may be fractional and are for display only. There is no coupon system in the
 * codebase today; if one is added later it should compose on top of the line
 * totals produced here (apply tier pricing first, then any coupon).
 */

export type PricingTier = {
  /** number of units this break applies to */
  qty: number;
  /** fixed TOTAL price (in rupees) for exactly `qty` units */
  total: number;
  /** marks the tier to highlight (e.g. "Most Popular") in the UI */
  popular?: boolean;
};

/** The minimum a pricing function needs to know about a product. */
export type Priceable = {
  priceNum: number;
  /** struck-through MRP; used as the "regular" price for non-tiered products */
  mrpNum?: number;
  pricingTiers?: PricingTier[];
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Does this product use quantity-tier pricing? */
export function hasTiers(p: Priceable): boolean {
  return Array.isArray(p.pricingTiers) && p.pricingTiers.length > 0;
}

/** Tiers sorted ascending by qty (defensive copy). */
function sortedTiers(tiers: PricingTier[]): PricingTier[] {
  return [...tiers].sort((a, b) => a.qty - b.qty);
}

/**
 * Total charged price for `qty` units given a tier table.
 * Rounded to whole rupees (what we bill).
 */
export function tierTotalForQty(tiers: PricingTier[], qty: number): number {
  const n = Math.max(1, Math.floor(qty));
  const sorted = sortedTiers(tiers);

  const exact = sorted.find((t) => t.qty === n);
  if (exact) return exact.total;

  const lowest = sorted[0];
  if (n <= lowest.qty) return Math.round((lowest.total / lowest.qty) * n);

  const highest = sorted[sorted.length - 1];
  if (n > highest.qty) return Math.round((highest.total / highest.qty) * n);

  // gap between defined tiers (non-contiguous config): use nearest lower tier
  const lower = [...sorted].reverse().find((t) => t.qty <= n) ?? lowest;
  return Math.round((lower.total / lower.qty) * n);
}

/** Per-unit price implied by the qty-1 tier (or the flat price). Display + savings basis. */
export function singleUnitPrice(p: Priceable): number {
  if (hasTiers(p)) {
    const sorted = sortedTiers(p.pricingTiers!);
    const one = sorted.find((t) => t.qty === 1);
    return one ? one.total : round2(sorted[0].total / sorted[0].qty);
  }
  return p.priceNum;
}

/** What we actually charge for a cart line of `qty` of this product. */
export function lineTotal(p: Priceable, qty: number): number {
  const n = Math.max(1, Math.floor(qty));
  return hasTiers(p) ? tierTotalForQty(p.pricingTiers!, n) : p.priceNum * n;
}

/** Effective per-unit price for a line (display only; may be fractional). */
export function lineUnitPrice(p: Priceable, qty: number): number {
  const n = Math.max(1, Math.floor(qty));
  return round2(lineTotal(p, n) / n);
}

/**
 * "Regular" (undiscounted) per-unit price used as the savings basis:
 * - tiered products: the qty-1 tier price,
 * - non-tiered products: the MRP when it's higher than the price, else the price.
 */
function regularUnitPrice(p: Priceable): number {
  if (hasTiers(p)) return singleUnitPrice(p);
  return p.mrpNum && p.mrpNum > p.priceNum ? p.mrpNum : p.priceNum;
}

/** The "regular" (undiscounted) line price = regular unit price × qty. */
export function lineRegularTotal(p: Priceable, qty: number): number {
  const n = Math.max(1, Math.floor(qty));
  return Math.round(regularUnitPrice(p) * n);
}

/** Savings on a line vs. buying that many at the single-unit price. Never negative. */
export function lineSavings(p: Priceable, qty: number): number {
  return Math.max(0, lineRegularTotal(p, qty) - lineTotal(p, qty));
}

/** Cart subtotal: sum of each line's tier/flat total. */
export function cartSubtotal(
  items: { qty: number; priceNum: number; pricingTiers?: PricingTier[] }[],
): number {
  return items.reduce((sum, i) => sum + lineTotal(i, i.qty), 0);
}
