"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/context/CartContext";
import { lockScroll, unlockScroll } from "@/lib/lenisControl";

type Active = "home" | "products" | "how" | "contact";

const links: { label: string; href: string; key: Active }[] = [
  { label: "Home", href: "/", key: "home" },
  { label: "Products", href: "/products", key: "products" },
  { label: "How It Works", href: "/how-it-works", key: "how" },
  { label: "Contact", href: "/contact", key: "contact" },
];

/** Height of the promo banner that sits above the nav bar. */
const BANNER_H = 40;

export default function Nav({ active }: { active: Active }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // freeze page scroll (incl. Lenis) while the mobile menu is open
  useEffect(() => {
    if (!menuOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [menuOpen]);

  const color = (k: Active) => (active === k ? "#A15E38" : "#26221C");

  return (
    <>
      {/* PROMO BANNER — sits above the nav on every page */}
      <Link
        href="/product/combo-pack"
        aria-label="Offer: 4-Pack Combo for just ₹99"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          height: BANNER_H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: "linear-gradient(90deg,#A15E38 0%,#B97C79 100%)",
          color: "#F6F1E9",
          textDecoration: "none",
          fontSize: "clamp(11px,3vw,13.5px)",
          fontWeight: 600,
          letterSpacing: "0.01em",
          padding: "0 16px",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        <span aria-hidden="true">🎁</span>
        <span>
          4-Pack Combo Offer — all 4 rituals for just{" "}
          <strong style={{ fontWeight: 800, color: "#FFF3E4" }}>₹99</strong>
        </span>
        <span aria-hidden="true" style={{ fontWeight: 800 }}>
          Shop&nbsp;→
        </span>
      </Link>

      <nav
        className="nav-pad"
        style={{
          position: "fixed",
          top: BANNER_H,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 48px",
          transition: "background 0.4s ease, box-shadow 0.4s ease",
          background: scrolled
            ? "rgba(246,241,233,0.82)"
            : "rgba(246,241,233,0)",
          boxShadow: scrolled ? "0 1px 0 rgba(38,34,28,0.08)" : "none",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 26,
            letterSpacing: "0.04em",
            color: "#26221C",
            textDecoration: "none",
          }}
        >
          SKINSNAP
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 38 }}>
          <div className="nav-links" style={{ alignItems: "center", gap: 32 }}>
            {links.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  color: color(l.key),
                  textDecoration: "none",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <button
              type="button"
              aria-label={`Cart, ${cartCount} items`}
              onClick={openCart}
              style={{ ...iconBtn, position: "relative" }}
            >
              <svg
                aria-hidden="true"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
                <path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" />
              </svg>
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -6,
                    background: "#B97C79",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    minWidth: 15,
                    height: 15,
                    padding: "0 3px",
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="nav-burger"
              onClick={() => setMenuOpen(true)}
              style={burgerBtn}
            >
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <line x1="4" y1="8" x2="20" y2="8" strokeLinecap="round" />
                <line x1="4" y1="16" x2="20" y2="16" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen mobile menu — rendered OUTSIDE <nav> so its
          position:fixed resolves against the viewport, not the
          backdrop-filtered nav bar (which would otherwise become its
          containing block and clip it to the top strip). */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#F6F1E9",
            zIndex: 1001,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setMenuOpen(false)}
            style={{
              position: "absolute",
              top: 24,
              right: 44,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#26221C",
            }}
          >
            <svg
              aria-hidden="true"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
            </svg>
          </button>
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 40,
                color: "#26221C",
                textDecoration: "none",
                padding: 10,
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <style jsx global>{`
        .nav-links {
          display: flex;
        }
        .nav-burger {
          display: none;
        }
        @media (max-width: 760px) {
          .nav-links {
            display: none;
          }
          .nav-burger {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}

const iconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 4,
  display: "flex",
  color: "#26221C",
};

// display is intentionally omitted so the .nav-burger CSS class controls
// visibility (hidden on desktop, shown under 760px).
const burgerBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 4,
  alignItems: "center",
  justifyContent: "center",
  color: "#26221C",
};
