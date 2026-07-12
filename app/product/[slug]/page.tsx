import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, getProduct } from "@/lib/products";
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
  return {
    title: `${product.title} Face Pack — ${product.price}`,
    description: product.desc,
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);
  return <ProductDetail product={product} related={related} />;
}
