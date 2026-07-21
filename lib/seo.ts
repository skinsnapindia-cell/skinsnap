import { INSTAGRAM_URL, WHATSAPP_PHONE } from "@/lib/social";
import { SITE_URL } from "@/lib/site";
import { productDisplayName, type Product } from "@/lib/products";

/**
 * Site-wide Open Graph image, exactly 1200×630. JPG rather than the source
 * webp because WhatsApp link previews render webp unreliably.
 */
export const OG_DEFAULT_IMAGE = "/assets/og/home.jpg";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SkinSnap",
    url: SITE_URL,
    logo: `${SITE_URL}/apple-icon.png`,
    description:
      "Freshly activated natural face packs with dual-chamber innovation — pure rose water and herbal clay mixed only when you press.",
    sameAs: [INSTAGRAM_URL],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: WHATSAPP_PHONE,
      contactType: "customer service",
      email: "contact@skinsnap.beauty",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SkinSnap",
    url: SITE_URL,
  };
}

/**
 * `aggregateRating`/`review` are intentionally omitted: the ratings shown on
 * the product page are placeholder marketing copy, not genuine aggregated
 * reviews. Marking them up would violate Google's review-snippet policy. Add
 * them here only once real review data exists.
 */
export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productDisplayName(product),
    image: [`${SITE_URL}${product.img.src}`],
    description: product.long,
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: "SkinSnap",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.priceNum,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      // Single-use hygiene product — returns are not accepted.
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
      // Ships within India only. Rate is a flat placeholder (real cost varies
      // ~₹60–120); update `value` once exact shipping is finalised.
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 100,
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 4,
            maxValue: 10,
            unitCode: "DAY",
          },
        },
      },
    },
  };
}

export function blogPostingJsonLd(post: {
  slug: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url: `${SITE_URL}/blog/${post.slug}`,
    image: `${SITE_URL}${OG_DEFAULT_IMAGE}`,
    author: {
      "@type": "Person",
      name: post.author,
      jobTitle: "Co-founder, SkinSnap",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "SkinSnap",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/apple-icon.png`,
      },
    },
  };
}

export function faqJsonLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

/** Renders a JSON-LD object as the string body of a <script> tag. */
export function jsonLdString(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
