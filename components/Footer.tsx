"use client";

import Link from "next/link";
import { InstagramIcon, WhatsappIcon } from "@/components/SocialIcons";
import { INSTAGRAM_URL, WHATSAPP_URL } from "@/lib/social";

export default function Footer() {
  return (
    <footer
      className="section-pad"
      style={{
        background: "#26221C",
        color: "#F6F1E9",
        padding: "96px 48px 40px",
      }}
    >
      <div
        className="footer-grid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 60,
        }}
      >
        <div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 34, letterSpacing: "0.03em" }}>
            SKINSNAP
          </div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontStyle: "italic", fontSize: 18, color: "#E8CBB2", marginTop: 10 }}>
            Fresh Clay. Zero Mess.
          </div>
          <div style={{ fontSize: 13, color: "#9B927F", marginTop: 16, maxWidth: 280, lineHeight: 1.6 }}>
            Freshly activated natural face packs, engineered for modern skincare.
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={socialStyle}>
              <InstagramIcon size={17} />
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={socialStyle}>
              <WhatsappIcon size={17} />
            </a>
          </div>
        </div>

        <div>
          <div style={labelStyle}>Quick Links</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="/products" style={linkStyle}>Products</Link>
            <Link href="/how-it-works" style={linkStyle}>How It Works</Link>
            <Link href="/contact" style={linkStyle}>Contact</Link>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: "64px auto 0",
          paddingTop: 24,
          borderTop: "1px solid #3A342B",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 12, color: "#6B6357" }}>© 2026 SkinSnap. All rights reserved.</div>
        <div style={{ fontSize: 12, color: "#6B6357" }}>Freshly Activated. Naturally Beautiful.</div>
      </div>
    </footer>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#E8CBB2",
  marginBottom: 20,
};

const linkStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#C9C1B3",
  textDecoration: "none",
};

const socialStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  border: "1px solid #4A4238",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#C9C1B3",
};
