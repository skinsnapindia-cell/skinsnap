"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/products";

/**
 * Product card with the 3D tilt-on-hover effect from the reference, plus a
 * quantity stepper. "Add to Cart" adds the chosen quantity to the cart (and
 * opens the cart drawer); the displayed price reflects the current quantity.
 */
export default function ProductPouch({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const isCombo = product.slug === "combo-pack";

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-8px) rotateX(${(-y * 5).toFixed(
      2,
    )}deg) rotateY(${(x * 7).toFixed(2)}deg)`;
    el.style.boxShadow = "0 40px 70px -34px rgba(38,34,28,0.5)";
  };
  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "translateY(0) rotateX(0) rotateY(0)";
    e.currentTarget.style.boxShadow = "0 14px 30px -22px rgba(38,34,28,0.35)";
  };

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div
      className={isCombo ? "combo-wrap" : undefined}
      style={{ perspective: 1200, height: "100%" }}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: mouse-only decorative tilt; card actions are real buttons/links */}
      <div
        className={isCombo ? "combo-card" : undefined}
        role="presentation"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          background: isCombo ? "#FFFCF6" : "#FCFAF5",
          border: isCombo ? "1px solid #E4C9A8" : "1px solid #EAE0D0",
          borderRadius: 24,
          padding: "16px 16px 22px",
          transition: "box-shadow 0.4s ease, transform 0.15s ease",
          boxShadow: isCombo
            ? "0 22px 44px -24px rgba(161,94,56,0.45)"
            : "0 14px 30px -22px rgba(38,34,28,0.35)",
          transformStyle: "preserve-3d",
          willChange: "transform",
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Link
          href={`/product/${product.slug}`}
          style={{
            position: "relative",
            display: "block",
            borderRadius: 16,
            overflow: "hidden",
            background: "#F1EADD",
            aspectRatio: "3 / 2",
            transform: "translateZ(30px)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.img}
            alt={
              isCombo
                ? "SkinSnap 4-Pack Face Pack Combo"
                : `${product.title} Face Pack`
            }
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {isCombo && (
            <>
              <span className="combo-shine" />
              <span
                className="combo-ribbon"
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#26221C",
                  color: "#F6F1E9",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "7px 12px",
                  borderRadius: 999,
                  boxShadow: "0 8px 18px -8px rgba(38,34,28,0.6)",
                }}
              >
                <span aria-hidden="true">🎁</span> Combo Offer · ₹99
              </span>
            </>
          )}
        </Link>

        <div
          style={{
            padding: "0 6px",
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginTop: 18,
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 22,
                color: "#26221C",
                lineHeight: 1.1,
              }}
            >
              {product.title}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: product.tone,
                whiteSpace: "nowrap",
              }}
            >
              {product.badge}
            </div>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#6B6357",
              marginTop: 8,
              lineHeight: 1.55,
              minHeight: 36,
            }}
          >
            {product.desc}
          </div>

          {/* price reflects quantity — offer price + struck MRP + savings */}
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 700, color: "#26221C" }}>
                {formatINR(product.priceNum * qty)}
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: "#9B8F7C",
                  textDecoration: "line-through",
                }}
              >
                {formatINR(product.mrpNum * qty)}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  color: "#5E7C4E",
                  background: "#EAF1E4",
                  borderRadius: 999,
                  padding: "3px 9px",
                }}
              >
                Save {formatINR((product.mrpNum - product.priceNum) * qty)}
              </span>
            </div>
            {qty > 1 && (
              <div style={{ fontSize: 12, color: "#9B8F7C", marginTop: 4 }}>
                {qty} × {formatINR(product.priceNum)}
              </div>
            )}
          </div>

          {/* quantity + add to cart */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: "auto",
              paddingTop: 16,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #D7CCBB",
                borderRadius: 999,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={stepBtn}
              >
                −
              </button>
              <span
                style={{
                  minWidth: 24,
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                style={stepBtn}
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              style={{
                flex: 1,
                textAlign: "center",
                background: added ? "#5E7C4E" : "#26221C",
                color: "#F6F1E9",
                borderRadius: 999,
                padding: "12px 0",
                fontWeight: 700,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
                fontFamily: "'Manrope',sans-serif",
                transition: "background 0.25s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!added) e.currentTarget.style.background = "#A15E38";
              }}
              onMouseLeave={(e) => {
                if (!added) e.currentTarget.style.background = "#26221C";
              }}
            >
              {added ? "Added ✓" : "Add to Cart"}
            </button>
          </div>

          <Link
            href={`/product/${product.slug}`}
            style={{
              display: "block",
              textAlign: "center",
              background: "transparent",
              color: "#26221C",
              border: "1px solid #D7CCBB",
              borderRadius: 999,
              padding: "11px 0",
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
              marginTop: 10,
            }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

const stepBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "8px 12px",
  fontSize: 15,
  color: "#26221C",
  fontFamily: "'Manrope',sans-serif",
};
