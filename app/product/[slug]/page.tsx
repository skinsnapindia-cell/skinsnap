import { notFound } from "next/navigation";

import { getProduct, products } from "@/lib/products";

import ProductDetail from "./ProductDetail";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default function Page({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);
  return <ProductDetail product={product} related={related} />;
}
