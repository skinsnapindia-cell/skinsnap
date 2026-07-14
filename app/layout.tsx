import type { Metadata } from "next";
import { Manrope, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MetaPixel from "@/components/MetaPixel";
import SmoothScroll from "@/components/SmoothScroll";
import { CartProvider } from "@/context/CartContext";
import { FB_PIXEL_ID } from "@/lib/fbpixel";
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

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {
                `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { send_page_view: false });
                `
              }
            </Script>
            <Suspense fallback={null}>
              <GoogleAnalytics measurementId={gaMeasurementId} />
            </Suspense>
          </>
        ) : null}
        {FB_PIXEL_ID ? (
          <>
            {/* remote script only — init + PageView go through the queueing
                stub in lib/fbpixel.ts, so nothing is lost if this loads
                after hydration */}
            <Script
              src="https://connect.facebook.net/en_US/fbevents.js"
              strategy="afterInteractive"
            />
            <Suspense fallback={null}>
              <MetaPixel />
            </Suspense>
            {/* raw string, not JSX: React would instantiate a JSX <img> inside
                <noscript> as a real DOM node during hydration and the browser
                would fire the beacon even with JS enabled (double PageView) */}
            <noscript
              // biome-ignore lint/security/noDangerouslySetInnerHtml: static self-authored no-JS beacon markup
              dangerouslySetInnerHTML={{
                __html: `<img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1" />`,
              }}
            />
          </>
        ) : null}
        <SmoothScroll>
          <CartProvider>{children}</CartProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}