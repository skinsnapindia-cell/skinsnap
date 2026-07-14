import type { Metadata } from "next";
import { Manrope, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SmoothScroll from "@/components/SmoothScroll";
import { CartProvider } from "@/context/CartContext";
import { FB_PIXEL_ID } from "@/lib/fbpixel";
import { jsonLdString, OG_DEFAULT_IMAGE, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
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
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static self-authored JSON-LD, < escaped in jsonLdString
          dangerouslySetInnerHTML={{
            __html: jsonLdString(websiteJsonLd()),
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
            {/* Official Meta base code as a plain inline script: it executes
                during HTML parsing, so window.fbq exists before any React
                effect or click handler can call fbqTrack. Initial PageView
                fires here; route-change PageViews come from fbevents.js's
                built-in pushState tracking. */}
            <script
              // biome-ignore lint/security/noDangerouslySetInnerHtml: Meta's official static base snippet, no user input
              dangerouslySetInnerHTML={{
                __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${FB_PIXEL_ID}');
fbq('track', 'PageView');`,
              }}
            />
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