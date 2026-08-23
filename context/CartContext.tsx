"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { StaticImageData } from "next/image";
import CartModal from "@/components/CartModal";
import CheckoutModal from "@/components/CheckoutModal";
import { fbqTrack } from "@/lib/fbpixel";
import { getProduct, type Product } from "@/lib/products";

export type CartItem = {
  slug: string;
  title: string;
  priceNum: number;
  img: StaticImageData;
  qty: number;
};

// Bump the version if the persisted shape ever changes, to invalidate old data.
const STORAGE_KEY = "skinsnap_cart_v1";

/**
 * We persist only { slug, qty } — the durable identity — and rehydrate the
 * rest (title, price, image) from the product catalog. So a cart restored from
 * a reload always reflects current prices/images, and any product that no
 * longer exists is silently dropped.
 */
function loadStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const items: CartItem[] = [];
    for (const entry of parsed) {
      const product = getProduct(entry?.slug);
      const qty = Math.max(1, Math.floor(Number(entry?.qty) || 0));
      if (product && qty > 0) {
        items.push({
          slug: product.slug,
          title: product.title,
          priceNum: product.priceNum,
          img: product.img,
          qty,
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

type CartCtx = {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  addItem: (product: Product, qty?: number) => void;
  buyNow: (product: Product, qty?: number) => void;
  removeItem: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Starts empty so server and first client render match (no hydration
  // mismatch); the real cart is loaded from localStorage right after mount.
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Skip the very first persist run so the initial empty state can't overwrite
  // a stored cart before we've loaded it.
  const skipPersist = useRef(true);

  // Load once on mount (client only).
  useEffect(() => {
    const stored = loadStoredCart();
    if (stored.length) setItems(stored);
  }, []);

  // Persist { slug, qty } whenever the cart changes.
  useEffect(() => {
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items.map((i) => ({ slug: i.slug, qty: i.qty })))
      );
    } catch {
      /* storage full or unavailable — cart just won't persist */
    }
  }, [items]);

  // Keep multiple open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(loadStoredCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const mergeAdd = useCallback((product: Product, qty: number) => {
    fbqTrack("AddToCart", {
      content_ids: [product.slug],
      content_name: product.title,
      content_type: "product",
      value: product.priceNum * qty,
      currency: "INR",
    });
    setItems((prev) => {
      const found = prev.find((i) => i.slug === product.slug);
      if (found) {
        return prev.map((i) =>
          i.slug === product.slug ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          slug: product.slug,
          title: product.title,
          priceNum: product.priceNum,
          img: product.img,
          qty,
        },
      ];
    });
  }, []);

  const addItem = useCallback(
    (product: Product, qty = 1) => {
      mergeAdd(product, qty);
      setCheckoutOpen(false);
      setCartOpen(true);
    },
    [mergeAdd]
  );

  const buyNow = useCallback(
    (product: Product, qty = 1) => {
      mergeAdd(product, qty);
      setCartOpen(false);
      setCheckoutOpen(true);
    },
    [mergeAdd]
  );

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.slug === slug ? { ...i, qty } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => {
    setCheckoutOpen(false);
    setCartOpen(true);
  }, []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openCheckout = useCallback(() => {
    setCartOpen(false);
    setCheckoutOpen(true);
  }, []);

  const cartCount = useMemo(
    () => items.reduce((s, i) => s + i.qty, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.qty * i.priceNum, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      cartCount,
      subtotal,
      addItem,
      buyNow,
      removeItem,
      setQty,
      clearCart,
      openCart,
      closeCart,
      openCheckout,
    }),
    [items, cartCount, subtotal, addItem, buyNow, removeItem, setQty, clearCart, openCart, closeCart, openCheckout]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartModal open={cartOpen} onClose={closeCart} />
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
