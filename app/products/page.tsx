import type { Metadata } from "next";
import ProductsPage from "./ProductsPage";

export const metadata: Metadata = {
  title: "Natural Face Packs — Multani Mitti, Orange Peel, De-Tan & Korean Glow",
  description:
    "Shop all SkinSnap face packs. Every pouch uses dual-chamber fresh activation — 20ml pure rose water + 20g herbal powder, mixed only when you press. Singles ₹29, combo pack ₹99.",
  alternates: { canonical: "/products" },
  openGraph: {
    url: "/products",
    title: "SkinSnap Natural Face Packs",
    description:
      "Multani Mitti, Orange Peel, De-Tan & Korean Glow. Singles ₹29, combo pack ₹99.",
  },
};

export default function Page() {
  return <ProductsPage />;
}
