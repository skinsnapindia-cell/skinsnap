"use client";

import { useEffect } from "react";

import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { lockScroll, unlockScroll } from "@/lib/lenisControl";

export default function CartModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, subtotal, cartCount, setQty, removeItem, openCheckout } =
    useCart();

  // freeze page scroll (incl. Lenis) + close on Escape while open
  useEffect(() => {
    if (!open) return;
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close is a convenience; Esc + close button cover keyboard users
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(38,34,28,0.5)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "flex-end",
        animation: "ss-fade 0.25s ease",
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        data-lenis-prevent
        style={{
          width: "100%",
          maxWidth: 440,
          height: "100%",
          background: "#FCFAF5",
          fontFamily: "'Manrope',sans-serif",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-30px 0 90px -30px rgba(38,34,28,0.5)",
          animation: "ss-slide-in 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 28px",
            borderBottom: "1px solid #EAE0D0",
          }}
        >
          <div>
            <div
              style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26 }}
            >
              Your Cart
            </div>
            <div style={{ fontSize: 13, color: "#9B8F7C", marginTop: 2 }}>
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close cart"
            onClick={onClose}
            style={closeBtn}
          >
            <svg
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* body */}
        {items.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 32,
              color: "#6B6357",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#F3ECDF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
                color: "#A15E38",
              }}
            >
              <svg
                aria-hidden="true"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
                <path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" />
              </svg>
            </div>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 22,
                color: "#26221C",
                marginBottom: 6,
              }}
            >
              Your cart is empty
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              Add a freshly activated ritual to get started.
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                ...primaryBtn,
                width: "auto",
                padding: "13px 28px",
                marginTop: 22,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#A15E38")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#26221C")
              }
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 28px" }}>
              {items.map((item) => (
                <div
                  key={item.slug}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "20px 0",
                    borderBottom: "1px solid #EFE7D9",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    alt={item.title}
                    style={{
                      width: 72,
                      height: 72,
                      objectFit: "cover",
                      borderRadius: 12,
                      flexShrink: 0,
                      background: "#F3ECDF",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 15 }}>
                        {item.title} Face Pack
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.title}`}
                        onClick={() => removeItem(item.slug)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#B0A594",
                          padding: 0,
                          lineHeight: 0,
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          aria-hidden="true"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        >
                          <line
                            x1="6"
                            y1="6"
                            x2="18"
                            y2="18"
                            strokeLinecap="round"
                          />
                          <line
                            x1="18"
                            y1="6"
                            x2="6"
                            y2="18"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                    <div
                      style={{ fontSize: 13, color: "#9B8F7C", marginTop: 2 }}
                    >
                      {formatINR(item.priceNum)} each
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 12,
                      }}
                    >
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
                          aria-label="Decrease quantity"
                          onClick={() => setQty(item.slug, item.qty - 1)}
                          style={stepBtn}
                        >
                          −
                        </button>
                        <span
                          style={{
                            minWidth: 28,
                            textAlign: "center",
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQty(item.slug, item.qty + 1)}
                          style={stepBtn}
                        >
                          +
                        </button>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>
                        {formatINR(item.priceNum * item.qty)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* footer */}
            <div
              style={{ borderTop: "1px solid #EAE0D0", padding: "22px 28px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    color: "#6B6357",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                  }}
                >
                  Subtotal
                </span>
                <span style={{ fontSize: 24, fontWeight: 700 }}>
                  {formatINR(subtotal)}
                </span>
              </div>
              <button
                type="button"
                onClick={openCheckout}
                style={primaryBtn}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#A15E38")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#26221C")
                }
              >
                Checkout · {formatINR(subtotal)}
              </button>
              <div
                style={{
                  textAlign: "center",
                  marginTop: 12,
                  fontSize: 12,
                  color: "#6B6357",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
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
                Cash on Delivery available
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6B6357",
                  fontSize: 13,
                  fontFamily: "'Manrope',sans-serif",
                  marginTop: 10,
                  textDecoration: "underline",
                }}
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>

      <style jsx global>{`
        @keyframes ss-slide-in {
          from {
            transform: translateX(30px);
            opacity: 0.4;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

const closeBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#6B6357",
  padding: 4,
  lineHeight: 0,
};

const stepBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "6px 12px",
  fontSize: 15,
  color: "#26221C",
  fontFamily: "'Manrope',sans-serif",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  background: "#26221C",
  color: "#F6F1E9",
  border: "none",
  borderRadius: 999,
  padding: "15px 0",
  fontFamily: "'Manrope',sans-serif",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  transition: "background 0.25s ease",
};
