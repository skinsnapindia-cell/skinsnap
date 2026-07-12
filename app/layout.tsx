import type { Metadata } from "next";
import { Manrope, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { CartProvider } from "@/context/CartContext";
import { SITE_URL } from "@/lib/site";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SkinSnap — Fresh Clay. Zero Mess.",
    template: "%s | SkinSnap",
  },
  description:
    "Freshly activated natural face packs with dual-chamber innovation. Press to mix rose water and clay — no bowl, no spoon, no mess.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${instrumentSerif.variable}`}
    >
      <body>
        <SmoothScroll>
          <CartProvider>{children}</CartProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}