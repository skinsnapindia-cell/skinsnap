"use client";

import { useEffect, useState } from "react";

import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { lockScroll, unlockScroll } from "@/lib/lenisControl";

type Status = "form" | "sending" | "done" | "error";

export default function CheckoutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, subtotal, clearCart, openCart } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [pincode, setPincode] = useState("");
  const [payment, setPayment] = useState<"cod">("cod");
  const [status, setStatus] = useState<Status>("form");
  const [errorMsg, setErrorMsg] = useState("");
  // captured at success time so the receipt survives clearing the cart
  const [receiptEmail, setReceiptEmail] = useState("");
  const [receiptCount, setReceiptCount] = useState(0);

  // reset each time the modal is (re)opened
  useEffect(() => {
    if (open) {
      setStatus("form");
      setErrorMsg("");
    }
  }, [open]);

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

  const count = items.reduce((s, i) => s + i.qty, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          address: { line: address, city, state: stateRegion, pincode },
          payment: "Cash on Delivery",
          items: items.map((i) => ({
            title: i.title,
            qty: i.qty,
            priceEach: formatINR(i.priceNum),
            lineTotal: formatINR(i.priceNum * i.qty),
          })),
          total: formatINR(subtotal),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.error || "Could not send confirmation email.");
      setReceiptEmail(email);
      setReceiptCount(count);
      setStatus("done");
      clearCart();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

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
          fontFamily: "'Manrope',sans-serif",
          boxShadow: "0 40px 90px -30px rgba(38,34,28,0.55)",
          animation: "ss-pop 0.3s cubic-bezier(0.16,1,0.3,1)",
          position: "relative",
        }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={closeBtn}
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
            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
          </svg>
        </button>

        {status === "done" ? (
          <div style={{ textAlign: "center", padding: "12px 4px 4px" }}>
            <div style={successCircle}>
              <svg
                aria-hidden="true"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5E7C4E"
                strokeWidth="2.4"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontWeight: 400,
                fontSize: 32,
                margin: "0 0 12px",
              }}
            >
              Thank you, {name.split(" ")[0] || "friend"}!
            </h3>
            <p
              style={{
                fontSize: 15,
                color: "#6B6357",
                lineHeight: 1.6,
                margin: "0 0 6px",
              }}
            >
              Your order for{" "}
              <strong>
                {receiptCount} {receiptCount === 1 ? "pouch" : "pouches"}
              </strong>{" "}
              has been received.
            </p>
            <p
              style={{
                fontSize: 15,
                color: "#6B6357",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              A confirmation email is on its way to{" "}
              <strong>{receiptEmail}</strong>.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{ ...primaryBtn, marginTop: 26 }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#A15E38")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#26221C")
              }
            >
              Keep Shopping
            </button>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "12px 4px" }}>
            <h3
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontWeight: 400,
                fontSize: 26,
                margin: "0 0 10px",
              }}
            >
              Your cart is empty
            </h3>
            <p style={{ fontSize: 14, color: "#6B6357", margin: "0 0 22px" }}>
              Add a ritual before checking out.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={primaryBtn}
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
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#A15E38",
              }}
            >
              Checkout
            </div>
            <h3
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontWeight: 400,
                fontSize: 28,
                margin: "10px 0 20px",
              }}
            >
              Complete your order
            </h3>

            {/* order summary */}
            <div
              style={{
                background: "#F3ECDF",
                borderRadius: 16,
                padding: "14px 16px",
                marginBottom: 22,
              }}
            >
              {items.map((i) => (
                <div
                  key={i.slug}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    fontSize: 14,
                    padding: "5px 0",
                  }}
                >
                  <span style={{ color: "#4A4238" }}>
                    {i.qty} × {i.title}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {formatINR(i.priceNum * i.qty)}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid #E1D6C4",
                  marginTop: 8,
                  paddingTop: 10,
                  fontWeight: 700,
                }}
              >
                <span>Total</span>
                <span>{formatINR(subtotal)}</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: -10,
                marginBottom: 14,
              }}
            >
              <button
                type="button"
                onClick={openCart}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#A15E38",
                  fontSize: 13,
                  fontFamily: "'Manrope',sans-serif",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Edit cart
              </button>
            </div>

            <form onSubmit={submit}>
              <label htmlFor="checkout-name" style={labelStyle}>
                Full Name
              </label>
              <input
                id="checkout-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
              />

              <div style={twoCol}>
                <div>
                  <label
                    htmlFor="checkout-email"
                    style={{ ...labelStyle, marginTop: 16 }}
                  >
                    Email Address
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    htmlFor="checkout-phone"
                    style={{ ...labelStyle, marginTop: 16 }}
                  >
                    Phone
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9xxxxxxxxx"
                    style={inputStyle}
                  />
                </div>
              </div>

              <label
                htmlFor="checkout-address"
                style={{ ...labelStyle, marginTop: 16 }}
              >
                Shipping Address
              </label>
              <input
                id="checkout-address"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House no., street, area"
                style={inputStyle}
              />

              <div style={twoCol}>
                <div>
                  <label
                    htmlFor="checkout-city"
                    style={{ ...labelStyle, marginTop: 16 }}
                  >
                    City
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    htmlFor="checkout-state"
                    style={{ ...labelStyle, marginTop: 16 }}
                  >
                    State
                  </label>
                  <input
                    id="checkout-state"
                    type="text"
                    required
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    placeholder="State"
                    style={inputStyle}
                  />
                </div>
              </div>

              <label
                htmlFor="checkout-pincode"
                style={{ ...labelStyle, marginTop: 16 }}
              >
                PIN Code
              </label>
              <input
                id="checkout-pincode"
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9]{5,6}"
                title="Enter a 5–6 digit PIN code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 380001"
                style={inputStyle}
              />

              {/* Payment method */}
              <p style={{ ...labelStyle, marginTop: 20 }}>Payment Method</p>
              <label style={codOption}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={payment === "cod"}
                  onChange={() => setPayment("cod")}
                  style={{
                    accentColor: "#A15E38",
                    width: 18,
                    height: 18,
                    margin: 0,
                  }}
                />
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{ fontWeight: 700, fontSize: 14, color: "#26221C" }}
                  >
                    Cash on Delivery (COD)
                  </span>
                  <span style={{ fontSize: 12.5, color: "#6B6357" }}>
                    Pay in cash when your order arrives.
                  </span>
                </span>
              </label>

              {status === "error" && (
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 13,
                    color: "#B4483F",
                    lineHeight: 1.5,
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                style={{
                  ...primaryBtn,
                  marginTop: 22,
                  opacity: status === "sending" ? 0.7 : 1,
                  cursor: status === "sending" ? "default" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (status !== "sending")
                    e.currentTarget.style.background = "#A15E38";
                }}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#26221C")
                }
              >
                {status === "sending"
                  ? "Placing order…"
                  : `Place COD Order · ${formatINR(subtotal)}`}
              </button>
              <p
                style={{
                  fontSize: 11.5,
                  color: "#9B8F7C",
                  textAlign: "center",
                  marginTop: 14,
                  lineHeight: 1.5,
                }}
              >
                We&apos;ll email your order confirmation. Pay in cash on
                delivery.
              </p>
            </form>
          </>
        )}
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
};

const successCircle: React.CSSProperties = {
  width: 66,
  height: 66,
  borderRadius: "50%",
  background: "#EAF1E4",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 22px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#6B6357",
  marginBottom: 8,
};

const twoCol: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const codOption: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  border: "1px solid #D7CCBB",
  background: "#F6F1E9",
  borderRadius: 12,
  padding: "14px 16px",
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #E0D6C6",
  background: "#F6F1E9",
  borderRadius: 12,
  padding: "13px 16px",
  fontFamily: "'Manrope',sans-serif",
  fontSize: 14,
  color: "#26221C",
  outline: "none",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  background: "#26221C",
  color: "#F6F1E9",
  border: "none",
  borderRadius: 999,
  padding: "16px 0",
  fontFamily: "'Manrope',sans-serif",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  transition: "background 0.25s ease",
};
