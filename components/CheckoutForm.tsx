"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { fbqTrack } from "@/lib/fbpixel";
import { formatINR, formatUnitINR } from "@/lib/format";
import { lineTotal, lineUnitPrice, lineSavings } from "@/lib/pricing";
import { productDisplayName } from "@/lib/products";
import { isValidPincode } from "@/lib/shipping";
import { INDIA_STATES, normalizeState } from "@/lib/indiaStates";
import AddressAutocomplete, { type SelectedAddress } from "@/components/AddressAutocomplete";

type Status = "form" | "sending" | "done" | "error";

type Shipping =
  | { status: "idle" | "loading" | "unserviceable" | "unknown" }
  | { status: "ok"; rate: number; freight: number; codCharge: number; courier: string; etdDays: number | null };

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

// Card + section-heading styling for the two-column page layout.
const panelStyle: React.CSSProperties = {
  background: "#FCFAF5",
  border: "1px solid #EAE0D0",
  borderRadius: 20,
  padding: "24px 26px",
};
const panelTitle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#A15E38",
  marginBottom: 16,
};

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
  const [payment, setPayment] = useState<"cod" | "prepaid">("prepaid");

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
          setShipping({
            status: "ok",
            rate: data.rate,
            freight: data.freight ?? data.rate,
            codCharge: data.codCharge ?? 0,
            courier: data.courier,
            etdDays: data.etdDays ?? null,
          });
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
  const savings = items.reduce((s, i) => s + lineSavings(i, i.qty), 0);
  const isPrepaid = payment === "prepaid";
  // Live COD-inclusive courier quote, split into freight + COD collection fee.
  // Prepaid orders ship free, so the customer only pays this when choosing COD.
  const codShippingRate = shipping.status === "ok" ? shipping.rate : 0;
  const codFreight = shipping.status === "ok" ? shipping.freight : 0;
  const codFee = shipping.status === "ok" ? shipping.codCharge : 0;
  const shippingRate = isPrepaid ? 0 : codShippingRate;
  const grandTotal = subtotal + shippingRate;
  // Everything the customer saves on this order: the quantity discount, plus
  // the waived COD shipping when they pay online (prepaid).
  const totalYouSave = savings + (isPrepaid ? codShippingRate : 0);

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

  // Inject the Razorpay Checkout SDK once; resolves when window.Razorpay exists.
  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  // Place the order on our backend (saves + emails). For prepaid, passes the
  // verified Razorpay payment so the server can validate the signature.
  const placeOrder = async (razorpay?: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) => {
    const line = [flat.trim(), street.trim(), area.trim()].filter(Boolean).join(", ");
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
        payment: isPrepaid ? "Prepaid (Pay Online)" : "Cash on Delivery",
        // Prepaid ships free; the server enforces this (never trusts the client).
        prepaid: isPrepaid,
        razorpay: razorpay ?? null,
        // Only slug + qty are authoritative — the server recomputes every price
        // from the catalog. title is sent for logging/fallback only.
        items: items.map((i) => ({ slug: i.slug, title: i.title, qty: i.qty })),
        subtotalNum: subtotal,
        // the raw COD courier quote; server zeroes it for prepaid orders
        shippingNum: shipping.status === "ok" ? codShippingRate : null,
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
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    setErrorMsg("");

    // Cash on Delivery — place the order directly, no payment step.
    if (!isPrepaid) {
      try {
        await placeOrder();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
        setStatus("error");
      }
      return;
    }

    // Prepaid — create a Razorpay order, collect payment, then place the order.
    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ slug: i.slug, qty: i.qty })) }),
      });
      const order = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok || !order?.orderId) {
        throw new Error(order?.error || "Could not start the payment.");
      }

      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        throw new Error("Couldn't load the payment window. Check your connection and try again.");
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "SkinSnap",
        description: "Freshly mixed natural face packs",
        prefill: { name: name.trim(), email: email.trim(), contact: phone },
        theme: { color: "#26221C" },
        handler: async (resp: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setStatus("sending");
          try {
            await placeOrder({
              orderId: resp.razorpay_order_id,
              paymentId: resp.razorpay_payment_id,
              signature: resp.razorpay_signature,
            });
          } catch (err) {
            setErrorMsg(
              err instanceof Error
                ? err.message
                : "Payment succeeded but we couldn't confirm your order. Please contact support."
            );
            setStatus("error");
          }
        },
        modal: {
          // customer closed the payment window without paying
          ondismiss: () => setStatus("form"),
        },
      } as Record<string, unknown>);
      rzp.on("payment.failed", () => {
        setErrorMsg("Payment failed or was cancelled. Please try again.");
        setStatus("error");
      });
      rzp.open();
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
            {receipt.count} {receipt.count === 1 ? "jar" : "jars"}
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
          Add a jar before checking out.
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

  const isPage = variant === "page";

  const productList = (
    <div>
      {items.map((i) => {
        const sav = lineSavings(i, i.qty);
        return (
          <div key={i.slug} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid #EFE7D9" }}>
            <div style={{ position: "relative", width: 60, height: 60, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "#F3ECDF" }}>
              <Image src={i.img} alt={i.title} fill sizes="60px" style={{ objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: "#26221C" }}>{productDisplayName(i)}</div>
              <div style={{ fontSize: 12.5, color: "#9B8F7C", marginTop: 3 }}>
                Qty {i.qty} · {formatUnitINR(lineUnitPrice(i, i.qty))} each
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#26221C" }}>{formatINR(lineTotal(i, i.qty))}</div>
              {sav > 0 && (
                <div style={{ fontSize: 14, color: "#5E7C4E", fontWeight: 800 }}>Save {formatINR(sav)}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const pricing = (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "#6B6357" }}>
        <span>Subtotal</span>
        <span>{formatINR(subtotal)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingTop: 6, fontSize: 13.5, color: "#6B6357" }}>
        <span>Shipping</span>
        <span style={{ textAlign: "right" }}>
          {isPrepaid ? (
            <span>
              {codShippingRate > 0 && (
                <span style={{ textDecoration: "line-through", color: "#C3B8A5", marginRight: 6 }}>
                  {formatINR(codShippingRate)}
                </span>
              )}
              <span style={{ fontWeight: 700, color: "#5E7C4E" }}>FREE</span>
            </span>
          ) : shipping.status === "ok" ? (
            <span style={{ fontWeight: 600, color: "#26221C" }}>{formatINR(codFreight)}</span>
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
      {!isPrepaid && shipping.status === "ok" && codFee > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingTop: 6, fontSize: 13.5, color: "#6B6357" }}>
          <span>COD charge</span>
          <span style={{ fontWeight: 600, color: "#26221C" }}>{formatINR(codFee)}</span>
        </div>
      )}
      {isPrepaid ? (
        codShippingRate > 0 && (
          <div style={{ fontSize: 13, color: "#5E7C4E", textAlign: "right", marginTop: 2, fontWeight: 800 }}>
            You save {formatINR(codShippingRate)} with online payment
          </div>
        )
      ) : shipping.status === "ok" ? (
        <div style={{ fontSize: 11.5, color: "#9B8F7C", textAlign: "right", marginTop: 2 }}>
          {shipping.courier}
          {shipping.etdDays ? ` · approx. ${shipping.etdDays} days` : ""}
        </div>
      ) : null}
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E1D6C4", marginTop: 10, paddingTop: 12, fontWeight: 700, fontSize: 16 }}>
        <span>Total</span>
        <span>{formatINR(grandTotal)}</span>
      </div>
      {totalYouSave > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, background: "#EAF1E4", borderRadius: 10, padding: "11px 14px", fontSize: 17, fontWeight: 800, color: "#5E7C4E" }}>
          <span>🎉 You save</span>
          <span>{formatINR(totalYouSave)}</span>
        </div>
      )}
    </div>
  );

  const contactAndAddress = (
    <>
      <Field label="Full Name" error={errors.name}>
        <input type="text" value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} placeholder="Your full name" style={inputStyle} />
      </Field>
      <div style={twoCol}>
        <Field label="Email Address" error={errors.email}>
          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} placeholder="you@email.com" style={inputStyle} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <div style={{ display: "flex", border: `1px solid ${errors.phone ? "#D98A82" : "#E0D6C6"}`, borderRadius: 12, overflow: "hidden", background: "#F6F1E9" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 11px", borderRight: "1px solid #E0D6C6", fontSize: 14, color: "#26221C", whiteSpace: "nowrap" }}>🇮🇳 +91</span>
            <input type="tel" inputMode="numeric" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); clearError("phone"); }} placeholder="10-digit number" style={{ ...inputStyle, border: "none", background: "transparent", flex: 1, minWidth: 0 }} />
          </div>
        </Field>
      </div>
      <Field label="Flat / House No. & Building" error={errors.flat}>
        <input type="text" value={flat} onChange={(e) => { setFlat(e.target.value); clearError("flat"); }} placeholder="e.g. B-402, Lotus Residency" style={inputStyle} />
      </Field>
      <Field label="Street / Road / Colony" error={errors.street}>
        <AddressAutocomplete value={street} onChange={(v) => { setStreet(v); clearError("street"); }} onSelect={onAddressSelect} error={errors.street} />
      </Field>
      <Field label="PIN Code" error={errors.pincode} hint={pin.status === "loading" ? "Looking up…" : pin.status === "ok" ? `✓ ${pin.city}, ${pin.state}` : pin.status === "notfound" ? "PIN code not found — enter city & state manually." : undefined} hintColor={pin.status === "ok" ? "#5E7C4E" : "#9B8F7C"}>
        <input type="text" inputMode="numeric" value={pincode} onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "").slice(0, 6)); clearError("pincode"); }} placeholder="e.g. 380001" style={inputStyle} />
      </Field>
      {pin.status === "ok" && pin.areas.length > 0 && (
        <Field label="Area / Locality">
          <select value={area} onChange={(e) => setArea(e.target.value)} style={{ ...inputStyle, appearance: "auto" }}>
            <option value="">Select your area (optional)</option>
            {pin.areas.map((a) => (<option key={a} value={a}>{a}</option>))}
          </select>
        </Field>
      )}
      <div style={twoCol}>
        <Field label="City" error={errors.city}>
          <input type="text" value={city} onChange={(e) => { setCity(e.target.value); clearError("city"); }} placeholder="City" style={inputStyle} />
        </Field>
        <Field label="State" error={errors.state}>
          <select value={stateRegion} onChange={(e) => { setStateRegion(e.target.value); clearError("state"); }} style={{ ...inputStyle, appearance: "auto", color: stateRegion ? "#26221C" : "#A99E8B" }}>
            <option value="">Select state</option>
            {INDIA_STATES.map((s) => (<option key={s} value={s} style={{ color: "#26221C" }}>{s}</option>))}
          </select>
        </Field>
      </div>
    </>
  );

  const paymentBlock = (
    <>
      <label style={{ ...labelStyle, marginTop: 0 }}>Payment Method</label>
      <label style={{ ...codOption, marginBottom: 10, borderColor: isPrepaid ? "#A15E38" : "#D7CCBB", background: isPrepaid ? "#FBF3EA" : "#F6F1E9" }}>
        <input type="radio" name="payment" value="prepaid" checked={isPrepaid} onChange={() => setPayment("prepaid")} style={{ accentColor: "#A15E38", width: 18, height: 18, margin: 0 }} />
        <span style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#26221C" }}>Pay Online (Prepaid)</span>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#F6F1E9", background: "#5E7C4E", borderRadius: 999, padding: "3px 8px" }}>Free Shipping</span>
          </span>
          <span style={{ fontSize: 12.5, color: "#6B6357" }}>Pay now and shipping is on us{codShippingRate > 0 ? ` — you save ${formatINR(codShippingRate)}` : ""}.</span>
        </span>
      </label>
      <label style={{ ...codOption, borderColor: !isPrepaid ? "#A15E38" : "#D7CCBB", background: !isPrepaid ? "#FBF3EA" : "#F6F1E9" }}>
        <input type="radio" name="payment" value="cod" checked={!isPrepaid} onChange={() => setPayment("cod")} style={{ accentColor: "#A15E38", width: 18, height: 18, margin: 0 }} />
        <span style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#26221C" }}>Cash on Delivery (COD)</span>
          <span style={{ fontSize: 12.5, color: "#6B6357" }}>{codShippingRate > 0 ? `Pay on delivery — ${formatINR(codShippingRate)} shipping is added and collected with your order.` : "Pay on delivery — shipping charges apply and are collected with your order."}</span>
        </span>
      </label>
    </>
  );

  const submitBlock = (
    <>
      {status === "error" && (
        <div style={{ marginTop: 14, fontSize: 13, color: "#B4483F", lineHeight: 1.5 }}>{errorMsg}</div>
      )}
      <button type="submit" disabled={status === "sending"} style={{ ...primaryBtn, marginTop: 16, opacity: status === "sending" ? 0.7 : 1, cursor: status === "sending" ? "default" : "pointer" }} onMouseEnter={(e) => { if (status !== "sending") e.currentTarget.style.background = "#A15E38"; }} onMouseLeave={(e) => (e.currentTarget.style.background = "#26221C")}>
        {status === "sending"
          ? isPrepaid
            ? "Opening payment…"
            : "Placing order…"
          : isPrepaid
            ? `Pay ${formatINR(grandTotal)} securely`
            : `Place Order · ${formatINR(grandTotal)}`}
      </button>
      <p style={{ fontSize: 11.5, color: "#9B8F7C", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
        We&apos;ll email your order confirmation.{" "}
        {isPrepaid
          ? "You'll pay securely via Razorpay (UPI, cards, netbanking) — prepaid orders ship free."
          : "Pay the total above in cash on delivery, including shipping."}
      </p>
    </>
  );

  return (
    <form onSubmit={submit} noValidate>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "#A15E38" }}>
        Checkout
      </div>
      <h3 style={{ ...h3Style, textAlign: "left", fontSize: isPage ? 34 : 28, margin: "10px 0 24px" }}>
        Complete your order
      </h3>

      {isPage ? (
        <div className="order-grid">
          <div>
            <div style={panelStyle}>
              <div style={panelTitle}>Your order · {count} {count === 1 ? "item" : "items"}</div>
              {productList}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <button type="button" onClick={openCart} style={linkBtn}>Edit cart</button>
              </div>
            </div>
            <div style={{ ...panelStyle, marginTop: 24 }}>
              <div style={panelTitle}>Shipping details</div>
              {contactAndAddress}
            </div>
          </div>
          <aside className="order-summary-rail">
            <div style={panelStyle}>
              <div style={panelTitle}>Order summary</div>
              {pricing}
            </div>
            <div style={{ ...panelStyle, marginTop: 20 }}>{paymentBlock}</div>
            <div style={{ marginTop: 20 }}>{submitBlock}</div>
          </aside>
        </div>
      ) : (
        <>
          <div style={{ background: "#F3ECDF", borderRadius: 16, padding: "6px 16px 16px", marginBottom: 8 }}>
            {productList}
            <div style={{ marginTop: 12 }}>{pricing}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <button type="button" onClick={openCart} style={linkBtn}>Edit cart</button>
          </div>
          {contactAndAddress}
          <div style={{ marginTop: 20 }}>{paymentBlock}</div>
          {submitBlock}
        </>
      )}
    </form>
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
