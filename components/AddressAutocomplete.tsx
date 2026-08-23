"use client";

import { useEffect, useRef, useState } from "react";

export type SelectedAddress = {
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
};

type Suggestion = { label: string; sublabel: string; eloc: string };

const MAP_KEY = process.env.NEXT_PUBLIC_MAPPLS_MAP_SDK_KEY || "";

// ---- Mappls Web Map SDK loader (loaded once, lazily) ----------------------
type MapplsGlobal = {
  Map: new (el: HTMLElement | string, opts: Record<string, unknown>) => unknown;
  Marker: new (opts: Record<string, unknown>) => unknown;
};
let sdkPromise: Promise<MapplsGlobal> | null = null;

function loadMapplsSdk(): Promise<MapplsGlobal> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as unknown as { mappls?: MapplsGlobal };
  if (w.mappls?.Map) return Promise.resolve(w.mappls);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<MapplsGlobal>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://apis.mappls.com/advancedmaps/api/${MAP_KEY}/map_sdk?layer=vector&v=3.0`;
    s.async = true;
    s.onload = () => {
      const start = Date.now();
      const check = () => {
        const m = (window as unknown as { mappls?: MapplsGlobal }).mappls;
        if (m?.Map) resolve(m);
        else if (Date.now() - start > 5000) reject(new Error("Mappls SDK not ready"));
        else setTimeout(check, 60);
      };
      check();
    };
    s.onerror = () => reject(new Error("Mappls SDK failed to load"));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

const parsePincode = (s: string): string => s.match(/\b([1-9]\d{5})\b/)?.[1] || "";

/**
 * Street-address field with Mappls autocomplete + a map preview.
 *
 * Degrades gracefully: if Mappls isn't configured (server returns
 * "unconfigured"), it behaves as an ordinary text input with no dropdown or
 * map — checkout is never blocked.
 */
export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (a: SelectedAddress) => void;
  error?: string;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapFailed, setMapFailed] = useState(false);

  const justSelected = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const mapElRef = useRef<HTMLDivElement>(null);

  // debounced suggestions
  useEffect(() => {
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/address-search?q=${encodeURIComponent(q)}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data?.status === "ok" && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
          setOpen(data.suggestions.length > 0);
        } else {
          setSuggestions([]); // unconfigured / unavailable → plain input
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [value]);

  // close dropdown on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // render/update the map preview when coordinates change
  useEffect(() => {
    if (!coords || !MAP_KEY || !mapElRef.current) return;
    let disposed = false;
    loadMapplsSdk()
      .then((mappls) => {
        if (disposed || !mapElRef.current) return;
        try {
          mapElRef.current.innerHTML = "";
          const map = new mappls.Map(mapElRef.current, {
            center: [coords.lat, coords.lng],
            zoom: 16,
            zoomControl: true,
          });
          // marker; some SDK builds want it after the load event
          setTimeout(() => {
            try {
              new mappls.Marker({ map, position: { lat: coords.lat, lng: coords.lng } });
            } catch {
              /* marker optional */
            }
          }, 300);
        } catch {
          setMapFailed(true);
        }
      })
      .catch(() => setMapFailed(true));
    return () => {
      disposed = true;
    };
  }, [coords]);

  const choose = async (s: Suggestion) => {
    justSelected.current = true;
    onChange(s.label);
    setOpen(false);
    setSuggestions([]);

    // start with a safe fallback from the suggestion itself
    const fallback: SelectedAddress = {
      street: s.label,
      area: "",
      city: "",
      state: "",
      pincode: parsePincode(s.sublabel),
      lat: null,
      lng: null,
    };

    try {
      const res = await fetch(
        `/api/address-detail?address=${encodeURIComponent(`${s.label}, ${s.sublabel}`)}`
      );
      const data = await res.json().catch(() => ({}));
      if (data?.status === "ok" && data.detail) {
        const d = data.detail;
        const picked: SelectedAddress = {
          street: d.street || s.label,
          area: d.locality || "",
          city: d.city || "",
          state: d.state || "",
          pincode: d.pincode || fallback.pincode,
          lat: typeof d.lat === "number" ? d.lat : null,
          lng: typeof d.lng === "number" ? d.lng : null,
        };
        onSelect(picked);
        if (picked.lat != null && picked.lng != null) {
          setMapFailed(false);
          setCoords({ lat: picked.lat, lng: picked.lng });
        }
        return;
      }
    } catch {
      /* fall through to fallback */
    }
    onSelect(fallback);
  };

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Start typing your street / area…"
        autoComplete="off"
        style={{
          ...inputStyle,
          borderColor: error ? "#D98A82" : "#E0D6C6",
        }}
      />
      {loading && (
        <span style={{ position: "absolute", right: 14, top: 14, fontSize: 12, color: "#9B8F7C" }}>
          …
        </span>
      )}

      {open && suggestions.length > 0 && (
        <div style={dropdown}>
          {suggestions.map((s) => (
            <button
              key={s.eloc}
              type="button"
              onClick={() => choose(s)}
              style={optionStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F3ECDF")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 14, color: "#26221C", fontWeight: 600 }}>{s.label}</span>
              {s.sublabel && (
                <span style={{ fontSize: 12, color: "#9B8F7C", display: "block", marginTop: 2 }}>
                  {s.sublabel}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* map preview */}
      {coords && MAP_KEY && !mapFailed && (
        <div
          ref={mapElRef}
          style={{
            height: 170,
            marginTop: 10,
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #E0D6C6",
            background: "#EDE4D5",
          }}
        />
      )}
    </div>
  );
}

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

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  left: 0,
  right: 0,
  zIndex: 20,
  background: "#FCFAF5",
  border: "1px solid #E0D6C6",
  borderRadius: 12,
  boxShadow: "0 20px 40px -20px rgba(38,34,28,0.4)",
  overflow: "hidden",
  maxHeight: 260,
  overflowY: "auto",
};

const optionStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #F0E8DA",
  padding: "11px 14px",
  cursor: "pointer",
  fontFamily: "var(--font-manrope), sans-serif",
};
