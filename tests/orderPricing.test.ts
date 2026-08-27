import { describe, it, expect } from "vitest";
import { resolveOrderPricing } from "@/lib/orderPricing";
import type { PricingTier } from "@/lib/pricing";

const TIERS: PricingTier[] = [
  { qty: 1, total: 399 },
  { qty: 2, total: 649 },
  { qty: 3, total: 849 },
  { qty: 4, total: 999 },
  { qty: 5, total: 1149 },
];

// Minimal fake catalog injected into the resolver (no bundler/DOM needed).
const CATALOG: Record<string, { title: string; priceNum: number; pricingTiers?: PricingTier[] }> = {
  "multani-mitti": { title: "Multani Mitti", priceNum: 399, pricingTiers: TIERS },
  "combo-pack": { title: "Combo Pack", priceNum: 749 }, // flat, no tiers
};
const lookup = (slug: string) => CATALOG[slug];

describe("resolveOrderPricing (server-authoritative)", () => {
  it("prices a tiered line from slug + qty, ignoring any client-sent price", () => {
    // Client could try to send priceEach: 1 — resolver only reads slug + qty.
    const r = resolveOrderPricing(
      [{ slug: "multani-mitti", qty: 3 } as never],
      lookup,
    );
    expect(r.lines).toHaveLength(1);
    expect(r.lines[0].lineTotal).toBe(849);
    expect(r.lines[0].unitPrice).toBe(283);
    expect(r.lines[0].regularEach).toBe(399);
    expect(r.lines[0].savings).toBe(348);
    expect(r.subtotal).toBe(849);
    expect(r.savings).toBe(348);
  });

  it("prices flat (non-tiered) products as price × qty", () => {
    const r = resolveOrderPricing([{ slug: "combo-pack", qty: 2 }], lookup);
    expect(r.lines[0].lineTotal).toBe(1498);
    expect(r.lines[0].savings).toBe(0);
    expect(r.subtotal).toBe(1498);
  });

  it("aggregates subtotal and savings across lines", () => {
    const r = resolveOrderPricing(
      [
        { slug: "multani-mitti", qty: 5 }, // 1149, save 846
        { slug: "combo-pack", qty: 1 }, // 749, save 0
      ],
      lookup,
    );
    expect(r.subtotal).toBe(1149 + 749);
    expect(r.regularSubtotal).toBe(399 * 5 + 749);
    expect(r.savings).toBe(846);
  });

  it("drops unknown slugs (never invents a price)", () => {
    const r = resolveOrderPricing(
      [
        { slug: "does-not-exist", qty: 3 },
        { slug: "multani-mitti", qty: 1 },
      ],
      lookup,
    );
    expect(r.lines).toHaveLength(1);
    expect(r.lines[0].slug).toBe("multani-mitti");
    expect(r.subtotal).toBe(399);
  });

  it("sanitizes bad quantities (floors, drops <= 0 and non-numeric)", () => {
    const r = resolveOrderPricing(
      [
        { slug: "multani-mitti", qty: 2.9 }, // -> 2 -> 649
        { slug: "multani-mitti", qty: 0 }, // dropped
        { slug: "multani-mitti", qty: "abc" as never }, // dropped
      ],
      lookup,
    );
    expect(r.lines).toHaveLength(1);
    expect(r.lines[0].qty).toBe(2);
    expect(r.lines[0].lineTotal).toBe(649);
  });

  it("returns an empty result for an empty cart", () => {
    const r = resolveOrderPricing([], lookup);
    expect(r.lines).toHaveLength(0);
    expect(r.subtotal).toBe(0);
    expect(r.savings).toBe(0);
  });
});
