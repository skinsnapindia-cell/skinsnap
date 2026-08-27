"use client";

import { useEffect } from "react";
import CheckoutForm from "@/components/CheckoutForm";
import { lockScroll, unlockScroll } from "@/lib/lenisControl";

export default function CheckoutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2100,
        background: "rgba(38,34,28,0.5)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "ss-fade 0.25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        data-lenis-prevent
        style={{
          width: "100%",
          maxWidth: 460,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#FCFAF5",
          border: "1px solid #EAE0D0",
          borderRadius: 24,
          padding: 32,
          fontFamily: "var(--font-manrope), sans-serif",
          boxShadow: "0 40px 90px -30px rgba(38,34,28,0.55)",
          animation: "ss-pop 0.3s cubic-bezier(0.16,1,0.3,1)",
          position: "relative",
        }}
      >
        <button aria-label="Close" onClick={onClose} style={closeBtn}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
          </svg>
        </button>

        <CheckoutForm variant="modal" onClose={onClose} />
      </div>
    </div>
  );
}

const closeBtn: React.CSSProperties = {
  position: "absolute",
  top: 18,
  right: 18,
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#9B8F7C",
  padding: 4,
  lineHeight: 0,
  zIndex: 1,
};
