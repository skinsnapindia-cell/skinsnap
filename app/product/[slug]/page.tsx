import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, getProduct, productDisplayName } from "@/lib/products";
import { jsonLdString, productJsonLd } from "@/lib/seo";
import ProductDetail from "./ProductDetail";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const product = getProduct(params.slug);
  if (!product) return {};
  const title = `${productDisplayName(product)} — ${product.price}`;
  return {
    title,
    description: product.desc,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      siteName: "SkinSnap",
      locale: "en_IN",
      url: `/product/${product.slug}`,
      title,
      description: product.desc,
      images: [
        {
          url: product.img.src,
          alt: productDisplayName(product),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: product.desc,
      images: [product.img.src],
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: for seo json-ld
        dangerouslySetInnerHTML={{
          __html: jsonLdString(productJsonLd(product)),
        }}
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}
