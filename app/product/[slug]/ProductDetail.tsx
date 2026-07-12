"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import ProductPouch from "@/components/ProductPouch";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/products";
import { useReveals } from "@/lib/useReveals";

const reviews = [
  {
    text: '"The freshest my clay mask has ever felt. Genuinely no mess — I use it on flights now."',
    name: "Priya M.",
    meta: "Verified · Combination skin",
  },
  {
    text: '"I was skeptical about the press-to-mix, but it works perfectly every time. Feels so premium."',
    name: "Daniel R.",
    meta: "Verified · Oily skin",
  },
  {
    text: '"Skincare that fits in my clutch. The cream comes out silky and cool. Obsessed."',
    name: "Sofia L.",
    meta: "Verified · Normal skin",
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
    d: "Rose water calms and refreshes the skin.",
  },
  { n: "04", t: "Natural glow", d: "Reveals brighter, smoother-looking skin." },
];

const usage = [
  {
    n: "01",
    t: "Press the rose water chamber",
    d: 'Find the "PRESS HERE →" mark and apply firm, even pressure.',
  },
  {
    n: "02",
    t: "Massage 10–15 seconds",
    d: "The seal bursts and the ingredients blend into a smooth cream.",
  },
  {
    n: "03",
    t: "Tear & apply",
    d: "Open the corner and spread evenly across clean skin.",
  },
  {
    n: "04",
    t: "Rest, then rinse",
    d: "Leave 10 minutes, rinse with warm water, and glow.",
  },
];

const Star = ({ size = 17 }: { size?: number }) => (
  <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2l2.9 6.2 6.6.8-4.9 4.5 1.3 6.6L12 17.8 6.1 20.7l1.3-6.6L2.5 9l6.6-.8z" />
  </svg>
);

type View = "front" | "transparent" | "back";

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
  const [view, setView] = useState<View>("front");
  const [qty, setQty] = useState(1);
  const { addItem, buyNow } = useCart();

  useReveals(scopeRef);

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

  const buy = () => buyNow(product, qty);
  const [added, setAdded] = useState(false);
  const addToCart = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const toneBtn = (k: View) =>
    ({
      flex: 1,
      background: view === k ? "#26221C" : "transparent",
      border: `1px solid ${view === k ? "#26221C" : "#D7CCBB"}`,
      borderRadius: 16,
      padding: 16,
      cursor: "pointer",
      fontFamily: "'Manrope',sans-serif",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "1px",
      color: view === k ? "#F6F1E9" : "#6B6357",
    }) as React.CSSProperties;

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
            <span style={{ color: "#6B6357" }}>{product.title} Face Pack</span>
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
                {view === "front" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.img}
                    alt={`${product.title} Face Pack`}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 16,
                      display: "block",
                      filter: "drop-shadow(0 30px 40px rgba(120,80,60,0.18))",
                    }}
                  />
                )}
                {view === "transparent" && (
                  <svg
                    aria-hidden="true"
                    width="100%"
                    viewBox="0 0 480 320"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="30"
                      y="40"
                      width="420"
                      height="230"
                      rx="22"
                      fill="none"
                      stroke="#B79B78"
                      strokeWidth="1.6"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="240"
                      y1="54"
                      x2="240"
                      y2="256"
                      stroke="#B08A55"
                      strokeWidth="2"
                      strokeDasharray="2 6"
                    />
                    <path
                      d="M46 190 Q 140 168 234 190 L234 258 L46 258 Z"
                      fill="#B97C79"
                      opacity="0.35"
                    />
                    <line
                      x1="46"
                      y1="190"
                      x2="234"
                      y2="190"
                      stroke="#B97C79"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <g opacity="0.6" fill="#C17A50">
                      <circle cx="300" cy="200" r="5" />
                      <circle cx="330" cy="215" r="4" />
                      <circle cx="360" cy="200" r="5" />
                      <circle cx="390" cy="220" r="4" />
                      <circle cx="320" cy="235" r="4" />
                      <circle cx="370" cy="240" r="4" />
                    </g>
                    <text
                      x="135"
                      y="290"
                      textAnchor="middle"
                      fontFamily="Manrope"
                      fontSize="9"
                      fontWeight="700"
                      letterSpacing="1.5"
                      fill="#B97C79"
                    >
                      ROSE WATER
                    </text>
                    <text
                      x="345"
                      y="290"
                      textAnchor="middle"
                      fontFamily="Manrope"
                      fontSize="9"
                      fontWeight="700"
                      letterSpacing="1.5"
                      fill="#A15E38"
                    >
                      {product.activeLabel}
                    </text>
                  </svg>
                )}
                {view === "back" && (
                  <svg
                    aria-hidden="true"
                    width="100%"
                    viewBox="0 0 480 320"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: "drop-shadow(0 30px 40px rgba(120,80,60,0.15))",
                    }}
                  >
                    <rect
                      x="30"
                      y="40"
                      width="420"
                      height="230"
                      rx="22"
                      fill="#FCFAF5"
                      stroke="#DAD0C0"
                      strokeWidth="2"
                    />
                    <text
                      x="240"
                      y="80"
                      textAnchor="middle"
                      fontFamily="Manrope"
                      fontSize="9"
                      fontWeight="700"
                      letterSpacing="2"
                      fill="#6B6357"
                    >
                      HOW IT WORKS
                    </text>
                    <g fontFamily="Manrope">
                      <g transform="translate(95,140)">
                        <circle
                          r="26"
                          fill="none"
                          stroke="#DAD0C0"
                          strokeWidth="1.4"
                        />
                        <path
                          d="M0 -10 L0 8 M-7 1 L0 8 L7 1"
                          stroke="#B97C79"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <text
                          y="44"
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="700"
                          fill="#26221C"
                        >
                          PRESS
                        </text>
                      </g>
                      <g transform="translate(190,140)">
                        <circle
                          r="26"
                          fill="none"
                          stroke="#DAD0C0"
                          strokeWidth="1.4"
                        />
                        <path
                          d="M-8 -10 L2 -1 L-4 4 L8 12"
                          stroke="#B08A55"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <text
                          y="44"
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="700"
                          fill="#26221C"
                        >
                          BURST
                        </text>
                      </g>
                      <g transform="translate(285,140)">
                        <circle
                          r="26"
                          fill="none"
                          stroke="#DAD0C0"
                          strokeWidth="1.4"
                        />
                        <path
                          d="M-10 5 A 11 11 0 1 1 10 5"
                          stroke="#A15E38"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <text
                          y="44"
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="700"
                          fill="#26221C"
                        >
                          MIX
                        </text>
                      </g>
                      <g transform="translate(380,140)">
                        <circle
                          r="26"
                          fill="none"
                          stroke="#DAD0C0"
                          strokeWidth="1.4"
                        />
                        <circle r="6" fill="#E8CBB2" />
                        <path
                          d="M0 -14 L0 -10 M14 0 L10 0 M0 14 L0 10 M-14 0 L-10 0"
                          stroke="#B08A55"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <text
                          y="44"
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="700"
                          fill="#26221C"
                        >
                          GLOW
                        </text>
                      </g>
                    </g>
                    <text
                      x="240"
                      y="235"
                      textAnchor="middle"
                      fontFamily="Manrope"
                      fontSize="9"
                      fontWeight="600"
                      letterSpacing="1"
                      fill="#6B6357"
                    >
                      100% NATURAL · SINGLE USE · NO WATER NEEDED
                    </text>
                  </svg>
                )}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
                <button
                  type="button"
                  onClick={() => setView("front")}
                  style={toneBtn("front")}
                >
                  FRONT
                </button>
                <button
                  type="button"
                  onClick={() => setView("transparent")}
                  style={toneBtn("transparent")}
                >
                  INSIDE
                </button>
                <button
                  type="button"
                  onClick={() => setView("back")}
                  style={toneBtn("back")}
                >
                  BACK
                </button>
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
                {product.title} Face Pack
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
                    {formatINR(product.priceNum * qty)}
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      color: "#9B8F7C",
                      textDecoration: "line-through",
                    }}
                  >
                    {formatINR(product.mrpNum * qty)}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#5E7C4E",
                      background: "#EAF1E4",
                      borderRadius: 999,
                      padding: "4px 11px",
                    }}
                  >
                    Save {formatINR((product.mrpNum - product.priceNum) * qty)}
                  </span>
                </div>
                <span
                  style={{ fontSize: 14, fontWeight: 500, color: "#9B8F7C" }}
                >
                  {qty > 1 ? `for ${qty} pouches` : "/ single-use pouch"}
                </span>
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
                    type="button"
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
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    style={qtyBtn}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={addToCart}
                  style={{
                    flex: 1,
                    background: added ? "#5E7C4E" : "transparent",
                    color: added ? "#F6F1E9" : "#26221C",
                    border: `1px solid ${added ? "#5E7C4E" : "#26221C"}`,
                    borderRadius: 999,
                    padding: "17px 0",
                    fontFamily: "'Manrope',sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                  }}
                >
                  {added ? "Added ✓" : "Add to Cart"}
                </button>
                <button
                  type="button"
                  onClick={buy}
                  style={{
                    flex: 1,
                    background: "#26221C",
                    color: "#F6F1E9",
                    border: "1px solid #26221C",
                    borderRadius: 999,
                    padding: "17px 0",
                    fontFamily: "'Manrope',sans-serif",
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
                  Buy Now
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
            Two, and only two.
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.img}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="detail-bar-title">
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {product.title} Face Pack
              </div>
              <div style={{ fontSize: 13, color: "#6B6357" }}>
                {product.price} / pouch
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
                type="button"
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
                type="button"
                onClick={() => setQty((q) => q + 1)}
                style={{ ...qtyBtn, padding: "8px 14px", fontSize: 16 }}
              >
                +
              </button>
            </div>
            <button
              type="button"
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
              Buy Now
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

const qtyBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "12px 18px",
  fontSize: 18,
  color: "#26221C",
  fontFamily: "'Manrope',sans-serif",
};
