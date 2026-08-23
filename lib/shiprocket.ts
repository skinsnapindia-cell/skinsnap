/**
 * Shiprocket API client. SERVER-ONLY — never import this into a client
 * component. It holds account credentials, and Shiprocket authenticates with
 * an email/password login (no browser-safe key), so every call must be
 * proxied through an API route.
 *
 * Scope: this client only QUOTES shipping rates (courier serviceability). It
 * does not create orders/shipments — fulfilment is handled in the Shiprocket
 * dashboard.
 *
 * Configure via .env.local:
 *   SHIPROCKET_EMAIL=you@example.com
 *   SHIPROCKET_PASSWORD=...
 *   SHIPROCKET_PICKUP_PINCODE=380001        # PIN of your pickup location
 */

const API = "https://apiv2.shiprocket.in/v1/external";

export function isShiprocketConfigured(): boolean {
  return !!(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
}

export function pickupPincode(): string {
  return process.env.SHIPROCKET_PICKUP_PINCODE || "";
}

// --- token cache -----------------------------------------------------------
// Shiprocket tokens last ~10 days. Cached at module scope, so a warm serverless
// instance reuses it instead of logging in on every request. Refreshed early to
// avoid racing the expiry.
let cachedToken: { token: string; expiresAt: number } | null = null;
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // 9 days, one day of headroom

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.token) {
    // Deliberately does not echo the response body — it can contain credentials.
    throw new Error("Shiprocket authentication failed. Check SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD.");
  }

  cachedToken = { token: data.token, expiresAt: Date.now() + TOKEN_TTL_MS };
  return data.token;
}

async function authedFetch(path: string, init: RequestInit = {}) {
  const token = await getToken();
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
}

// --- courier serviceability / rates ---------------------------------------

export type CourierQuote = {
  courierName: string;
  /** total shipping charge in rupees, COD charges included */
  rate: number;
  /** estimated delivery days, when Shiprocket reports it */
  etdDays: number | null;
};

type ServiceabilityCourier = {
  courier_name?: string;
  rate?: number;
  cod_charges?: number;
  estimated_delivery_days?: string | number;
};

/**
 * Cheapest serviceable courier for a delivery PIN, or null if none serve it.
 * Throws only on auth/transport failure — an unserviceable PIN is a null.
 */
export async function getCheapestQuote(opts: {
  deliveryPincode: string;
  weightKg: number;
  declaredValue: number;
  cod: boolean;
}): Promise<CourierQuote | null> {
  const params = new URLSearchParams({
    pickup_postcode: pickupPincode(),
    delivery_postcode: opts.deliveryPincode,
    weight: String(opts.weightKg),
    cod: opts.cod ? "1" : "0",
    declared_value: String(opts.declaredValue),
  });

  const res = await authedFetch(`/courier/serviceability/?${params.toString()}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // 404 from this endpoint means "no courier serves this route", not an outage
    if (res.status === 404) return null;
    throw new Error(data?.message || "Shiprocket rate lookup failed.");
  }

  const couriers: ServiceabilityCourier[] =
    data?.data?.available_courier_companies ?? [];
  if (couriers.length === 0) return null;

  const quotes: CourierQuote[] = couriers
    .map((c) => ({
      courierName: c.courier_name || "Courier",
      // `rate` already includes COD charges on most Shiprocket plans, but not
      // all — add cod_charges only when it isn't already folded in.
      rate: Number(c.rate) || 0,
      etdDays:
        c.estimated_delivery_days != null && c.estimated_delivery_days !== ""
          ? Number(c.estimated_delivery_days) || null
          : null,
    }))
    .filter((q) => q.rate > 0);

  if (quotes.length === 0) return null;

  return quotes.reduce((cheapest, q) => (q.rate < cheapest.rate ? q : cheapest));
}
