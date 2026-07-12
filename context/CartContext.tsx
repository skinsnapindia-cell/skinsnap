"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import CartModal from "@/components/CartModal";
import CheckoutModal from "@/components/CheckoutModal";
import type { Product } from "@/lib/products";

export type CartItem = {
  slug: string;
  title: string;
  priceNum: number;
  img: string;
  qty: number;
};

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
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const mergeAdd = useCallback((product: Product, qty: number) => {
    setItems((prev) => {
      const found = prev.find((i) => i.slug === product.slug);
      if (found) {
        return prev.map((i) =>
          i.slug === product.slug ? { ...i, qty: i.qty + qty } : i,
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
    [mergeAdd],
  );

  const buyNow = useCallback(
    (product: Product, qty = 1) => {
      mergeAdd(product, qty);
      setCartOpen(false);
      setCheckoutOpen(true);
    },
    [mergeAdd],
  );

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.slug === slug ? { ...i, qty } : i))
        .filter((i) => i.qty > 0),
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
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.qty * i.priceNum, 0),
    [items],
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
    [
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
    ],
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
