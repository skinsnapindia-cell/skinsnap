/**
 * Mappls (MapmyIndia) API client. SERVER-ONLY — never import into a client
 * component. It holds the OAuth client secret.
 *
 * Mappls has three credential types; we use two:
 *   - OAuth client_id / client_secret  → secured REST APIs (autosuggest,
 *     geocode). Server-side only.  →  MAPPLS_CLIENT_ID / MAPPLS_CLIENT_SECRET
 *   - Map SDK key                      → loads the map JS in the browser. This
 *     one is public by design (referrer-restricted in the Mappls console).
 *     →  NEXT_PUBLIC_MAPPLS_MAP_SDK_KEY  (read directly in the client component)
 *
 * NOTE: These endpoints/response shapes follow Mappls' documented APIs but
 * haven't been smoke-tested against a live account yet. Field mappings are
 * defensive (multiple fallbacks) and everything degrades gracefully, so a
 * mismatch shows fewer suggestions rather than breaking checkout. Verify once
 * real keys are in .env.local.
 */

const TOKEN_URL = "https://outpost.mappls.com/api/security/oauth/token";
const AUTOSUGGEST_URL = "https://atlas.mappls.com/api/places/search/json";
const GEOCODE_URL = "https://atlas.mappls.com/api/places/geocode";

export function isMapplsConfigured(): boolean {
  return !!(process.env.MAPPLS_CLIENT_ID && process.env.MAPPLS_CLIENT_SECRET);
}

// --- OAuth token cache (tokens last ~24h) ---------------------------------
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.MAPPLS_CLIENT_ID || "",
    client_secret: process.env.MAPPLS_CLIENT_SECRET || "",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.access_token) {
    throw new Error("Mappls authentication failed. Check MAPPLS_CLIENT_ID / MAPPLS_CLIENT_SECRET.");
  }
  const ttlMs = (Number(data.expires_in) || 86400) * 1000;
  cachedToken = { token: data.access_token, expiresAt: Date.now() + ttlMs - 60_000 };
  return data.access_token;
}

const str = (v: unknown): string => (v == null ? "" : String(v)).trim();
const num = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// --- Autosuggest -----------------------------------------------------------
export type Suggestion = { label: string; sublabel: string; eloc: string };

export async function autosuggest(query: string): Promise<Suggestion[]> {
  const token = await getToken();
  const url = `${AUTOSUGGEST_URL}?query=${encodeURIComponent(query)}&region=ind`;
  const res = await fetch(url, {
    headers: { Authorization: `bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  const locs: Array<Record<string, unknown>> = data?.suggestedLocations || [];
  return locs
    .map((l) => ({
      label: str(l.placeName),
      sublabel: str(l.placeAddress),
      eloc: str(l.eLoc),
    }))
    .filter((s) => s.label && s.eloc);
}

// --- Geocode (structured address + coordinates) ----------------------------
export type AddressDetail = {
  lat: number | null;
  lng: number | null;
  street: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  formatted: string;
};

/**
 * Resolves a selected suggestion to a structured address + coordinates by
 * geocoding its text. Returns null if nothing usable comes back — the caller
 * then falls back to the raw suggestion text.
 */
export async function geocodeAddress(address: string): Promise<AddressDetail | null> {
  const token = await getToken();
  const url = `${GEOCODE_URL}?address=${encodeURIComponent(address)}&region=IND`;
  const res = await fetch(url, {
    headers: { Authorization: `bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  const r: Record<string, unknown> | undefined =
    data?.results?.[0] || data?.copResults || undefined;
  if (!r) return null;

  return {
    lat: num(r.lat ?? r.latitude),
    lng: num(r.lng ?? r.longitude),
    street: str(r.street || r.poi || r.subSubLocality || r.subLocality),
    locality: str(r.locality || r.subLocality || r.village),
    city: str(r.city || r.district),
    state: str(r.state),
    pincode: str(r.pincode),
    formatted: str(r.formatted_address || r.formattedAddress),
  };
}
