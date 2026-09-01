"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { formatINR } from "@/lib/format";
import { STATUS_FLOW, statusMeta, statusStep, isTerminal, isRefunded } from "@/lib/orderStatus";

type TrackedItem = { title: string; qty: number };
type Tracked = {
  orderNumber: string;
  placedAt: string;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  courier: string | null;
  awb: string | null;
  items: TrackedItem[];
  total: number;
  city: string | null;
  state: string | null;
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function TrackPage() {
  const params = useSearchParams();
  const [ref, setRef] = useState(params.get("ref") || "");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [order, setOrder] = useState<Tracked | null>(null);
  const [error, setError] = useState("");

  const track = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = ref.trim();
    if (!q) return;
    setStatus("loading");
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(q)}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not find that order.");
        setStatus("error");
        return;
      }
      setOrder(data.order);
      setStatus("done");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="wrap">
      <Nav active="track" />

      <section
        className="section-pad"
        style={{
          padding: "170px 24px 90px",
          minHeight: "70vh",
          background: "radial-gradient(120% 100% at 50% 0%, #FBF6EF 0%, #EFE4D4 100%)",
        }}
      >
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <div style={eyebrow}>Order Tracking</div>
            <h1 style={h1}>Track your order</h1>
            <p style={{ fontSize: 16, color: "#6B6357", margin: "14px auto 0", maxWidth: 460, lineHeight: 1.6 }}>
              Enter the order reference number from your confirmation email
              (e.g. <strong>SS-260901-A3F9</strong>).
            </p>
          </div>

          <form onSubmit={track} style={{ display: "flex", gap: 10, marginTop: 30, flexWrap: "wrap" }}>
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="Order reference number"
              style={{ ...input, flex: 1, minWidth: 220 }}
            />
            <button type="submit" disabled={status === "loading" || !ref.trim()} style={{ ...primaryBtn, opacity: status === "loading" || !ref.trim() ? 0.6 : 1 }}>
              {status === "loading" ? "Tracking…" : "Track"}
            </button>
          </form>

          {status === "error" && (
            <div style={{ ...card, marginTop: 22, color: "#B4483F", fontSize: 14 }}>{error}</div>
          )}

          {status === "done" && order && <Result order={order} fmtDate={fmtDate} />}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Result({ order, fmtDate }: { order: Tracked; fmtDate: (s: string) => string }) {
  const meta = statusMeta(order.status);
  const terminal = isTerminal(order.status);
  const refunded = isRefunded(order.status);
  const current = statusStep(order.status);
  const prepaid = order.paymentStatus === "paid" || /prepaid|online/i.test(order.paymentMethod || "");

  return (
    <div style={{ ...card, marginTop: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#26221C" }}>{order.orderNumber}</div>
          <div style={{ fontSize: 13, color: "#9B8F7C", marginTop: 3 }}>Placed {fmtDate(order.placedAt)}</div>
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: meta.color, background: meta.bg, borderRadius: 999, padding: "6px 14px" }}>{meta.label}</span>
      </div>

      {/* progress tracker */}
      {terminal ? (
        <div style={{ marginTop: 22, background: meta.bg, color: meta.color, borderRadius: 12, padding: "14px 16px", fontSize: 14, fontWeight: 600 }}>
          {refunded
            ? "This order has been refunded. The amount should reflect in your account within 5–7 business days."
            : "This order was cancelled. If this is unexpected, please contact us."}
        </div>
      ) : (
        <div style={{ display: "flex", marginTop: 28, marginBottom: 8 }}>
          {STATUS_FLOW.map((s, i) => {
            const done = i <= current;
            const isLast = i === STATUS_FLOW.length - 1;
            return (
              <div key={s} style={{ flex: 1, position: "relative", textAlign: "center" }}>
                {!isLast && (
                  <div style={{ position: "absolute", top: 11, left: "50%", width: "100%", height: 3, background: i < current ? "#A15E38" : "#E1D6C4" }} />
                )}
                <div
                  style={{
                    position: "relative",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    margin: "0 auto",
                    background: done ? "#A15E38" : "#E1D6C4",
                    color: "#F6F1E9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    zIndex: 1,
                  }}
                >
                  {done ? "✓" : ""}
                </div>
                <div style={{ fontSize: 11, marginTop: 8, color: done ? "#26221C" : "#9B8F7C", fontWeight: done ? 700 : 500, lineHeight: 1.3 }}>
                  {statusMeta(s).label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ borderTop: "1px solid #EFE7D9", marginTop: 22, paddingTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
        <div>
          <div style={sectionLabel}>Payment</div>
          <div style={cell}>{prepaid ? "Prepaid (paid online)" : "Cash on Delivery"}</div>
        </div>
        <div>
          <div style={sectionLabel}>Shipping to</div>
          <div style={cell}>{[order.city, order.state].filter(Boolean).join(", ") || "—"}</div>
        </div>
        <div>
          <div style={sectionLabel}>Order total</div>
          <div style={cell}>{formatINR(Number(order.total))}</div>
        </div>
        {(order.courier || order.awb) && (
          <div>
            <div style={sectionLabel}>Courier</div>
            <div style={cell}>{order.courier || "—"}{order.awb ? ` · ${order.awb}` : ""}</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={sectionLabel}>Items</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {order.items.map((it, i) => (
            <span key={i} style={{ fontSize: 13, background: "#F3ECDF", borderRadius: 8, padding: "6px 10px", color: "#26221C" }}>
              {it.title} <strong>× {it.qty}</strong>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "#A15E38",
};
const h1: React.CSSProperties = {
  fontFamily: "var(--font-instrument-serif), serif",
  fontWeight: 400,
  fontSize: 52,
  margin: "14px 0 0",
  lineHeight: 1.05,
};
const card: React.CSSProperties = {
  background: "#FCFAF5",
  border: "1px solid #EAE0D0",
  borderRadius: 20,
  padding: "24px 26px",
  fontFamily: "var(--font-manrope), sans-serif",
};
const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#9B8F7C",
  marginBottom: 6,
};
const cell: React.CSSProperties = { fontSize: 14, color: "#4A3B2A", lineHeight: 1.5 };
const input: React.CSSProperties = {
  border: "1px solid #E0D6C6",
  background: "#FCFAF5",
  borderRadius: 12,
  padding: "14px 16px",
  fontFamily: "var(--font-manrope), sans-serif",
  fontSize: 15,
  color: "#26221C",
  outline: "none",
  boxSizing: "border-box",
};
const primaryBtn: React.CSSProperties = {
  background: "#26221C",
  color: "#F6F1E9",
  border: "none",
  borderRadius: 999,
  padding: "14px 28px",
  fontFamily: "var(--font-manrope), sans-serif",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
};
