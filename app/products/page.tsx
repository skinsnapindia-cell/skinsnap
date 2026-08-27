import type { Metadata } from "next";
import ProductsPage from "./ProductsPage";

export const metadata: Metadata = {
  title: "Natural Face Packs — Multani Mitti, Orange Peel, De-Tan & Korean Glow",
  description:
    "Shop all SkinSnap face packs. Every jar is 50g of pure, natural powder — mix a spoonful with water or rose water for a freshly made pack. Buy more, save more: 1 jar ₹399 down to ₹229.80/jar for 5. Combo pack ₹749.",
  alternates: { canonical: "/products" },
  openGraph: {
    url: "/products",
    title: "SkinSnap Natural Face Packs",
    description:
      "Multani Mitti, Orange Peel, De-Tan & Korean Glow. Buy more, save more from ₹399. Combo pack ₹749.",
  },
};

export default function Page() {
  return <ProductsPage />;
}
