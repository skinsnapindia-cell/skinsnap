import type { Metadata } from "next";
import { Manrope, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { CartProvider } from "@/context/CartContext";
import { jsonLdString, OG_DEFAULT_IMAGE, organizationJsonLd } from "@/lib/seo";
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
  openGraph: {
    type: "website",
    siteName: "SkinSnap",
    locale: "en_IN",
    url: "/",
    title: "SkinSnap — Fresh Clay. Zero Mess.",
    description:
      "Freshly activated natural face packs with dual-chamber innovation. Press to mix rose water and clay — no bowl, no spoon, no mess.",
    images: [
      {
        url: OG_DEFAULT_IMAGE,
        width: 1200,
        height: 630,
        alt: "SkinSnap freshly activated natural face packs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkinSnap — Fresh Clay. Zero Mess.",
    description:
      "Freshly activated natural face packs. Press to mix rose water and clay — no bowl, no spoon, no mess.",
    images: [OG_DEFAULT_IMAGE],
  },
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
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: for seo json-ld
          dangerouslySetInnerHTML={{
            __html: jsonLdString(organizationJsonLd()),
          }}
        />
        <SmoothScroll>
          <CartProvider>{children}</CartProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}