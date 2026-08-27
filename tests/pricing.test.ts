import { describe, it, expect } from "vitest";
import {
  type PricingTier,
  type Priceable,
  hasTiers,
  tierTotalForQty,
  singleUnitPrice,
  lineTotal,
  lineUnitPrice,
  lineRegularTotal,
  lineSavings,
  cartSubtotal,
} from "@/lib/pricing";

// The configured "Buy More, Save More" tiers under test.
const TIERS: PricingTier[] = [
  { qty: 1, total: 399 },
  { qty: 2, total: 649 },
  { qty: 3, total: 849, popular: true },
  { qty: 4, total: 999 },
  { qty: 5, total: 1149 },
];

const tiered: Priceable = { priceNum: 399, pricingTiers: TIERS };
const flat: Priceable = { priceNum: 749 }; // no tiers (e.g. combo)

describe("tierTotalForQty", () => {
  it("returns the exact tier total for each configured quantity", () => {
    expect(tierTotalForQty(TIERS, 1)).toBe(399);
    expect(tierTotalForQty(TIERS, 2)).toBe(649);
    expect(tierTotalForQty(TIERS, 3)).toBe(849);
    expect(tierTotalForQty(TIERS, 4)).toBe(999);
    expect(tierTotalForQty(TIERS, 5)).toBe(1149);
  });

  it("uses the highest tier's per-unit price above the top tier", () => {
    // 1149 / 5 = 229.8 per unit
    expect(tierTotalForQty(TIERS, 6)).toBe(Math.round(229.8 * 6)); // 1379
    expect(tierTotalForQty(TIERS, 10)).toBe(Math.round(229.8 * 10)); // 2298
  });

  it("is order-independent (unsorted config) and floors fractional qty", () => {
    const shuffled = [...TIERS].reverse();
    expect(tierTotalForQty(shuffled, 3)).toBe(849);
    expect(tierTotalForQty(TIERS, 2.9)).toBe(649);
  });
});

describe("hasTiers", () => {
  it("detects configured vs. flat products", () => {
    expect(hasTiers(tiered)).toBe(true);
    expect(hasTiers(flat)).toBe(false);
    expect(hasTiers({ priceNum: 100, pricingTiers: [] })).toBe(false);
  });
});

describe("singleUnitPrice", () => {
  it("is the qty-1 tier for tiered products", () => {
    expect(singleUnitPrice(tiered)).toBe(399);
  });
  it("falls back to priceNum for flat products", () => {
    expect(singleUnitPrice(flat)).toBe(749);
  });
});

describe("lineTotal", () => {
  it("uses tier totals for tiered products", () => {
    expect(lineTotal(tiered, 3)).toBe(849);
    expect(lineTotal(tiered, 5)).toBe(1149);
  });
  it("uses flat price × qty for products without tiers (unchanged behavior)", () => {
    expect(lineTotal(flat, 1)).toBe(749);
    expect(lineTotal(flat, 3)).toBe(2247);
  });
  it("treats qty < 1 as 1", () => {
    expect(lineTotal(tiered, 0)).toBe(399);
  });
});

describe("lineUnitPrice", () => {
  it("returns the effective per-unit price (2dp)", () => {
    expect(lineUnitPrice(tiered, 2)).toBe(324.5);
    expect(lineUnitPrice(tiered, 3)).toBe(283);
    expect(lineUnitPrice(tiered, 4)).toBe(249.75);
    expect(lineUnitPrice(tiered, 5)).toBe(229.8);
  });
});

describe("lineRegularTotal & lineSavings", () => {
  it("regular = single-unit price × qty", () => {
    expect(lineRegularTotal(tiered, 3)).toBe(399 * 3);
  });
  it("savings match the spec (single unit × qty − offer)", () => {
    expect(lineSavings(tiered, 1)).toBe(0);
    expect(lineSavings(tiered, 2)).toBe(149);
    expect(lineSavings(tiered, 3)).toBe(348);
    expect(lineSavings(tiered, 4)).toBe(597);
    expect(lineSavings(tiered, 5)).toBe(846);
  });
  it("is never negative and is 0 for flat products", () => {
    expect(lineSavings(flat, 3)).toBe(0);
  });
});

describe("cartSubtotal", () => {
  it("sums per-line tier/flat totals across mixed items", () => {
    const items = [
      { priceNum: 399, pricingTiers: TIERS, qty: 3 }, // 849
      { priceNum: 749, qty: 1 }, // 749 (flat combo)
    ];
    expect(cartSubtotal(items)).toBe(849 + 749);
  });

  it("prices each line by ITS OWN quantity (per-product, not cart-wide)", () => {
    // two separate tiered lines of qty 2 each -> 649 + 649, NOT a 4-pack (999)
    const items = [
      { priceNum: 399, pricingTiers: TIERS, qty: 2 },
      { priceNum: 399, pricingTiers: TIERS, qty: 2 },
    ];
    expect(cartSubtotal(items)).toBe(649 + 649);
  });
});
