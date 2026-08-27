"use client";

import { useRef, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useReveals } from "@/lib/useReveals";

const faqData = [
  { q: "How much powder do I use?", a: "About 1–2 teaspoons for a single face pack — enough to cover your face and neck. A 50g jar gives you many packs, so you only ever mix what you need." },
  { q: "What do I mix it with?", a: "Water or rose water. Plain water gives you a classic clay pack; rose water adds extra toning and hydration. Add a little at a time and stir into a smooth paste." },
  { q: "Are the ingredients natural?", a: "Completely. Each jar is 100% pure, finely milled clay and botanicals — no preservatives and no synthetic additives, because you mix it fresh rather than buying it pre-mixed." },
  { q: "How long does one jar last?", a: "Each 50g jar makes many face packs. Kept dry and sealed, the powder stays good for a long time — you mix it only at the moment of use." },
  { q: "How should I store it?", a: "Keep the jar closed in a cool, dry place and use a dry spoon. As long as no water gets into the jar, the powder won't clump or spoil." },
];

const steps = [
  { n: "01", t: "Scoop", d: "Scoop 1–2 teaspoons of powder into a small bowl." },
  { n: "02", t: "Mix", d: "Add a little water or rose water and stir into a smooth paste." },
  { n: "03", t: "Apply", d: "Spread an even layer over clean, dry skin." },
  { n: "04", t: "Glow", d: "Leave 10–15 minutes, then rinse for fresh, radiant skin." },
];

export default function HowItWorksPage() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const [faqOpen, setFaqOpen] = useState(0);

  useReveals(scopeRef);

  return (
    <div className="wrap" ref={scopeRef}>
      <Nav active="how" />

      {/* HERO */}
      <section
        className="section-pad"
        style={{
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "140px 40px 60px",
          background: "radial-gradient(120% 90% at 50% 30%, #FBF6EF 0%, #EFE4D4 100%)",
        }}
      >
        <div data-hero style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#A15E38" }}>
          The Ritual
        </div>
        <h1 data-hero className="section-title home-hero__title" style={{ fontSize: 92, lineHeight: 1, margin: "22px 0 0", maxWidth: 900 }}>
          Mixed <em style={{ color: "#B97C79" }}>fresh</em>, by you.
        </h1>
        <p data-hero style={{ fontSize: 18, color: "#5A5348", maxWidth: 560, margin: "26px auto 0", lineHeight: 1.6 }}>
          A jar of pure, natural powder that becomes a face pack the moment you mix it with water or rose water — freshly made, every time.
        </p>
        <div data-hero style={{ marginTop: 56, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9B8F7C" }}>
          A simple 4-step ritual ↓
        </div>
      </section>

      {/* INTRO */}
      <section className="section-pad" style={{ padding: "130px 48px", background: "#F6F1E9" }}>
        <div data-reveal style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <h2 className="section-title h-lg" style={{ fontSize: 48, margin: "0 0 24px" }}>
            Pure powder, mixed fresh at home.
          </h2>
          <p style={{ fontSize: 17, color: "#6B6357", lineHeight: 1.7, maxWidth: 640, margin: "0 auto 64px" }}>
            Every SkinSnap jar holds 50g of pure, natural powder — no preservatives and nothing pre-mixed. You bring it to life with a splash of water or rose water, only at the moment of use.
          </p>
          <div className="grid-2" style={{ gap: 28, textAlign: "left" }}>
            <div style={{ background: "#F3ECDF", borderRadius: 22, padding: 40 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A15E38" }}>In the Jar</div>
              <div className="section-title" style={{ fontSize: 32, margin: "12px 0 10px" }}>100% Pure Powder</div>
              <p style={{ fontSize: 15, color: "#7A6249", lineHeight: 1.6 }}>A fine, dry blend of mineral clay and botanicals — 50g in every jar, kept dry so it stays potent until you need it.</p>
            </div>
            <div style={{ background: "#F5E8E8", borderRadius: 22, padding: 40 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#B97C79" }}>You Add</div>
              <div className="section-title" style={{ fontSize: 32, margin: "12px 0 10px" }}>Water or Rose Water</div>
              <p style={{ fontSize: 15, color: "#7A5C5A", lineHeight: 1.6 }}>A little water for a classic clay pack, or rose water for extra toning and hydration — the liquid that turns powder into a fresh, smooth paste.</p>
            </div>
          </div>
          <div style={{ marginTop: 28, background: "#26221C", color: "#F6F1E9", borderRadius: 22, padding: "36px 40px", display: "flex", alignItems: "center", gap: 28, textAlign: "left" }} className="divider-band">
            <svg width="90" height="90" viewBox="0 0 90 90" style={{ flexShrink: 0 }}>
              <circle cx="45" cy="45" r="40" fill="none" stroke="#B08A55" strokeWidth="1.5" strokeDasharray="3 4" />
              <path d="M30 52 Q45 30 60 52" fill="none" stroke="#B08A55" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#E8CBB2" }}>Why Powder</div>
              <div className="section-title" style={{ fontSize: 26, margin: "6px 0" }}>Fresh Beats Pre-Mixed</div>
              <p style={{ fontSize: 14, color: "#C9C1B3", lineHeight: 1.6, maxWidth: 640 }}>Pre-mixed creams sit in a tube for months and need preservatives to survive. A dry powder you mix yourself needs none — every pack is made fresh, at full strength, exactly when you want it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* THE RITUAL — 4 simple steps */}
      <section className="section-pad" style={{ padding: "130px 48px", background: "linear-gradient(180deg,#EFE4D4 0%,#F6F1E9 100%)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div data-reveal style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#A15E38" }}>Four Steps</div>
            <h2 className="section-title h-xl" style={{ fontSize: 52, margin: "16px 0 0" }}>Scoop. Mix. Apply. Glow.</h2>
          </div>
          <div className="grid-4" style={{ gap: 24 }}>
            {steps.map((s) => (
              <div data-reveal key={s.n} style={{ background: "#FCFAF5", border: "1px solid #EAE0D0", borderRadius: 20, padding: 32 }}>
                <div className="section-title" style={{ fontSize: 44, color: "#E8CBB2" }}>{s.n}</div>
                <div style={{ fontWeight: 700, fontSize: 18, margin: "14px 0 8px", color: "#26221C" }}>{s.t}</div>
                <div style={{ fontSize: 14, color: "#6B6357", lineHeight: 1.6 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEY BENEFITS */}
      <section className="section-pad" style={{ padding: "130px 48px", background: "#26221C", color: "#F6F1E9" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div data-reveal style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#E8CBB2" }}>Why It Matters</div>
            <h2 className="section-title h-xl" style={{ fontSize: 52, margin: "16px 0 0" }}>Fresh by nature.</h2>
          </div>
          <div className="grid-3" style={{ gap: 24 }}>
            {[
              { n: "01", t: "Mixed fresh", d: "Made at the moment of use — full potency, no preservatives, no oxidation." },
              { n: "02", t: "100% natural", d: "Pure clay and botanicals, finely milled. No preservatives, no fillers, no chemicals." },
              { n: "03", t: "50g goes far", d: "A generous jar makes many face packs — mix only what you need, each time." },
            ].map((b) => (
              <div data-reveal key={b.n} style={{ background: "#2C2620", borderRadius: 20, padding: 36 }}>
                <div className="section-title" style={{ fontSize: 40, color: "#E8CBB2" }}>{b.n}</div>
                <div style={{ fontWeight: 700, fontSize: 18, margin: "14px 0 8px" }}>{b.t}</div>
                <div style={{ fontSize: 14, color: "#9B927F", lineHeight: 1.6 }}>{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad" style={{ padding: "130px 48px", background: "#F6F1E9" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div data-reveal style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#A15E38" }}>Questions</div>
            <h2 className="section-title h-xl" style={{ fontSize: 48, margin: "16px 0 0" }}>Frequently asked</h2>
          </div>
          <div data-reveal>
            {faqData.map((f, i) => {
              const open = faqOpen === i;
              return (
                <div key={f.q} style={{ borderBottom: "1px solid #DAD0C0" }}>
                  <button
                    onClick={() => setFaqOpen(open ? -1 : i)}
                    style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, padding: "26px 4px", textAlign: "left", fontFamily: "var(--font-manrope), sans-serif" }}
                  >
                    <span style={{ fontSize: 18, fontWeight: 600, color: "#26221C" }}>{f.q}</span>
                    <span style={{ fontSize: 26, color: "#A15E38", fontWeight: 300, flexShrink: 0 }}>{open ? "−" : "+"}</span>
                  </button>
                  {open && <div style={{ padding: "0 4px 26px", fontSize: 15, color: "#6B6357", lineHeight: 1.7, maxWidth: 680 }}>{f.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @media (max-width: 640px) {
          .divider-band {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
