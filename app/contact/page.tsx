import type { Metadata } from "next";
import ContactPage from "./ContactPage";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Questions about SkinSnap face packs, orders, shipping or wholesale? Reach us by email, Instagram or WhatsApp — we reply fast.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <ContactPage />;
}
