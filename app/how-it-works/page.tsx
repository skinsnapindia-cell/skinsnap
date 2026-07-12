import type { Metadata } from "next";
import HowItWorksPage from "./HowItWorksPage";

export const metadata: Metadata = {
  title: "How It Works — Dual-Chamber Face Pack Technology",
  description:
    "See how SkinSnap's dual-chamber pouch works: press to burst the seal, mix pure rose water into herbal clay, tear and apply. A freshly activated face pack every time — no bowl, no spoon.",
  alternates: { canonical: "/how-it-works" },
};

export default function Page() {
  return <HowItWorksPage />;
}
