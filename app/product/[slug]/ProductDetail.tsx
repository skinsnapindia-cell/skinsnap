"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductPouch from "@/components/ProductPouch";
import { useReveals } from "@/lib/useReveals";
import { useCart } from "@/context/CartContext";
import { fbqTrack } from "@/lib/fbpixel";
import { formatINR, formatUnitINR } from "@/lib/format";
import { hasTiers, lineTotal, lineUnitPrice, lineRegularTotal, lineSavings, MAX_PER_PRODUCT, type PricingTier } from "@/lib/pricing";
import { productDisplayName, type Product } from "@/lib/products";

const reviews = [
  {
    text: '"Ekdum fresh lage che! Just mix a spoonful with rose water and the paste is so smooth. My skin feels clean and soft after every use."',
    name: "Krupa Patel",
    meta: "Verified · Ahmedabad · Combination skin",
  },
  {
    text: '"I was skeptical about mixing it myself, but it takes seconds and feels so much fresher than the tube masks I used to buy. Loved it."',
    name: "Hetal Shah",
    meta: "Verified · Surat · Oily skin",
  },
  {
    text: '"One jar lasts me ages and every pack is freshly mixed. Goes on silky and cool, and the tan on my face has genuinely faded. Obsessed!"',
    name: "Riddhi Mehta",
    meta: "Verified · Vadodara · Normal skin",
  },
];

const benefits = [
  {
    n: "01",
    t: "Deep cleanse",
    d: "Lifts dirt and impurities from within pores.",
  },
  { n: "02", t: "Oil control", d: "Balances shine for a fresh, matte finish." },
  {
    n: "03",
    t: "Soothe & tone",
    d: "Natural clay and botanicals calm and refresh the skin.",
  },
  { n: "04", t: "Natural glow", d: "Reveals brighter, smoother-looking skin." },
];

const usage = [
  {
    n: "01",
    t: "Scoop the powder",
    d: "Add 1–2 teaspoons of powder to a small bowl.",
  },
  {
    n: "02",
    t: "Mix into a paste",
    d: "Add a little water or rose water and stir into a smooth paste.",
  },
  {
    n: "03",
    t: "Apply",
    d: "Spread an even layer over clean, dry skin.",
  },
  {
    n: "04",
    t: "Rest, then rinse",
    d: "Leave 10–15 minutes, rinse with warm water, and glow.",
  },
];

const Star = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.9 6.2 6.6.8-4.9 4.5 1.3 6.6L12 17.8 6.1 20.7l1.3-6.6L2.5 9l6.6-.8z" />
  </svg>
);

export default function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const { addItem, buyNow } = useCart();

  useReveals(scopeRef);

  // Meta pixel: product page view
  useEffect(() => {
    fbqTrack("ViewContent", {
      content_ids: [product.slug],
      content_name: product.title,
      content_type: "product",
      value: product.priceNum,
      currency: "INR",
    });
  }, [product.slug, product.title, product.priceNum]);

  // sticky add-to-cart bar reveal
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const bar = barRef.current;
      const gallery = galleryRef.current;
      if (!bar || !gallery) return;
      gsap.set(bar, { y: "110%" });
      ScrollTrigger.create({
        trigger: gallery,
        start: "bottom 60%",
        end: "max",
        onEnter: () =>
          gsap.to(bar, { y: "0%", duration: 0.5, ease: "power3.out" }),
        onLeaveBack: () =>
          gsap.to(bar, { y: "110%", duration: 0.4, ease: "power3.in" }),
      });
      setTimeout(() => ScrollTrigger.refresh(), 300);
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  const isCombo = product.slug === "combo-pack";
  const useTiers = hasTiers(product);
  // Line pricing for the selected quantity. Tiered products get "Buy More,
  // Save More" totals; others keep flat price × qty with the MRP strike.
  const offerTotal = lineTotal(product, qty);
  const unit = lineUnitPrice(product, qty);
  const regularTotal = useTiers
    ? lineRegularTotal(product, qty)
    : product.mrpNum * qty;
  const savingsTotal = useTiers
    ? lineSavings(product, qty)
    : Math.max(0, (product.mrpNum - product.priceNum) * qty);
  const galleryImages = [product.img, product.img2];

  const buy = () => buyNow(product, qty);
  const [added, setAdded] = useState(false);
  const addToCart = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="wrap" ref={scopeRef}>
      <Nav active="products" />

      {/* HERO / PRODUCT */}
      <section
        className="section-pad"
        style={{
          padding: "130px 48px 90px",
          background:
            "radial-gradient(120% 100% at 20% 0%, #FBF6EF 0%, #EFE4D4 100%)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: 13, color: "#9B8F7C", marginBottom: 32 }}>
            <Link
              href="/products"
              style={{ textDecoration: "none", color: "#9B8F7C" }}
            >
              Products
            </Link>
            &nbsp;/&nbsp;
            <span style={{ color: "#6B6357" }}>
              {productDisplayName(product)}
            </span>
          </div>
          <div
            className="detail-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr 1fr",
              gap: 60,
              alignItems: "start",
            }}
          >
            {/* GALLERY */}
            <div>
              <div
                ref={galleryRef}
                style={{
                  background: "#F3ECDF",
                  borderRadius: 28,
                  padding: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 440,
                }}
              >
                <Image
                  key={active}
                  src={galleryImages[active]}
                  alt={`${productDisplayName(product)} — photo ${active + 1}`}
                  priority
                  sizes="(max-width: 900px) 92vw, 640px"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 16,
                    display: "block",
                    filter: "drop-shadow(0 30px 40px rgba(120,80,60,0.18))",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
                {galleryImages.map((image, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    aria-label={`Show photo ${i + 1} of ${productDisplayName(product)}`}
                    aria-pressed={active === i}
                    style={{
                      position: "relative",
                      flex: "0 0 auto",
                      width: 96,
                      aspectRatio: "3 / 2",
                      padding: 0,
                      borderRadius: 16,
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "#F3ECDF",
                      border: `2px solid ${active === i ? "#26221C" : "#E0D6C6"}`,
                      opacity: active === i ? 1 : 0.72,
                      transition: "border-color 0.25s ease, opacity 0.25s ease",
                    }}
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="96px"
                      style={{ objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* INFO (sticky) */}
            <div
              className="detail-info-sticky"
              style={{ position: "sticky", top: 100 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", gap: 2, color: "#C17A50" }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} />
                  ))}
                </div>
                <span style={{ fontSize: 13, color: "#6B6357" }}>
                  4.9 · 312 reviews
                </span>
              </div>
              <h1
                className="section-title h-lg"
                style={{ fontSize: 46, lineHeight: 1.05, margin: 0 }}
              >
                {productDisplayName(product)}
              </h1>
              <p
                style={{
                  fontSize: 16,
                  color: "#6B6357",
                  lineHeight: 1.65,
                  margin: "18px 0 24px",
                }}
              >
                {product.long}
              </p>
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 30, fontWeight: 700 }}>
                    {formatINR(offerTotal)}
                  </span>
                  {savingsTotal > 0 && (
                    <span
                      style={{
                        fontSize: 18,
                        color: "#9B8F7C",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatINR(regularTotal)}
                    </span>
                  )}
                  {savingsTotal > 0 && (
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#5E7C4E",
                        background: "#EAF1E4",
                        borderRadius: 999,
                        padding: "5px 13px",
                      }}
                    >
                      Save {formatINR(savingsTotal)}
                    </span>
                  )}
                </div>
                <span
                  style={{ fontSize: 14, fontWeight: 500, color: "#9B8F7C" }}
                >
                  {isCombo
                    ? "/ 4-jar combo box"
                    : qty > 1
                      ? `${qty} jars · ${formatUnitINR(unit)} each`
                      : "/ 50g jar"}
                </span>
                {savingsTotal > 0 && (
                  <div style={{ fontSize: 13, color: "#5E7C4E", fontWeight: 600, marginTop: 8 }}>
                    You pay {formatINR(offerTotal)} instead of {formatINR(regularTotal)} — that&apos;s {formatINR(savingsTotal)} off.
                  </div>
                )}
                {useTiers && (
                  <PackSelector
                    tiers={product.pricingTiers!}
                    selected={qty}
                    onSelect={setQty}
                  />
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#6B6357",
                  }}
                >
                  Quantity
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #D7CCBB",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    style={qtyBtn}
                  >
                    −
                  </button>
                  <span
                    style={{
                      minWidth: 36,
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(MAX_PER_PRODUCT, q + 1))}
                    disabled={qty >= MAX_PER_PRODUCT}
                    title={qty >= MAX_PER_PRODUCT ? `Limit ${MAX_PER_PRODUCT} per product` : undefined}
                    style={{ ...qtyBtn, opacity: qty >= MAX_PER_PRODUCT ? 0.35 : 1, cursor: qty >= MAX_PER_PRODUCT ? "not-allowed" : "pointer" }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={addToCart}
                  style={{
                    flex: 1,
                    background: added ? "#5E7C4E" : "transparent",
                    color: added ? "#F6F1E9" : "#26221C",
                    border: `1px solid ${added ? "#5E7C4E" : "#26221C"}`,
                    borderRadius: 999,
                    padding: "17px 0",
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                  }}
                >
                  {added ? "Added ✓" : "Add to Cart"}
                </button>
                <button
                  onClick={buy}
                  style={{
                    flex: 1,
                    background: "#26221C",
                    color: "#F6F1E9",
                    border: "1px solid #26221C",
                    borderRadius: 999,
                    padding: "17px 0",
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: "0 16px 30px -14px rgba(38,34,28,0.5)",
                    transition: "background 0.25s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#A15E38")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#26221C")
                  }
                >
                  Order Now
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 24,
                  marginTop: 24,
                  flexWrap: "wrap",
                }}
              >
                {["100% Natural", "No preservatives", "Cruelty-free"].map(
                  (t) => (
                    <div
                      key={t}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        color: "#6B6357",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#8FA97C",
                        }}
                      />
                      {t}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INGREDIENTS */}
      <section
        className="section-pad"
        style={{ padding: "110px 48px", background: "#F6F1E9" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            data-reveal
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#A15E38",
              textAlign: "center",
            }}
          >
            Ingredients
          </div>
          <h2
            data-reveal
            className="section-title h-lg"
            style={{ fontSize: 44, margin: "14px 0 56px", textAlign: "center" }}
          >
            What&apos;s inside.
          </h2>
          <div className="grid-2" style={{ gap: 28 }}>
            {product.ingredients.map((ing) => (
              <div
                data-reveal
                key={ing.name}
                style={{ background: ing.bg, borderRadius: 22, padding: 44 }}
              >
                <div className="section-title" style={{ fontSize: 30 }}>
                  {ing.name}
                </div>
                <p
                  style={{
                    fontSize: 15,
                    color: ing.color,
                    lineHeight: 1.7,
                    marginTop: 14,
                  }}
                >
                  {ing.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section
        className="section-pad"
        style={{ padding: "110px 48px", background: "#EFE4D4" }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <h2
            data-reveal
            className="section-title h-lg"
            style={{ fontSize: 44, margin: "0 0 48px", textAlign: "center" }}
          >
            What it does
          </h2>
          <div className="grid-4" style={{ gap: 22 }}>
            {benefits.map((b) => (
              <div
                data-reveal
                key={b.n}
                style={{ background: "#FCFAF5", borderRadius: 20, padding: 32 }}
              >
                <div
                  className="section-title"
                  style={{ fontSize: 28, color: "#C17A50" }}
                >
                  {b.n}
                </div>
                <div style={{ fontWeight: 700, margin: "12px 0 6px" }}>
                  {b.t}
                </div>
                <div
                  style={{ fontSize: 13, color: "#6B6357", lineHeight: 1.55 }}
                >
                  {b.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USAGE */}
      <section
        className="section-pad"
        style={{ padding: "110px 48px", background: "#F6F1E9" }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2
            data-reveal
            className="section-title h-lg"
            style={{ fontSize: 44, margin: "0 0 48px", textAlign: "center" }}
          >
            How to use
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {usage.map((u) => (
              <div
                data-reveal
                key={u.n}
                style={{
                  display: "flex",
                  gap: 24,
                  alignItems: "baseline",
                  padding: "22px 0",
                  borderBottom: "1px solid #DAD0C0",
                }}
              >
                <span
                  className="section-title"
                  style={{ fontSize: 34, color: "#E8CBB2", minWidth: 52 }}
                >
                  {u.n}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{u.t}</div>
                  <div style={{ fontSize: 14, color: "#6B6357", marginTop: 4 }}>
                    {u.d}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section
        className="section-pad"
        style={{
          padding: "110px 48px",
          background: "#26221C",
          color: "#F6F1E9",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div data-reveal style={{ textAlign: "center", marginBottom: 52 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#E8CBB2",
              }}
            >
              Loved by 300+
            </div>
            <h2
              className="section-title h-xl"
              style={{ fontSize: 46, margin: "14px 0 0" }}
            >
              Customer reviews
            </h2>
          </div>
          <div className="grid-3" style={{ gap: 24 }}>
            {reviews.map((r) => (
              <div
                data-reveal
                key={r.name}
                style={{ background: "#2C2620", borderRadius: 20, padding: 32 }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 2,
                    color: "#E8CBB2",
                    marginBottom: 16,
                  }}
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={15} />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 15,
                    color: "#DCD4C6",
                    lineHeight: 1.7,
                    margin: "0 0 20px",
                  }}
                >
                  {r.text}
                </p>
                <div
                  style={{ fontSize: 13, fontWeight: 700, color: "#F6F1E9" }}
                >
                  {r.name}
                </div>
                <div style={{ fontSize: 12, color: "#9B927F", marginTop: 2 }}>
                  {r.meta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section
        className="section-pad"
        style={{ padding: "110px 48px", background: "#F6F1E9" }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <h2
            data-reveal
            className="section-title h-lg"
            style={{ fontSize: 42, margin: "0 0 44px" }}
          >
            You may also like
          </h2>
          <div className="grid-3" style={{ gap: 26 }}>
            {related.map((p) => (
              <div data-reveal key={p.slug}>
                <ProductPouch product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* STICKY ADD TO CART BAR */}
      <div
        ref={barRef}
        className="section-pad detail-sticky-bar"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 900,
          background: "rgba(246,241,233,0.9)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid #DAD0C0",
          transform: "translateY(110%)",
          padding: "16px 48px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#F3ECDF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Image
                src={product.img}
                alt=""
                width={44}
                height={44}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="detail-bar-title">
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {productDisplayName(product)}
              </div>
              <div style={{ fontSize: 13, color: "#6B6357" }}>
                {formatUnitINR(unit)} / jar
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #D7CCBB",
                borderRadius: 999,
              }}
            >
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{ ...qtyBtn, padding: "8px 14px", fontSize: 16 }}
              >
                −
              </button>
              <span
                style={{ minWidth: 28, textAlign: "center", fontWeight: 700 }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(MAX_PER_PRODUCT, q + 1))}
                disabled={qty >= MAX_PER_PRODUCT}
                title={qty >= MAX_PER_PRODUCT ? `Limit ${MAX_PER_PRODUCT} per product` : undefined}
                style={{ ...qtyBtn, padding: "8px 14px", fontSize: 16, opacity: qty >= MAX_PER_PRODUCT ? 0.35 : 1, cursor: qty >= MAX_PER_PRODUCT ? "not-allowed" : "pointer" }}
              >
                +
              </button>
            </div>
            <button
              onClick={buy}
              style={{
                background: "#26221C",
                color: "#F6F1E9",
                border: "none",
                borderRadius: 999,
                padding: "14px 32px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 0.25s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#A15E38")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#26221C")
              }
            >
              Order Now
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 520px) {
          .detail-bar-title {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * "Buy More, Save More" pack selector. Renders one row per configured tier;
 * selecting a row sets the product quantity. Savings are computed from the
 * tiers themselves (single-unit price × qty − offer total), so the UI stays
 * fully driven by the product's `pricingTiers` config.
 */
function PackSelector({
  tiers,
  selected,
  onSelect,
}: {
  tiers: PricingTier[];
  selected: number;
  onSelect: (qty: number) => void;
}) {
  const sorted = [...tiers].sort((a, b) => a.qty - b.qty);
  const singleUnit =
    sorted.find((t) => t.qty === 1)?.total ?? sorted[0].total / sorted[0].qty;

  return (
    <div style={{ marginTop: 18 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#A15E38",
          marginBottom: 12,
        }}
      >
        Buy More, Save More
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((t) => {
          const on = selected === t.qty;
          const savings = Math.max(0, Math.round(singleUnit * t.qty - t.total));
          return (
            <button
              key={t.qty}
              type="button"
              onClick={() => onSelect(t.qty)}
              aria-pressed={on}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: 16,
                padding: "14px 16px",
                background: on ? "#FBF3EA" : "#FCFAF5",
                border: `2px solid ${on ? "#A15E38" : "#EAE0D0"}`,
                fontFamily: "var(--font-manrope), sans-serif",
                transition: "border-color 0.2s ease, background 0.2s ease",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: `2px solid ${on ? "#A15E38" : "#C9BCA6"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {on && (
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#A15E38" }} />
                  )}
                </span>
                <span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#26221C" }}>
                    {t.qty} Pack{t.qty > 1 ? "s" : ""}
                  </span>
                  <span style={{ display: "block", fontSize: 12, color: "#9B8F7C", marginTop: 2 }}>
                    {formatUnitINR(t.total / t.qty)} / jar
                  </span>
                </span>
              </span>
              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 3,
                  flexShrink: 0,
                }}
              >
                <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  {savings > 0 && (
                    <span style={{ fontSize: 12.5, color: "#9B8F7C", textDecoration: "line-through" }}>
                      {formatINR(Math.round(singleUnit * t.qty))}
                    </span>
                  )}
                  <span style={{ fontWeight: 700, fontSize: 16, color: "#26221C" }}>
                    {formatINR(t.total)}
                  </span>
                </span>
                {savings > 0 && (
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#5E7C4E" }}>
                    Save {formatINR(savings)}
                  </span>
                )}
              </span>
              {t.popular && (
                <span
                  style={{
                    position: "absolute",
                    top: -9,
                    right: 14,
                    background: "#26221C",
                    color: "#F6F1E9",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    padding: "3px 9px",
                    borderRadius: 999,
                  }}
                >
                  Most Popular
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const qtyBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "12px 18px",
  fontSize: 18,
  color: "#26221C",
  fontFamily: "var(--font-manrope), sans-serif",
};
