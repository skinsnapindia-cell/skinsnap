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
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ marginBottom: 22, fontSize: 13, color: "#9B8F7C" }}>
            <Link href="/products" style={{ textDecoration: "none", color: "#9B8F7C" }}>
              Products
            </Link>
            &nbsp;/&nbsp;<span style={{ color: "#6B6357" }}>Checkout</span>
          </div>

          <div
            style={{
              background: "#FCFAF5",
              border: "1px solid #EAE0D0",
              borderRadius: 24,
              padding: "32px 28px",
              boxShadow: "0 30px 70px -40px rgba(38,34,28,0.4)",
              fontFamily: "var(--font-manrope), sans-serif",
            }}
          >
            <CheckoutForm variant="page" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
