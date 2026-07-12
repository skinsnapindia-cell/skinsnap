"use client";

import { useEffect, useRef, useState } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { useReveals } from "@/lib/useReveals";

const faqData = [
  {
    q: "Is the frangible seal safe?",
    a: "Yes. The internal seal is engineered from cosmetic-grade laminate and stays fully attached after bursting — no loose plastic pieces ever enter the formula.",
  },
  {
    q: "How long does mixing take?",
    a: "Just 10–15 seconds of gentle massaging after you press. The rose water and clay blend into a smooth, ready-to-apply cream inside the sealed pouch.",
  },
  {
    q: "Are the ingredients natural?",
    a: "Completely. Each pouch contains only 100% pure rose water and 100% pure Multani Mitti clay — no preservatives, no synthetic additives.",
  },
  {
    q: "Is one pouch a full application?",
    a: "Yes. Each single-use pouch holds exactly one freshly activated face pack, so every application is at peak freshness and potency.",
  },
  {
    q: "Can I travel with it?",
    a: "Absolutely. The flat, leak-proof pouch is airline- and bag-friendly, and activates only when you choose to press it.",
  },
];

const captions = [
  {
    step: "Step 01 · Press",
    color: "#B97C79",
    text: "Press the rose water chamber. Gentle, even pressure is all it takes.",
  },
  {
    step: "Step 02 · Burst",
    color: "#B97C79",
    text: "The frangible seal reaches its rupture point and opens cleanly.",
  },
  {
    step: "Step 03 · Flow",
    color: "#B97C79",
    text: "Rose water floods into the Multani Mitti chamber.",
  },
  {
    step: "Step 04 · Mix",
    color: "#B97C79",
    text: "Massage for 10–15 seconds. The ingredients blend completely.",
  },
  {
    step: "Step 05 · Cream",
    color: "#A15E38",
    text: "A smooth, fresh clay cream forms inside the sealed pouch.",
  },
  {
    step: "Step 06 · Tear",
    color: "#A15E38",
    text: "Tear the top corner along the notch.",
  },
  {
    step: "Step 07 · Apply",
    color: "#A15E38",
    text: "Apply directly to clean skin. No bowl, no brush, no mess.",
  },
  {
    step: "Step 08 · Glow",
    color: "#A15E38",
    text: "Rinse to reveal fresh, naturally radiant skin.",
  },
];

export default function HowItWorksPage() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const [faqOpen, setFaqOpen] = useState(0);

  useReveals(scopeRef);

  // pinned activation timeline
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const svg = svgRef.current;
      const pin = pinRef.current;
      const stage = stageRef.current;
      if (!svg || !pin || !stage) return;

      const q = (s: string) => svg.querySelector(s) as SVGElement;
      const seal = q("[data-el=seal]");
      const crack = q("[data-el=crack]");
      const rose = q("[data-el=rose]");
      const powder = q("[data-el=powder]");
      const cream = q("[data-el=cream]");
      const press = q("[data-el=press]");
      const tear = q("[data-el=tear]");
      const glow = q("[data-el=glow]");
      const caps = Array.from(pin.querySelectorAll<HTMLElement>("[data-cap]"));

      gsap.set(cream, { scale: 0.6 });
      let cur = -1;
      const showCap = (i: number) => {
        if (i === cur) return;
        caps.forEach((c, k) => {
          gsap.to(c, {
            opacity: k === i ? 1 : 0,
            y: k === i ? 0 : 8,
            duration: 0.35,
            ease: "power2.out",
          });
        });
        cur = i;
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: pin,
          anticipatePin: 1,
          onUpdate: (self) => {
            const i = Math.min(7, Math.floor(self.progress * 8));
            showCap(i);
            if (progRef.current)
              progRef.current.style.width =
                (self.progress * 100).toFixed(1) + "%";
          },
        },
      });
      // 0 press
      tl.to(press, { opacity: 1, duration: 1 }).to(
        rose,
        { scale: 1.05, transformOrigin: "170px 205px", duration: 1 },
        "<",
      );
      // 1 burst
      tl.to(seal, { opacity: 0.12, duration: 1 })
        .to(crack, { opacity: 1, duration: 1 }, "<")
        .to(press, { opacity: 0.35, duration: 1 }, "<");
      // 2 flow
      tl.to(rose, {
        x: 150,
        scaleX: 1.1,
        duration: 1,
        transformOrigin: "170px 205px",
      }).to(press, { opacity: 0, duration: 0.4 }, "<");
      // 3 mix
      tl.to(svg, { rotation: 2, transformOrigin: "320px 195px", duration: 0.5 })
        .to(svg, { rotation: -2, duration: 0.5 })
        .to(rose, { opacity: 0.4, duration: 1 }, "<<")
        .to(powder, { opacity: 0.5, duration: 1 }, "<");
      // 4 cream
      tl.to(cream, { opacity: 1, scale: 1, duration: 1 })
        .to(rose, { opacity: 0, duration: 0.6 }, "<")
        .to(powder, { opacity: 0, duration: 0.6 }, "<")
        .to(crack, { opacity: 0.25, duration: 0.6 }, "<")
        .to(svg, { rotation: 0, duration: 0.6 }, "<");
      // 5 tear
      tl.to(tear, { opacity: 1, duration: 1 });
      // 6 apply
      tl.to(svg, {
        rotation: -5,
        y: 10,
        transformOrigin: "320px 195px",
        duration: 1,
      });
      // 7 glow
      tl.to(glow, { opacity: 0.9, duration: 1 })
        .to(cream, { fill: "#EBD0BA", duration: 1 }, "<")
        .to(glowRef.current, { scale: 1.15, duration: 1 }, "<");

      setTimeout(() => ScrollTrigger.refresh(), 300);
    }, scopeRef);

    return () => ctx.revert();
  }, []);

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
          background:
            "radial-gradient(120% 90% at 50% 30%, #FBF6EF 0%, #EFE4D4 100%)",
        }}
      >
        <div
          data-hero
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#A15E38",
          }}
        >
          The Innovation
        </div>
        <h1
          data-hero
          className="section-title home-hero__title"
          style={{
            fontSize: 92,
            lineHeight: 1,
            margin: "22px 0 0",
            maxWidth: 900,
          }}
        >
          The pouch <em style={{ color: "#B97C79" }}>is</em> the product.
        </h1>
        <p
          data-hero
          style={{
            fontSize: 18,
            color: "#5A5348",
            maxWidth: 560,
            margin: "26px auto 0",
            lineHeight: 1.6,
          }}
        >
          A dual-chamber frangible pouch that mixes two natural ingredients the
          moment you press — freshly activated, every time.
        </p>
        <div
          data-hero
          style={{
            marginTop: 56,
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#9B8F7C",
          }}
        >
          Scroll to activate ↓
        </div>
      </section>

      {/* INTRO / CHAMBERS */}
      <section
        className="section-pad"
        style={{ padding: "130px 48px", background: "#F6F1E9" }}
      >
        <div
          data-reveal
          style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}
        >
          <h2
            className="section-title h-lg"
            style={{ fontSize: 48, margin: "0 0 24px" }}
          >
            Two ingredients, kept perfectly apart.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "#6B6357",
              lineHeight: 1.7,
              maxWidth: 640,
              margin: "0 auto 64px",
            }}
          >
            Inside every SkinSnap pouch, pure rose water and Multani Mitti clay
            wait in separate sealed chambers — never touching until the instant
            of use.
          </p>
          <div className="grid-2" style={{ gap: 28, textAlign: "left" }}>
            <div
              style={{ background: "#F5E8E8", borderRadius: 22, padding: 40 }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#B97C79",
                }}
              >
                Left Chamber
              </div>
              <div
                className="section-title"
                style={{ fontSize: 32, margin: "12px 0 10px" }}
              >
                100% Pure Rose Water
              </div>
              <p style={{ fontSize: 15, color: "#7A5C5A", lineHeight: 1.6 }}>
                Steam-distilled and sealed as a liquid — the activator that
                brings the clay to life.
              </p>
            </div>
            <div
              style={{ background: "#F3ECDF", borderRadius: 22, padding: 40 }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#A15E38",
                }}
              >
                Right Chamber
              </div>
              <div
                className="section-title"
                style={{ fontSize: 32, margin: "12px 0 10px" }}
              >
                100% Pure Multani Mitti
              </div>
              <p style={{ fontSize: 15, color: "#7A6249", lineHeight: 1.6 }}>
                A fine, dry mineral clay powder — isolated and protected until
                the moment it&apos;s needed.
              </p>
            </div>
          </div>
          <div
            style={{
              marginTop: 28,
              background: "#26221C",
              color: "#F6F1E9",
              borderRadius: 22,
              padding: "36px 40px",
              display: "flex",
              alignItems: "center",
              gap: 28,
              textAlign: "left",
            }}
            className="divider-band"
          >
            <svg
              aria-hidden="true"
              width="90"
              height="90"
              viewBox="0 0 90 90"
              style={{ flexShrink: 0 }}
            >
              <circle
                cx="45"
                cy="45"
                r="40"
                fill="none"
                stroke="#B08A55"
                strokeWidth="1.5"
                strokeDasharray="3 4"
              />
              <line
                x1="45"
                y1="20"
                x2="45"
                y2="70"
                stroke="#B08A55"
                strokeWidth="2.5"
                strokeDasharray="4 5"
              />
            </svg>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#E8CBB2",
                }}
              >
                The Divider
              </div>
              <div
                className="section-title"
                style={{ fontSize: 26, margin: "6px 0" }}
              >
                The Frangible Burst Seal
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "#C9C1B3",
                  lineHeight: 1.6,
                  maxWidth: 640,
                }}
              >
                Leak-proof and air-tight in storage, strong enough for transport
                — yet engineered to rupture under gentle hand pressure. The
                membrane stays attached: no loose plastic, ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PINNED ACTIVATION STAGE */}
      <section
        ref={stageRef}
        style={{
          position: "relative",
          height: "560vh",
          background: "linear-gradient(180deg,#EFE4D4 0%,#F6F1E9 100%)",
        }}
      >
        <div
          ref={pinRef}
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            ref={glowRef}
            style={{
              position: "absolute",
              top: "44%",
              left: "50%",
              width: 640,
              height: 640,
              transform: "translate(-50%,-50%)",
              background:
                "radial-gradient(circle, rgba(232,203,178,0.35) 0%, rgba(246,241,233,0) 65%)",
              pointerEvents: "none",
            }}
          />

          <svg
            aria-hidden="true"
            ref={svgRef}
            width="min(620px,88vw)"
            viewBox="0 0 640 400"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: "relative",
              zIndex: 2,
              filter: "drop-shadow(0 40px 46px rgba(120,80,60,0.22))",
            }}
          >
            <g data-el="glow" style={{ opacity: 0 }}>
              <ellipse cx="320" cy="195" rx="290" ry="150" fill="#F7E7CF" />
            </g>
            <rect
              x="20"
              y="50"
              width="600"
              height="290"
              rx="26"
              fill="#FCFAF5"
              stroke="#DAD0C0"
              strokeWidth="2"
            />
            <rect x="20" y="50" width="600" height="15" rx="7" fill="#EEE4D5" />
            <rect x="20" y="50" width="15" height="290" rx="7" fill="#EEE4D5" />
            <rect
              x="605"
              y="50"
              width="15"
              height="290"
              rx="7"
              fill="#EEE4D5"
            />
            <g data-el="tear" style={{ opacity: 0 }}>
              <path d="M576 50 L620 50 L620 92 Z" fill="#E8CBB2" />
              <path
                d="M576 50 Q 600 68 620 92"
                stroke="#B97C79"
                strokeWidth="2"
                strokeDasharray="3 4"
                fill="none"
              />
            </g>
            <path d="M576 50 L620 50 L620 88 Z" fill="#EEE4D5" />
            <g
              data-el="cream"
              style={{
                opacity: 0,
                transformBox: "fill-box",
                transformOrigin: "center",
              }}
            >
              <ellipse cx="320" cy="200" rx="250" ry="120" fill="#E3C3AC" />
            </g>
            <g data-el="powder">
              <g fill="#E8CBB2">
                <circle cx="450" cy="180" r="6" />
                <circle cx="480" cy="200" r="5" />
                <circle cx="465" cy="220" r="4.5" />
                <circle cx="500" cy="185" r="4" />
                <circle cx="440" cy="210" r="4" />
                <circle cx="510" cy="212" r="5" />
                <circle cx="490" cy="230" r="4" />
              </g>
            </g>
            <g data-el="rose">
              <ellipse
                cx="170"
                cy="205"
                rx="95"
                ry="62"
                fill="#EEB9B8"
                opacity="0.75"
              />
              <path
                d="M150 200 Q 152 214 166 216"
                stroke="#fff"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
                strokeLinecap="round"
              />
            </g>
            <line
              data-el="seal"
              x1="320"
              y1="66"
              x2="320"
              y2="324"
              stroke="#B08A55"
              strokeWidth="2"
              strokeDasharray="2 7"
            />
            <path
              data-el="crack"
              d="M320 70 L308 120 L330 165 L306 215 L326 265 L314 320"
              stroke="#B97C79"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0 }}
            />
            <g data-el="press" style={{ opacity: 0 }}>
              <circle
                cx="170"
                cy="205"
                r="52"
                fill="none"
                stroke="#B97C79"
                strokeWidth="2"
                strokeDasharray="4 5"
              />
              <path
                d="M170 176 L170 234 M156 190 L170 176 L184 190 M156 220 L170 234 L184 220"
                stroke="#B97C79"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>

          {/* captions */}
          <div
            style={{
              position: "relative",
              zIndex: 3,
              height: 120,
              marginTop: 20,
              width: "100%",
              maxWidth: 620,
              textAlign: "center",
            }}
          >
            {captions.map((c) => (
              <div
                key={c.step}
                data-cap
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  padding: "0 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: c.color,
                  }}
                >
                  {c.step}
                </div>
                <div
                  style={{
                    fontSize: 19,
                    color: "#4A4238",
                    marginTop: 10,
                    lineHeight: 1.5,
                  }}
                >
                  {c.text}
                </div>
              </div>
            ))}
          </div>

          {/* progress */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
              width: 220,
              height: 3,
              background: "#DAD0C0",
              borderRadius: 3,
              zIndex: 3,
            }}
          >
            <div
              ref={progRef}
              style={{
                height: "100%",
                width: "0%",
                background: "#A15E38",
                borderRadius: 3,
              }}
            />
          </div>
        </div>
      </section>

      {/* KEY BENEFITS */}
      <section
        className="section-pad"
        style={{
          padding: "130px 48px",
          background: "#26221C",
          color: "#F6F1E9",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div data-reveal style={{ textAlign: "center", marginBottom: 64 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#E8CBB2",
              }}
            >
              Why It Matters
            </div>
            <h2
              className="section-title h-xl"
              style={{ fontSize: 52, margin: "16px 0 0" }}
            >
              Freshness, engineered.
            </h2>
          </div>
          <div className="grid-3" style={{ gap: 24 }}>
            {[
              {
                n: "01",
                t: "Activated fresh",
                d: "Mixed at the moment of use — full potency, no preservatives, no oxidation.",
              },
              {
                n: "02",
                t: "Zero mess",
                d: "No bowl, no spoon, no measuring, no cleanup. The ritual lives in one pouch.",
              },
              {
                n: "03",
                t: "Travel-ready",
                d: "Flat, leak-proof and single-use — a complete face pack that fits any bag.",
              },
            ].map((b) => (
              <div
                data-reveal
                key={b.n}
                style={{ background: "#2C2620", borderRadius: 20, padding: 36 }}
              >
                <div
                  className="section-title"
                  style={{ fontSize: 40, color: "#E8CBB2" }}
                >
                  {b.n}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    margin: "14px 0 8px",
                  }}
                >
                  {b.t}
                </div>
                <div
                  style={{ fontSize: 14, color: "#9B927F", lineHeight: 1.6 }}
                >
                  {b.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="section-pad"
        style={{ padding: "130px 48px", background: "#F6F1E9" }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div data-reveal style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#A15E38",
              }}
            >
              Questions
            </div>
            <h2
              className="section-title h-xl"
              style={{ fontSize: 48, margin: "16px 0 0" }}
            >
              Frequently asked
            </h2>
          </div>
          <div data-reveal>
            {faqData.map((f, i) => {
              const open = faqOpen === i;
              return (
                <div key={f.q} style={{ borderBottom: "1px solid #DAD0C0" }}>
                  <button
                    type="button"
                    onClick={() => setFaqOpen(open ? -1 : i)}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 20,
                      padding: "26px 4px",
                      textAlign: "left",
                      fontFamily: "'Manrope',sans-serif",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#26221C",
                      }}
                    >
                      {f.q}
                    </span>
                    <span
                      style={{
                        fontSize: 26,
                        color: "#A15E38",
                        fontWeight: 300,
                        flexShrink: 0,
                      }}
                    >
                      {open ? "−" : "+"}
                    </span>
                  </button>
                  {open && (
                    <div
                      style={{
                        padding: "0 4px 26px",
                        fontSize: 15,
                        color: "#6B6357",
                        lineHeight: 1.7,
                        maxWidth: 680,
                      }}
                    >
                      {f.a}
                    </div>
                  )}
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
