"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { fbqTrack } from "@/lib/fbpixel";
import { formatINR } from "@/lib/format";
import { isValidPincode } from "@/lib/shipping";
import { INDIA_STATES, normalizeState } from "@/lib/indiaStates";
import AddressAutocomplete, { type SelectedAddress } from "@/components/AddressAutocomplete";

type Status = "form" | "sending" | "done" | "error";

type Shipping =
  | { status: "idle" | "loading" | "unserviceable" | "unknown" }
  | { status: "ok"; rate: number; courier: string; etdDays: number | null };

type PinLookup =
  | { status: "idle" | "loading" | "notfound" | "unavailable" }
  | { status: "ok"; city: string; state: string; areas: string[] };

type Errors = Partial<
  Record<
    "name" | "email" | "phone" | "flat" | "street" | "pincode" | "city" | "state",
    string
  >
>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The full checkout form + order summary + success state, shared by the
 * checkout modal and the /order page so both stay identical.
 */
export default function CheckoutForm({
  variant,
  onClose,
}: {
  variant: "modal" | "page";
  onClose?: () => void;
}) {
  const router = useRouter();
  const { items, subtotal, clearCart, openCart } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // digits only, max 10
  const [flat, setFlat] = useState(""); // flat / house no. / building
  const [street, setStreet] = useState(""); // street / road / colony
  const [pincode, setPincode] = useState("");
  const [area, setArea] = useState(""); // locality, from pincode dropdown
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [payment, setPayment] = useState<"cod">("cod");

  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [shipping, setShipping] = useState<Shipping>({ status: "idle" });
  const [pin, setPin] = useState<PinLookup>({ status: "idle" });

  // captured at success so the receipt survives clearing the cart
  const [receipt, setReceipt] = useState({ email: "", count: 0, orderNumber: "" });

  const clearError = (key: keyof Errors) =>
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  // Meta pixel: InitiateCheckout once when the form mounts with items
  const initiateFired = useRef(false);
  useEffect(() => {
    if (initiateFired.current || items.length === 0) return;
    initiateFired.current = true;
    fbqTrack("InitiateCheckout", {
      content_ids: items.map((i) => i.slug),
      content_type: "product",
      num_items: items.reduce((s, i) => s + i.qty, 0),
      value: subtotal,
      currency: "INR",
    });
  }, [items, subtotal]);

  // PIN code → auto-fill city + state + area list (India Post lookup)
  useEffect(() => {
    if (!isValidPincode(pincode)) {
      setPin({ status: "idle" });
      return;
    }
    let cancelled = false;
    setPin({ status: "loading" });
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pincode/${pincode}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data?.status === "ok") {
          setPin({ status: "ok", city: data.city, state: data.state, areas: data.areas || [] });
          setCity(data.city || "");
          if (data.state && INDIA_STATES.includes(data.state)) setStateRegion(data.state);
          clearError("city");
          clearError("state");
          clearError("pincode");
        } else if (data?.status === "notfound") {
          setPin({ status: "notfound" });
        } else {
          setPin({ status: "unavailable" });
        }
      } catch {
        if (!cancelled) setPin({ status: "unavailable" });
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode]);

  // PIN code → live COD shipping quote (Shiprocket)
  const itemsKey = items.map((i) => `${i.slug}:${i.qty}`).join(",");
  useEffect(() => {
    if (!isValidPincode(pincode) || items.length === 0) {
      setShipping({ status: "idle" });
      return;
    }
    let cancelled = false;
    setShipping({ status: "loading" });
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/shipping-rate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pincode,
            subtotal,
            items: items.map((i) => ({ slug: i.slug, qty: i.qty })),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data?.status === "ok") {
          setShipping({ status: "ok", rate: data.rate, courier: data.courier, etdDays: data.etdDays ?? null });
        } else if (data?.status === "unserviceable") {
          setShipping({ status: "unserviceable" });
        } else {
          setShipping({ status: "unknown" });
        }
      } catch {
        if (!cancelled) setShipping({ status: "unknown" });
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [pincode, itemsKey, subtotal, items]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const shippingRate = shipping.status === "ok" ? shipping.rate : 0;
  const grandTotal = subtotal + shippingRate;

  const goShop = () => {
    if (onClose) onClose();
    else router.push("/products");
  };

  // Fill the rest of the address from a chosen Mappls suggestion. City/State/
  // PIN are only overwritten when the lookup actually returned them, so a
  // partial result never wipes what the customer already had.
  const onAddressSelect = (a: SelectedAddress) => {
    setStreet(a.street);
    if (a.area) setArea(a.area);
    if (a.city) { setCity(a.city); clearError("city"); }
    if (a.state) {
      const st = normalizeState(a.state);
      if (INDIA_STATES.includes(st)) { setStateRegion(st); clearError("state"); }
    }
    if (isValidPincode(a.pincode)) { setPincode(a.pincode); clearError("pincode"); }
    clearError("street");
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (name.trim().length < 5) e.name = "Enter your full name (at least 5 characters).";
    if (!emailRe.test(email.trim())) e.email = "Enter a valid email address.";
    if (phone.length !== 10) e.phone = "Enter a 10-digit mobile number.";
    if (flat.trim().length < 3) e.flat = "Flat / house no. & building is required.";
    if (street.trim().length < 3) e.street = "Street / area is required.";
    if (!isValidPincode(pincode)) e.pincode = "Enter a valid 6-digit PIN code.";
    if (!city.trim()) e.city = "City is required.";
    if (!stateRegion.trim()) e.state = "Select a state.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    setErrorMsg("");

    // full address line for the email + shipment
    const line = [flat.trim(), street.trim(), area.trim()].filter(Boolean).join(", ");

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: `+91${phone}`,
          address: {
            flat: flat.trim(),
            street: street.trim(),
            area: area.trim(),
            line,
            city: city.trim(),
            state: stateRegion.trim(),
            pincode,
          },
          payment: "Cash on Delivery",
          items: items.map((i) => ({
            slug: i.slug,
            title: i.title,
            qty: i.qty,
            priceEachNum: i.priceNum,
            priceEach: formatINR(i.priceNum),
            lineTotal: formatINR(i.priceNum * i.qty),
          })),
          subtotalNum: subtotal,
          shippingNum: shipping.status === "ok" ? shippingRate : null,
          shippingCourier: shipping.status === "ok" ? shipping.courier : null,
          totalNum: grandTotal,
          total: formatINR(grandTotal),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not place your order.");

      fbqTrack(
        "Purchase",
        {
          content_ids: items.map((i) => i.slug),
          content_type: "product",
          num_items: count,
          value: grandTotal,
          currency: "INR",
        },
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`
      );

      setReceipt({ email: email.trim(), count, orderNumber: data?.orderNumber || "" });
      setStatus("done");
      clearCart();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  // ---- success ----
  if (status === "done") {
    return (
      <div style={{ textAlign: "center", padding: "12px 4px 4px" }}>
        <div style={successCircle}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5E7C4E" strokeWidth="2.4">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 style={h3Style}>Thank you, {name.split(" ")[0] || "friend"}!</h3>
        <p style={pMuted}>
          Your pre-order booking for{" "}
          <strong>
            {receipt.count} {receipt.count === 1 ? "pouch" : "pouches"}
          </strong>{" "}
          is confirmed.
        </p>
        {receipt.orderNumber && (
          <p style={{ ...pMuted, margin: "8px 0 0" }}>
            Reference: <strong>{receipt.orderNumber}</strong>
          </p>
        )}
        <p style={{ ...pMuted, margin: "8px 0 0" }}>
          A confirmation is on its way to <strong>{receipt.email}</strong>. We&apos;ll notify you
          before dispatch — shipping charges may apply.
        </p>
        <button
          onClick={goShop}
          style={{ ...primaryBtn, marginTop: 26 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#A15E38")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#26221C")}
        >
          Keep Shopping
        </button>
      </div>
    );
  }

  // ---- empty cart ----
  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "12px 4px" }}>
        <h3 style={{ ...h3Style, fontSize: 26 }}>Your cart is empty</h3>
        <p style={{ fontSize: 14, color: "#6B6357", margin: "0 0 22px" }}>
          Add a ritual before checking out.
        </p>
        <button
          onClick={goShop}
          style={primaryBtn}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#A15E38")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#26221C")}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "#A15E38" }}>
        Checkout
      </div>
      <h3 style={{ ...h3Style, textAlign: "left", fontSize: 28, margin: "10px 0 20px" }}>
        Complete your order
      </h3>

      {/* order summary */}
      <div style={{ background: "#F3ECDF", borderRadius: 16, padding: "14px 16px", marginBottom: 8 }}>
        {items.map((i) => (
          <div key={i.slug} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 14, padding: "5px 0" }}>
            <span style={{ color: "#4A4238" }}>
              {i.qty} × {i.title}
            </span>
            <span style={{ fontWeight: 600 }}>{formatINR(i.priceNum * i.qty)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E1D6C4", marginTop: 8, paddingTop: 10, fontSize: 13.5, color: "#6B6357" }}>
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingTop: 6, fontSize: 13.5, color: "#6B6357" }}>
          <span>Shipping</span>
          <span style={{ textAlign: "right" }}>
            {shipping.status === "ok" ? (
              <span style={{ fontWeight: 600, color: "#26221C" }}>{formatINR(shipping.rate)}</span>
            ) : shipping.status === "loading" ? (
              "Calculating…"
            ) : shipping.status === "unserviceable" ? (
              <span style={{ color: "#B4483F" }}>Not serviceable</span>
            ) : shipping.status === "idle" ? (
              "Enter PIN code"
            ) : (
              "Charges may apply"
            )}
          </span>
        </div>
        {shipping.status === "ok" && (
          <div style={{ fontSize: 11.5, color: "#9B8F7C", textAlign: "right", marginTop: 2 }}>
            {shipping.courier}
            {shipping.etdDays ? ` · approx. ${shipping.etdDays} days` : ""}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E1D6C4", marginTop: 8, paddingTop: 10, fontWeight: 700 }}>
          <span>Total</span>
          <span>{formatINR(grandTotal)}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button onClick={openCart} style={linkBtn}>Edit cart</button>
      </div>

      <form onSubmit={submit} noValidate>
        {/* Full name */}
        <Field label="Full Name" error={errors.name}>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError("name"); }}
            placeholder="Your full name"
            style={inputStyle}
          />
        </Field>

        <div style={twoCol}>
          <Field label="Email Address" error={errors.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
              placeholder="you@email.com"
              style={inputStyle}
            />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <div style={{ display: "flex", border: `1px solid ${errors.phone ? "#D98A82" : "#E0D6C6"}`, borderRadius: 12, overflow: "hidden", background: "#F6F1E9" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 11px", borderRight: "1px solid #E0D6C6", fontSize: 14, color: "#26221C", whiteSpace: "nowrap" }}>
                🇮🇳 +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); clearError("phone"); }}
                placeholder="10-digit number"
                style={{ ...inputStyle, border: "none", background: "transparent", flex: 1, minWidth: 0 }}
              />
            </div>
          </Field>
        </div>

        {/* Flat / building (new field) */}
        <Field label="Flat / House No. & Building" error={errors.flat}>
          <input
            type="text"
            value={flat}
            onChange={(e) => { setFlat(e.target.value); clearError("flat"); }}
            placeholder="e.g. B-402, Lotus Residency"
            style={inputStyle}
          />
        </Field>

        {/* Street / area — Mappls autocomplete + map preview (falls back to a
            plain text input when Mappls isn't configured) */}
        <Field label="Street / Road / Colony" error={errors.street}>
          <AddressAutocomplete
            value={street}
            onChange={(v) => { setStreet(v); clearError("street"); }}
            onSelect={onAddressSelect}
            error={errors.street}
          />
        </Field>

        {/* PIN code (drives autofill) */}
        <Field
          label="PIN Code"
          error={errors.pincode}
          hint={
            pin.status === "loading"
              ? "Looking up…"
              : pin.status === "ok"
                ? `✓ ${pin.city}, ${pin.state}`
                : pin.status === "notfound"
                  ? "PIN code not found — enter city & state manually."
                  : undefined
          }
          hintColor={pin.status === "ok" ? "#5E7C4E" : "#9B8F7C"}
        >
          <input
            type="text"
            inputMode="numeric"
            value={pincode}
            onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "").slice(0, 6)); clearError("pincode"); }}
            placeholder="e.g. 380001"
            style={inputStyle}
          />
        </Field>

        {/* Area / locality — populated from PIN code */}
        {pin.status === "ok" && pin.areas.length > 0 && (
          <Field label="Area / Locality">
            <select value={area} onChange={(e) => setArea(e.target.value)} style={{ ...inputStyle, appearance: "auto" }}>
              <option value="">Select your area (optional)</option>
              {pin.areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </Field>
        )}

        <div style={twoCol}>
          <Field label="City" error={errors.city}>
            <input
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); clearError("city"); }}
              placeholder="City"
              style={inputStyle}
            />
          </Field>
          <Field label="State" error={errors.state}>
            <select
              value={stateRegion}
              onChange={(e) => { setStateRegion(e.target.value); clearError("state"); }}
              style={{ ...inputStyle, appearance: "auto", color: stateRegion ? "#26221C" : "#A99E8B" }}
            >
              <option value="">Select state</option>
              {INDIA_STATES.map((s) => (
                <option key={s} value={s} style={{ color: "#26221C" }}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Payment method */}
        <label style={{ ...labelStyle, marginTop: 20 }}>Payment Method</label>
        <label style={codOption}>
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={payment === "cod"}
            onChange={() => setPayment("cod")}
            style={{ accentColor: "#A15E38", width: 18, height: 18, margin: 0 }}
          />
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#26221C" }}>Cash on Delivery (COD)</span>
            <span style={{ fontSize: 12.5, color: "#6B6357" }}>Pay in cash on delivery. Shipping charges may apply.</span>
          </span>
        </label>

        {status === "error" && (
          <div style={{ marginTop: 14, fontSize: 13, color: "#B4483F", lineHeight: 1.5 }}>{errorMsg}</div>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          style={{ ...primaryBtn, marginTop: 22, opacity: status === "sending" ? 0.7 : 1, cursor: status === "sending" ? "default" : "pointer" }}
          onMouseEnter={(e) => { if (status !== "sending") e.currentTarget.style.background = "#A15E38"; }}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#26221C")}
        >
          {status === "sending" ? "Placing Pre-order…" : `Complete Pre-Order · ${formatINR(grandTotal)}`}
        </button>
        <p style={{ fontSize: 11.5, color: "#9B8F7C", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
          We&apos;ll email your pre-order booking confirmation.{" "}
          {shipping.status === "ok" ? "Pay the total above in cash on delivery." : "Cash on delivery — shipping charges may apply."}
        </p>
      </form>
    </>
  );
}

function Field({
  label,
  error,
  hint,
  hintColor = "#9B8F7C",
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  hintColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error ? (
        <div style={{ fontSize: 12, color: "#B4483F", marginTop: 5 }}>{error}</div>
      ) : hint ? (
        <div style={{ fontSize: 12, color: hintColor, marginTop: 5 }}>{hint}</div>
      ) : null}
    </div>
  );
}

const h3Style: React.CSSProperties = {
  fontFamily: "var(--font-instrument-serif), serif",
  fontWeight: 400,
  fontSize: 32,
  margin: "0 0 12px",
};

const pMuted: React.CSSProperties = { fontSize: 15, color: "#6B6357", lineHeight: 1.6, margin: 0 };

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

const twoCol: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };

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
  fontFamily: "var(--font-manrope), sans-serif",
  fontSize: 14,
  color: "#26221C",
  outline: "none",
  boxSizing: "border-box",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  background: "#26221C",
  color: "#F6F1E9",
  border: "none",
  borderRadius: 999,
  padding: "16px 0",
  fontFamily: "var(--font-manrope), sans-serif",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  transition: "background 0.25s ease",
};

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#A15E38",
  fontSize: 13,
  fontFamily: "var(--font-manrope), sans-serif",
  textDecoration: "underline",
  padding: 0,
};
