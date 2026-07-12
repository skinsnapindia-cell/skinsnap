import Image from "next/image";
import Link from "next/link";
import { getProduct, productDisplayName } from "@/lib/products";

/**
 * Compact product card used inside blog articles — links a mentioned
 * product to its detail page.
 */
export default function ProductCta({ slug }: { slug: string }) {
  const product = getProduct(slug);
  if (!product) return null;
  return (
    <Link
      href={`/product/${product.slug}`}
      className="product-cta"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        background: "#FCFAF5",
        border: "1px solid #EAE0D0",
        borderRadius: 18,
        padding: 16,
        margin: "28px 0",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 14,
          overflow: "hidden",
          background: "#F1EADD",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <Image
          src={product.img}
          alt={productDisplayName(product)}
          fill
          sizes="84px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-instrument-serif), serif",
            fontSize: 20,
            color: "#26221C",
          }}
        >
          {productDisplayName(product)}
        </div>
        <div style={{ fontSize: 13, color: "#6B6357", marginTop: 4 }}>
          {product.desc}
        </div>
      </div>
      <div
        className="product-cta__btn"
        style={{
          background: "#26221C",
          color: "#F6F1E9",
          borderRadius: 999,
          padding: "10px 20px",
          fontWeight: 700,
          fontSize: 13,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {product.price} · Shop →
      </div>
    </Link>
  );
}
