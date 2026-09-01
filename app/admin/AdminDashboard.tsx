"use client";

import { useEffect, useMemo, useState } from "react";
import { formatINR } from "@/lib/format";
import { ALL_STATUSES, statusMeta } from "@/lib/orderStatus";

type Item = { slug?: string; title: string; qty: number; lineTotal?: string; priceEach?: number };
type Order = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  customer_name: string;
  email: string;
  phone: string | null;
  flat_building: string | null;
  locality: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  items: Item[];
  subtotal: number;
  shipping: number | null;
  total: number;
  payment_method: string | null;
  shipping_courier: string | null;
  payment_id: string | null;
  payment_status: string | null;
  email_sent: boolean;
  awb: string | null;
};

type Phase = "loading" | "login" | "ready";

const money = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : formatINR(Number(n));

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const isPrepaid = (o: Order) =>
  o.payment_status === "paid" || /prepaid|online/i.test(o.payment_method || "");

export default function AdminDashboard() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [orders, setOrders] = useState<Order[]>([]);
  const [note, setNote] = useState("");

  // login form
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // filters
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = async () => {
    // Cache-busting query param defeats any browser/CDN cache so a reload
    // always pulls the latest order statuses from the database.
    const res = await fetch(`/api/admin/orders?t=${Date.now()}`, {
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (res.status === 401) {
      setPhase("login");
      return;
    }
    const data = await res.json().catch(() => ({}));
    setOrders(Array.isArray(data.orders) ? data.orders : []);
    setNote(data.error || "");
    setPhase("ready");
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginErr(data.error || "Login failed.");
        return;
      }
      setPassword("");
      await load();
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
    setOrders([]);
    setPhase("login");
  };

  const patchOrder = async (id: string, patch: Record<string, unknown>) => {
    // optimistic update
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      // reload from source of truth on failure
      await load();
      return false;
    }
    const data = await res.json().catch(() => ({}));
    if (data.order) setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
    return true;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        (o.phone || "").includes(q) ||
        (o.pincode || "").includes(q)
      );
    });
  }, [orders, query, statusFilter]);

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + Number(o.total || 0), 0);
    return {
      total: orders.length,
      placed: orders.filter((o) => o.status === "placed").length,
      shipped: orders.filter((o) => o.status === "shipped" || o.status === "out_for_delivery").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      revenue,
    };
  }, [orders]);

  if (phase === "loading") {
    return (
      <main style={page}>
        <div style={{ ...card, textAlign: "center", maxWidth: 420, margin: "80px auto" }}>Loading…</div>
      </main>
    );
  }

  if (phase === "login") {
    return (
      <main style={page}>
        <form onSubmit={login} style={{ ...card, maxWidth: 420, margin: "80px auto" }}>
          <div style={eyebrow}>SkinSnap</div>
          <h1 style={{ ...h1, fontSize: 30, marginBottom: 6 }}>Admin sign in</h1>
          <p style={{ fontSize: 14, color: "#6B6357", margin: "0 0 22px" }}>
            Enter the admin password to manage orders.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            style={input}
          />
          {loginErr && <div style={{ color: "#B4483F", fontSize: 13, marginTop: 10 }}>{loginErr}</div>}
          <button type="submit" disabled={loggingIn || !password} style={{ ...primaryBtn, marginTop: 18, opacity: loggingIn || !password ? 0.6 : 1 }}>
            {loggingIn ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <div style={eyebrow}>SkinSnap</div>
            <h1 style={h1}>Orders</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={load} style={ghostBtn}>Refresh</button>
            <button onClick={logout} style={ghostBtn}>Log out</button>
          </div>
        </header>

        {note && (
          <div style={{ ...card, padding: "14px 18px", marginBottom: 18, color: "#B4483F", fontSize: 14 }}>{note}</div>
        )}

        {/* stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 24 }}>
          <Stat label="Total orders" value={String(stats.total)} />
          <Stat label="New / placed" value={String(stats.placed)} />
          <Stat label="In transit" value={String(stats.shipped)} />
          <Stat label="Delivered" value={String(stats.delivered)} />
          <Stat label="Revenue" value={money(stats.revenue)} />
        </div>

        {/* filters */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ref, name, email, phone, PIN…"
            style={{ ...input, maxWidth: 340, marginTop: 0 }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...input, maxWidth: 220, marginTop: 0, appearance: "auto" }}>
            <option value="all">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{statusMeta(s).label}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div style={{ ...card, textAlign: "center", color: "#6B6357" }}>No orders match.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map((o) => (
              <OrderCard key={o.id} order={o} onPatch={patchOrder} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function OrderCard({ order: o, onPatch }: { order: Order; onPatch: (id: string, patch: Record<string, unknown>) => Promise<boolean> }) {
  const [courier, setCourier] = useState(o.shipping_courier || "");
  const [awb, setAwb] = useState(o.awb || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const meta = statusMeta(o.status);
  const prepaid = isPrepaid(o);

  const dirty = courier !== (o.shipping_courier || "") || awb !== (o.awb || "");

  const saveTracking = async () => {
    setSaving(true);
    const ok = await onPatch(o.id, { shipping_courier: courier || null, awb: awb || null });
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  return (
    <div style={card}>
      {/* top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: "#26221C", letterSpacing: "0.01em" }}>{o.order_number}</div>
          <div style={{ fontSize: 12.5, color: "#9B8F7C", marginTop: 3 }}>{fmtDate(o.created_at)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: meta.color, background: meta.bg, borderRadius: 999, padding: "5px 12px" }}>{meta.label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: prepaid ? "#5E7C4E" : "#A15E38", background: prepaid ? "#EAF1E4" : "#F7E6D8", borderRadius: 999, padding: "5px 12px" }}>
            {prepaid ? "Prepaid · Paid" : "COD"}
          </span>
        </div>
      </div>

      <div style={grid3}>
        {/* customer */}
        <div>
          <div style={sectionLabel}>Customer</div>
          <div style={cell}><strong>{o.customer_name}</strong></div>
          <div style={cell}><a href={`mailto:${o.email}`} style={link}>{o.email}</a></div>
          {o.phone && <div style={cell}><a href={`tel:${o.phone}`} style={link}>{o.phone}</a></div>}
        </div>

        {/* address */}
        <div>
          <div style={sectionLabel}>Ship to</div>
          {o.flat_building && <div style={cell}>{o.flat_building}</div>}
          {o.address_line && <div style={cell}>{o.address_line}</div>}
          {o.locality && <div style={cell}>{o.locality}</div>}
          <div style={cell}>
            {[o.city, o.state].filter(Boolean).join(", ")} {o.pincode ? `· ${o.pincode}` : ""}
          </div>
        </div>

        {/* payment / totals */}
        <div>
          <div style={sectionLabel}>Payment</div>
          <div style={cell}>{o.payment_method || (prepaid ? "Prepaid" : "Cash on Delivery")}</div>
          {o.payment_id && <div style={{ ...cell, fontSize: 12, color: "#9B8F7C" }}>Txn: {o.payment_id}</div>}
          <div style={{ ...cell, marginTop: 6 }}>Subtotal: {money(o.subtotal)}</div>
          <div style={cell}>Shipping: {o.shipping === null ? "—" : o.shipping === 0 ? "FREE" : money(o.shipping)}</div>
          <div style={{ ...cell, fontWeight: 800, color: "#26221C" }}>Total: {money(o.total)}</div>
        </div>
      </div>

      {/* items */}
      <div style={{ marginTop: 4 }}>
        <div style={sectionLabel}>Items</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {o.items.map((it, i) => (
            <span key={i} style={{ fontSize: 13, background: "#F3ECDF", borderRadius: 8, padding: "6px 10px", color: "#26221C" }}>
              {it.title} <strong>× {it.qty}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* manage */}
      <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #EFE7D9", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
        <div>
          <div style={sectionLabel}>Status</div>
          <select
            value={ALL_STATUSES.includes(o.status as (typeof ALL_STATUSES)[number]) ? o.status : "placed"}
            onChange={(e) => onPatch(o.id, { status: e.target.value })}
            style={{ ...input, marginTop: 0, minWidth: 190, appearance: "auto" }}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{statusMeta(s).label}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={sectionLabel}>Courier</div>
          <input value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. Delhivery" style={{ ...input, marginTop: 0, minWidth: 180 }} />
        </div>
        <div>
          <div style={sectionLabel}>AWB / Tracking no.</div>
          <input value={awb} onChange={(e) => setAwb(e.target.value)} placeholder="Tracking number" style={{ ...input, marginTop: 0, minWidth: 180 }} />
        </div>
        <button onClick={saveTracking} disabled={!dirty || saving} style={{ ...primaryBtn, width: "auto", padding: "12px 22px", marginTop: 0, opacity: !dirty || saving ? 0.55 : 1, cursor: !dirty || saving ? "default" : "pointer" }}>
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save tracking"}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ ...card, padding: "16px 18px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9B8F7C" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#26221C", marginTop: 6, fontFamily: "var(--font-instrument-serif), serif" }}>{value}</div>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F6F1E9",
  padding: "40px 24px 80px",
  fontFamily: "var(--font-manrope), sans-serif",
  color: "#26221C",
};
const card: React.CSSProperties = {
  background: "#FCFAF5",
  border: "1px solid #EAE0D0",
  borderRadius: 18,
  padding: "22px 24px",
};
const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 18,
  margin: "18px 0",
};
const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.24em",
  textTransform: "uppercase",
  color: "#A15E38",
};
const h1: React.CSSProperties = {
  fontFamily: "var(--font-instrument-serif), serif",
  fontWeight: 400,
  fontSize: 40,
  margin: "6px 0 0",
};
const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#9B8F7C",
  marginBottom: 7,
};
const cell: React.CSSProperties = { fontSize: 14, color: "#4A3B2A", lineHeight: 1.5 };
const link: React.CSSProperties = { color: "#A15E38", textDecoration: "none" };
const input: React.CSSProperties = {
  width: "100%",
  border: "1px solid #E0D6C6",
  background: "#F6F1E9",
  borderRadius: 12,
  padding: "12px 14px",
  fontFamily: "var(--font-manrope), sans-serif",
  fontSize: 14,
  color: "#26221C",
  outline: "none",
  boxSizing: "border-box",
  marginTop: 16,
};
const primaryBtn: React.CSSProperties = {
  width: "100%",
  background: "#26221C",
  color: "#F6F1E9",
  border: "none",
  borderRadius: 999,
  padding: "14px 0",
  fontFamily: "var(--font-manrope), sans-serif",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};
const ghostBtn: React.CSSProperties = {
  background: "none",
  border: "1px solid #D7CCBB",
  borderRadius: 999,
  padding: "10px 18px",
  fontSize: 13,
  fontWeight: 600,
  color: "#26221C",
  cursor: "pointer",
  fontFamily: "var(--font-manrope), sans-serif",
};
