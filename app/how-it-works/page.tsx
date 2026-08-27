import type { Metadata } from "next";
import HowItWorksPage from "./HowItWorksPage";

export const metadata: Metadata = {
  title: "How It Works — Mixing Your Fresh Face Pack",
  description:
    "See how SkinSnap works: scoop a spoonful of pure natural powder, mix with water or rose water into a smooth paste, apply, and rinse for a glow. A freshly mixed face pack every time.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    url: "/how-it-works",
    title: "How SkinSnap Works — Freshly Mixed Face Packs",
    description:
      "Scoop, mix with water or rose water, apply and glow. A freshly mixed natural face pack every time.",
  },
};

export default function Page() {
  return <HowItWorksPage />;
}
