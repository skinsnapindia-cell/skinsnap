import type { StaticImageData } from "next/image";
import imgCombo from "@/public/assets/pack-combo.webp";
import imgMultaniMitti from "@/public/assets/pack-multani-mitti.webp";
import imgOrangePeel from "@/public/assets/pack-orange-peel.webp";
import imgDeTan from "@/public/assets/pack-de-tan.webp";
import imgKoreanGlow from "@/public/assets/pack-korean-glow.webp";

export type Product = {
  slug: string;
  img: StaticImageData;
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

export const products: Product[] = [
  {
    slug: "combo-pack",
    img: imgCombo,
    title: "Combo Pack",
    desc: "4 freshly activated face packs for every skincare need at an unbeatable price.",
    price: "₹99",
    priceNum: 99,
    mrpNum: 196,
    badge: "Best Value",
    tone: "#8C6B52",
    activeLabel: "4-IN-1 COMBO",
    long: "Discover the complete SKINSNAP skincare experience in one box. Each sachet features our Dual-Chamber Fresh Activation Technology, keeping 20ml Pure Rose Water and 20g Herbal Powder separate until use. Simply Press → Mix → Tear → Apply for a freshly activated face pack every time. Includes Multani Mitti, Orange Peel, De-Tan, and Korean Glow Face Packs for cleansing, brightening, tan removal, and healthy glowing skin.",
    ingredients: [
      {
        name: "4 Freshly Activated Face Packs",
        body: "Includes Multani Mitti, Orange Peel, De-Tan, and Korean Glow Face Packs. Each pouch contains 20ml Pure Rose Water + 20g Herbal Powder, activated only when you're ready to use it.",
        bg: "#F8F3EE",
        color: "#7A5C4A",
      },
      {
        name: "Dual-Chamber Fresh Activation",
        body: "Patented burst-pouch concept keeps rose water and herbal ingredients separate until use, delivering maximum freshness, better performance, zero mess, and no bowl or spoon required.",
        bg: "#F4EBDD",
        color: "#8A6A2E",
      },
    ],
  },
  {
    slug: "multani-mitti",
    img: imgMultaniMitti,
    title: "Multani Mitti",
    desc: "Oil control, deep clean & detox with mineral-rich clay.",
    price: "₹29",
    priceNum: 29,
    mrpNum: 49,
    badge: "Best Seller",
    tone: "#8A6A4A",
    activeLabel: "MULTANI MITTI",
    long: "A freshly activated clay ritual. Press to release pure rose water into mineral-rich Multani Mitti — a smooth, cooling cream forms in seconds, no bowl required.",
    ingredients: [
      {
        name: "Pure Rose Water",
        body: "Steam-distilled from fresh petals. Tones, hydrates and activates the clay into a silky cream.",
        bg: "#F5E8E8",
        color: "#7A5C5A",
      },
      {
        name: "Multani Mitti Clay",
        body: "Mineral-rich fuller's earth that draws out impurities, absorbs excess oil and refines pores.",
        bg: "#F3ECDF",
        color: "#7A6249",
      },
    ],
  },
  {
    slug: "orange-peel",
    img: imgOrangePeel,
    title: "Orange Peel",
    desc: "Tan removal & brightening for a natural, even glow.",
    price: "₹29",
    priceNum: 29,
    mrpNum: 49,
    badge: "Brightening",
    tone: "#E08A2E",
    activeLabel: "ORANGE PEEL",
    long: "A freshly activated brightening ritual. Press to flood pure rose water into vitamin-C-rich orange peel and clay — a fresh, glow-boosting cream forms in seconds.",
    ingredients: [
      {
        name: "Pure Rose Water",
        body: "Steam-distilled from fresh petals. Tones, hydrates and activates the blend into a silky cream.",
        bg: "#F5E8E8",
        color: "#7A5C5A",
      },
      {
        name: "Orange Peel & Clay",
        body: "Vitamin-C-rich orange peel with mineral clay that lifts tan and brightens for an even, natural glow.",
        bg: "#F6ECD9",
        color: "#8A6A2E",
      },
    ],
  },
  {
    slug: "de-tan",
    img: imgDeTan,
    title: "De-Tan",
    desc: "Turmeric & clay that lift tan and even skin tone.",
    price: "₹29",
    priceNum: 29,
    mrpNum: 49,
    badge: "Renewing",
    tone: "#C79A2E",
    activeLabel: "DE-TAN",
    long: "A freshly activated renewing ritual. Press to release pure rose water into turmeric and clay — a warm, tan-lifting cream forms in seconds, no bowl required.",
    ingredients: [
      {
        name: "Pure Rose Water",
        body: "Steam-distilled from fresh petals. Tones, hydrates and activates the blend into a silky cream.",
        bg: "#F5E8E8",
        color: "#7A5C5A",
      },
      {
        name: "Turmeric & Clay",
        body: "Antioxidant turmeric with mineral clay that gently lifts tan and evens out skin tone.",
        bg: "#F5EDD5",
        color: "#8A712E",
      },
    ],
  },
  {
    slug: "korean-glow",
    img: imgKoreanGlow,
    title: "Korean Glow",
    desc: "Rice, clay & oat for glass-skin softness.",
    price: "₹29",
    priceNum: 29,
    mrpNum: 49,
    badge: "New",
    tone: "#7C93A6",
    activeLabel: "KOREAN GLOW",
    long: "A freshly activated glass-skin ritual. Press to blend pure rose water with rice, clay and oat — a soft, luminous cream forms in seconds for that dewy Korean glow.",
    ingredients: [
      {
        name: "Pure Rose Water",
        body: "Steam-distilled from fresh petals. Tones, hydrates and activates the blend into a silky cream.",
        bg: "#F5E8E8",
        color: "#7A5C5A",
      },
      {
        name: "Rice, Clay & Oat",
        body: "Brightening rice with soothing oat and fine clay for smooth, plump, glass-skin softness.",
        bg: "#EAEEF1",
        color: "#546272",
      },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
