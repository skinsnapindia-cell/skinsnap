import {
  lineTotal,
  lineRegularTotal,
  lineSavings,
  singleUnitPrice,
  type Priceable,
} from "@/lib/pricing";

/**
 * Server-side, authoritative order pricing. NEVER trust prices sent by the
 * browser — the client only supplies `{ slug, qty }`; we recompute every line
 * from the catalog here before the order is created, emailed or saved.
 *
 * The catalog is injected as a `lookup` so this stays pure and testable (no
 * import of the product list, which pulls in image assets). The API route wires
 * in `getProduct`.
 */

export type OrderLineInput = { slug: string; qty: number | string };

export type ResolvedLine = {
  slug: string;
  title: string;
  qty: number;
  /** effective per-unit price actually charged (may be fractional) */
  unitPrice: number;
  /** undiscounted per-unit price (the tier's qty-1 price, or flat price) */
  regularEach: number;
  /** charged total for this line */
  lineTotal: number;
  /** undiscounted total = regularEach × qty */
  regularTotal: number;
  /** discount applied to this line */
  savings: number;
};

export type ResolvedOrder = {
  lines: ResolvedLine[];
  subtotal: number;
  regularSubtotal: number;
  savings: number;
};

type CatalogEntry = Priceable & { title: string };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function resolveOrderPricing(
  items: OrderLineInput[],
  lookup: (slug: string) => CatalogEntry | undefined,
): ResolvedOrder {
  const lines: ResolvedLine[] = [];

  for (const item of items ?? []) {
    const qty = Math.max(0, Math.floor(Number(item?.qty) || 0));
    if (qty <= 0) continue;
    const product = lookup(String(item?.slug));
    if (!product) continue; // unknown slug — silently drop; we never invent prices

    const total = lineTotal(product, qty);
    lines.push({
      slug: String(item.slug),
      title: product.title,
      qty,
      unitPrice: round2(total / qty),
      regularEach: singleUnitPrice(product),
      lineTotal: total,
      regularTotal: lineRegularTotal(product, qty),
      savings: lineSavings(product, qty),
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const regularSubtotal = lines.reduce((s, l) => s + l.regularTotal, 0);
  return {
    lines,
    subtotal,
    regularSubtotal,
    savings: Math.max(0, regularSubtotal - subtotal),
  };
}
