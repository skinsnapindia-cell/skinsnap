import type { Metadata } from "next";
import HomePage from "./HomePage";

export const metadata: Metadata = {
  title: {
    absolute: "SkinSnap — Natural Face-Pack Powders | Pure Clay. Freshly Mixed.",
  },
  description:
    "100% natural face-pack powders in 50g jars. Multani Mitti, Orange Peel, De-Tan & Korean Glow — mix a spoonful with water or rose water for a freshly mixed pack. No preservatives. Buy more, save more — from ₹399, down to ₹229.80/jar in a 5-pack.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomePage />;
}
