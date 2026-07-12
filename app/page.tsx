import type { Metadata } from "next";
import HomePage from "./HomePage";

export const metadata: Metadata = {
  title: {
    absolute: "SkinSnap — Freshly Activated Natural Face Packs | Fresh Clay. Zero Mess.",
  },
  description:
    "Dual-chamber natural face packs, freshly activated when you press. Multani Mitti, Orange Peel, De-Tan & Korean Glow — rose water + herbal clay, no bowl, no spoon, no mess. From ₹29.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomePage />;
}
