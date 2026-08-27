"use client";

import Link from "next/link";
import CheckoutForm from "@/components/CheckoutForm";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function OrderPage() {
  return (
    <div className="wrap">
      <Nav active="products" />

      <section
        className="section-pad"
        style={{
          minHeight: "70vh",
          padding: "140px 24px 90px",
          background: "radial-gradient(120% 100% at 50% 0%, #FBF6EF 0%, #EFE4D4 100%)",
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            fontFamily: "var(--font-manrope), sans-serif",
          }}
        >
          <div style={{ marginBottom: 22, fontSize: 13, color: "#9B8F7C" }}>
            <Link href="/products" style={{ textDecoration: "none", color: "#9B8F7C" }}>
              Products
            </Link>
            &nbsp;/&nbsp;<span style={{ color: "#6B6357" }}>Checkout</span>
          </div>

          <CheckoutForm variant="page" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
