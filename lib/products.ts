import type { StaticImageData } from "next/image";
import type { PricingTier } from "@/lib/pricing";
import imgCombo from "@/public/assets/pack-combo.webp";
import imgMultaniMitti from "@/public/assets/pack-multani-mitti.webp";
import imgOrangePeel from "@/public/assets/pack-orange-peel.webp";
import imgDeTan from "@/public/assets/pack-de-tan.webp";
import imgKoreanGlow from "@/public/assets/pack-korean-glow.webp";
import imgComboAlt from "@/public/assets/pack-combo-2.webp";
import imgMultaniMittiAlt from "@/public/assets/pack-multani-mitti-2.webp";
import imgOrangePeelAlt from "@/public/assets/pack-orange-peel-2.webp";
import imgDeTanAlt from "@/public/assets/pack-de-tan-2.webp";
import imgKoreanGlowAlt from "@/public/assets/pack-korean-glow-2.webp";

export type Product = {
  slug: string;
  img: StaticImageData;
  /** second product photo, shown on hover in the store cards */
  img2: StaticImageData;
  title: string;
  desc: string;
  price: string;
  priceNum: number;
  /** original (MRP) price shown struck-through */
  mrpNum: number;
  badge: string;
  tone: string;
  /** short name of the clay/active shown inside the "INSIDE" cutaway svg */
  activeLabel: string;
  long: string;
  ingredients: { name: string; body: string; bg: string; color: string }[];
  /**
   * Optional "Buy More, Save More" quantity price breaks. When present, the
   * line price for N units comes from these tiers (see lib/pricing.ts). When
   * absent, the product uses flat `priceNum × qty` pricing (unchanged).
   */
  pricingTiers?: PricingTier[];
  /**
   * Shipped weight of ONE unit, in kilograms. A single 50g jar weighs ~60g
   * (0.06kg) with the jar; the combo is the four jars together (4 × 0.06kg).
   * Shipping packaging (mailer/filler) is added on top in lib/shipping.ts.
   */
  weightKg: number;
};

/**
 * TODO: visit again when adding products
 * Customer-facing product name. Avoids the "Combo Pack Face Pack" artifact
 * that blind `${title} Face Pack` templating produces for the combo.
 */
export function productDisplayName(p: Pick<Product, "slug" | "title">) {
  return p.slug === "combo-pack"
    ? "4-in-1 Face Pack Combo"
    : `${p.title} Face Pack`;
}

/**
 * Shared "Buy More, Save More" tiers for the single 50g jars. Fixed totals per
 * quantity; quantities above 5 use the 5-pack per-unit price (see lib/pricing).
 * Edit these numbers (or give a product its own array) to reconfigure pricing —
 * nothing in the UI is hardcoded.
 */
export const PACK_TIERS: PricingTier[] = [
  { qty: 1, total: 399 },
  { qty: 2, total: 649 },
  { qty: 3, total: 849, popular: true },
  { qty: 4, total: 999 },
  { qty: 5, total: 1149 },
];

export const products: Product[] = [
  {
    slug: "combo-pack",
    img: imgCombo,
    img2: imgComboAlt,
    title: "Combo Pack",
    desc: "All 4 natural face-pack powders — 50g of each — in one box, at an unbeatable price.",
    price: "₹749",
    priceNum: 749,
    mrpNum: 1996,
    badge: "Best Value",
    tone: "#8C6B52",
    activeLabel: "4-IN-1 COMBO",
    long: "The complete SKINSNAP collection in one box — four 50g jars of pure, natural face-pack powder: Multani Mitti, Orange Peel, De-Tan and Korean Glow. Every jar is 100% natural powder with no preservatives and no chemicals. Just scoop a spoonful, mix with a little water or rose water into a fresh, smooth paste, and apply — freshly mixed face packs for cleansing, brightening, tan removal and healthy, glowing skin.",
    ingredients: [
      {
        name: "Four 50g Powder Jars",
        body: "Multani Mitti, Orange Peel, De-Tan and Korean Glow — 50g of pure, finely milled natural powder in every jar. Enough for many face packs from each.",
        bg: "#F4EBDD",
        color: "#8A6A2E",
      },
      {
        name: "Mixed Fresh, Every Time",
        body: "No pre-mixed creams and no preservatives. Scoop what you need, add water or rose water, stir into a smooth paste and apply — full potency at the moment of use.",
        bg: "#F8F3EE",
        color: "#7A5C4A",
      },
    ],
    weightKg: 0.24,
  },
  {
    slug: "multani-mitti",
    img: imgMultaniMitti,
    img2: imgMultaniMittiAlt,
    title: "Multani Mitti",
    desc: "Oil control, deep clean & detox with mineral-rich clay.",
    price: "₹399",
    priceNum: 399,
    mrpNum: 499,
    badge: "Best Seller",
    tone: "#8A6A4A",
    activeLabel: "MULTANI MITTI",
    long: "A 50g jar of pure, mineral-rich Multani Mitti powder — finely milled fuller's earth, and nothing else. Scoop a spoonful, mix with a little water or rose water into a smooth clay paste, and apply for a fresh, oil-absorbing, pore-refining ritual. No preservatives, ever.",
    ingredients: [
      {
        name: "Pure Multani Mitti",
        body: "Mineral-rich fuller's earth, finely milled. Draws out impurities, absorbs excess oil and refines pores. 50g of pure clay — nothing else added.",
        bg: "#F3ECDF",
        color: "#7A6249",
      },
      {
        name: "Mix With Water or Rose Water",
        body: "Add a little water for a classic clay pack, or rose water for extra toning and hydration. Stir into a smooth paste and apply fresh.",
        bg: "#F5E8E8",
        color: "#7A5C5A",
      },
    ],
    pricingTiers: PACK_TIERS,
    weightKg: 0.06,
  },
  {
    slug: "orange-peel",
    img: imgOrangePeel,
    img2: imgOrangePeelAlt,
    title: "Orange Peel",
    desc: "Tan removal & brightening for a natural, even glow.",
    price: "₹399",
    priceNum: 399,
    mrpNum: 499,
    badge: "Brightening",
    tone: "#E08A2E",
    activeLabel: "ORANGE PEEL",
    long: "A 50g jar of vitamin-C-rich orange peel powder blended with mineral clay — pure, natural, finely milled. Scoop a spoonful, mix with a little water or rose water into a smooth paste, and apply for a fresh, glow-boosting brightening ritual. No preservatives, ever.",
    ingredients: [
      {
        name: "Orange Peel & Clay",
        body: "Vitamin-C-rich orange peel with mineral clay that lifts tan and brightens for an even, natural glow. 50g of pure powder.",
        bg: "#F6ECD9",
        color: "#8A6A2E",
      },
      {
        name: "Mix With Water or Rose Water",
        body: "Add a little water for a classic pack, or rose water for extra toning and hydration. Stir into a smooth paste and apply fresh.",
        bg: "#F5E8E8",
        color: "#7A5C5A",
      },
    ],
    pricingTiers: PACK_TIERS,
    weightKg: 0.06,
  },
  {
    slug: "de-tan",
    img: imgDeTan,
    img2: imgDeTanAlt,
    title: "De-Tan",
    desc: "Turmeric & clay that lift tan and even skin tone.",
    price: "₹399",
    priceNum: 399,
    mrpNum: 499,
    badge: "Renewing",
    tone: "#C79A2E",
    activeLabel: "DE-TAN",
    long: "A 50g jar of antioxidant turmeric blended with mineral clay — pure, natural, finely milled. Scoop a spoonful, mix with a little water or rose water into a warm, smooth paste, and apply for a fresh, tan-lifting renewing ritual. No preservatives, ever.",
    ingredients: [
      {
        name: "Turmeric & Clay",
        body: "Antioxidant turmeric with mineral clay that gently lifts tan and evens out skin tone. 50g of pure powder.",
        bg: "#F5EDD5",
        color: "#8A712E",
      },
      {
        name: "Mix With Water or Rose Water",
        body: "Add a little water for a classic pack, or rose water for extra toning and hydration. Stir into a smooth paste and apply fresh.",
        bg: "#F5E8E8",
        color: "#7A5C5A",
      },
    ],
    pricingTiers: PACK_TIERS,
    weightKg: 0.06,
  },
  {
    slug: "korean-glow",
    img: imgKoreanGlow,
    img2: imgKoreanGlowAlt,
    title: "Korean Glow",
    desc: "Rice, clay & oat for glass-skin softness.",
    price: "₹399",
    priceNum: 399,
    mrpNum: 499,
    badge: "New",
    tone: "#7C93A6",
    activeLabel: "KOREAN GLOW",
    long: "A 50g jar of brightening rice, soothing oat and fine mineral clay — pure, natural, finely milled. Scoop a spoonful, mix with a little water or rose water into a soft, luminous paste, and apply for that dewy, glass-skin glow. No preservatives, ever.",
    ingredients: [
      {
        name: "Rice, Clay & Oat",
        body: "Brightening rice with soothing oat and fine clay for smooth, plump, glass-skin softness. 50g of pure powder.",
        bg: "#EAEEF1",
        color: "#546272",
      },
      {
        name: "Mix With Water or Rose Water",
        body: "Add a little water for a classic pack, or rose water for extra toning and hydration. Stir into a smooth paste and apply fresh.",
        bg: "#F5E8E8",
        color: "#7A5C5A",
      },
    ],
    pricingTiers: PACK_TIERS,
    weightKg: 0.06,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
