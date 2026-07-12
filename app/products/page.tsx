"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import ProductPouch from "@/components/ProductPouch";
import { products } from "@/lib/products";
import { useReveals } from "@/lib/useReveals";

const filters = ["All", "Brightening", "Soothing", "Glow", "Essentials"];

export default function ProductsPage() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("All");
  useReveals(scopeRef);

  return (
    <div className="wrap" ref={scopeRef}>
      <Nav active="products" />

      {/* HEADER */}
      <section
        className="section-pad"
        style={{
          padding: "180px 48px 70px",
          textAlign: "center",
          background:
            "radial-gradient(120% 100% at 50% 0%, #FBF6EF 0%, #EFE4D4 100%)",
        }}
      >
        <div
          data-hero
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#A15E38",
          }}
        >
          The Collection
        </div>
        <h1
          data-hero
          className="section-title h-xl"
          style={{ fontSize: 78, lineHeight: 1.02, margin: "20px 0 0" }}
        >
          Four face packs.
          <br />
          One innovation.
        </h1>
        <p
          data-hero
          style={{
            fontSize: 17,
            color: "#5A5348",
            maxWidth: 560,
            margin: "24px auto 0",
            lineHeight: 1.6,
          }}
        >
          Every SkinSnap shares the same dual-chamber frangible pouch. Only the
          ritual inside changes.
        </p>
        {/* <div
          data-hero
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 40,
          }}
        >
          {filters.map((f) => {
            const on = f === active;
            return (
              <button type="button"
                key={f}
                onClick={() => setActive(f)}
                style={{
                  background: on ? "#26221C" : "rgba(255,255,255,0.6)",
                  color: on ? "#F6F1E9" : "#6B6357",
                  border: on ? "none" : "1px solid #D7CCBB",
                  borderRadius: 999,
                  padding: "9px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Manrope',sans-serif",
                }}
              >
                {f}
              </button>
            );
          })}
        </div> */}
      </section>

      {/* GRID */}
      <section
        className="section-pad"
        style={{ padding: "40px 48px 130px", background: "#F6F1E9" }}
      >
        <div
          className="grid-2"
          style={{ maxWidth: 820, margin: "0 auto", gap: 30 }}
        >
          {products.map((p) => (
            <div data-reveal key={p.slug} style={{ height: "100%" }}>
              <ProductPouch product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section
        className="section-pad"
        style={{
          padding: "110px 48px",
          background: "#26221C",
          color: "#F6F1E9",
          textAlign: "center",
        }}
      >
        <div data-reveal style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2
            className="section-title h-lg"
            style={{ fontSize: 46, margin: "0 0 18px" }}
          >
            Not sure where to start?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#C9C1B3",
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            See exactly how the dual-chamber pouch activates — then pick the
            ritual for your skin.
          </p>
          <Link
            href="/how-it-works"
            style={{
              display: "inline-block",
              background: "#E8CBB2",
              color: "#26221C",
              borderRadius: 999,
              padding: "16px 38px",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F6F1E9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#E8CBB2")}
          >
            How It Works →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
