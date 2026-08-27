"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Runs before the browser paints on the client; falls back to useEffect during
// SSR so React doesn't warn.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductPouch from "@/components/ProductPouch";
import { products } from "@/lib/products";
import { useReveals } from "@/lib/useReveals";

export default function HomePage() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const petalsRef = useRef<HTMLDivElement>(null);
  const pouchRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useReveals(scopeRef, { hero: false });

  const restart = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(
      () => setSlide((s) => (s + 1) % products.length),
      3500,
    );
  };

  // autoplay slider
  useEffect(() => {
    restart();
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, []);

  // Hero intro — runs before paint so the copy never flashes in fully-opaque
  // and then jumps to the animation's start state.
  useIsoLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce || !heroContentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(heroContentRef.current!.querySelectorAll("[data-hero]"), {
        y: 34,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.1,
      });
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  // petals + parallax
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // petals + clay particles drifting through the hero
      const petals = petalsRef.current;
      const cleanups: Array<() => void> = [];
      if (petals) {
        const W = petals.clientWidth || window.innerWidth;
        for (let i = 0; i < 16; i++) {
          const isClay = i % 3 === 0;
          const d = document.createElement("div");
          const s = isClay ? 5 + Math.random() * 4 : 9 + Math.random() * 8;
          d.style.cssText = `position:absolute;top:-40px;left:${
            Math.random() * W
          }px;width:${s}px;height:${isClay ? s : s * 1.4}px;border-radius:${
            isClay ? "50%" : "0 60% 0 60%"
          };background:${
            isClay ? "rgba(176,138,85,0.5)" : "rgba(217,168,166,0.7)"
          };opacity:0;`;
          petals.appendChild(d);
          const fall = () => {
            gsap.set(d, {
              y: 0,
              x: 0,
              rotation: Math.random() * 180,
              opacity: 0,
              left: Math.random() * W + "px",
            });
            gsap.to(d, { opacity: isClay ? 0.6 : 0.85, duration: 1 });
            gsap.to(d, {
              y: window.innerHeight + 80,
              x: (Math.random() - 0.5) * 160,
              rotation: "+=220",
              duration: 7 + Math.random() * 6,
              ease: "none",
              delay: Math.random() * 4,
              onComplete: fall,
            });
          };
          fall();
        }
      }

      // mouse parallax on the pouch
      const hero = heroRef.current;
      const onMove = (e: MouseEvent) => {
        const cx = e.clientX / window.innerWidth - 0.5;
        const cy = e.clientY / window.innerHeight - 0.5;
        gsap.to(pouchRef.current, {
          x: cx * 24,
          y: cy * 18,
          scale: 1.06,
          duration: 1,
          ease: "power2.out",
          overwrite: "auto",
        });
      };
      if (hero) {
        hero.addEventListener("mousemove", onMove);
        cleanups.push(() => hero.removeEventListener("mousemove", onMove));
      }

      return () => cleanups.forEach((c) => c());
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="wrap" ref={scopeRef}>
      <Nav active="home" />

      {/* HERO */}
      <section ref={heroRef} className="home-hero">
        {/* full-bleed product slider as the header background */}
        <div ref={pouchRef} className="home-hero__bg">
          {products.map((p, i) => (
            <Image
              key={p.slug}
              src={p.img}
              alt={`${p.title} Face Pack`}
              fill
              priority={i === 0}
              sizes="100vw"
              style={{
                objectFit: "cover",
                opacity: i === slide ? 1 : 0,
                transition: "opacity 1s ease",
                willChange: "opacity",
              }}
            />
          ))}
        </div>

        {/* white blend so the left-side copy stays readable over the image */}
        <div className="home-hero__scrim" />

        {/* drifting petals + clay particles */}
        <div
          ref={petalsRef}
          className="home-hero__petals"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        />

        {/* copy */}
        <div ref={heroContentRef} className="home-hero__copy">
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
            100% Natural · Freshly Mixed
          </div>
          <h1 data-hero className="home-hero__title">
            Pure Clay.
            <br />
            <em style={{ color: "#B97C79" }}>Freshly Mixed.</em>
          </h1>
          <p
            data-hero
            style={{
              fontSize: 18,
              color: "#5A5348",
              maxWidth: 440,
              margin: "26px 0 0",
              lineHeight: 1.6,
            }}
          >
            100% natural face-pack powders in a 50g jar — mixed fresh at home,
            designed for modern skincare.
          </p>
          <div
            data-hero
            className="hero-cta"
            style={{
              display: "flex",
              gap: 16,
              marginTop: 38,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/products"
              style={{
                background: "#26221C",
                color: "#F6F1E9",
                borderRadius: 999,
                padding: "16px 36px",
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 16px 30px -14px rgba(38,34,28,0.5)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#A15E38")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#26221C")
              }
            >
              Shop Now
            </Link>
            <Link
              href="/how-it-works"
              style={{
                background: "rgba(255,255,255,0.6)",
                color: "#26221C",
                border: "1px solid #D7CCBB",
                borderRadius: 999,
                padding: "16px 36px",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#26221C")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#D7CCBB")
              }
            >
              How It Works
            </Link>
          </div>
        </div>

        {/* slide dots */}
        <div className="home-hero__dots">
          {products.map((p, i) => (
            <button
              key={p.slug}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                setSlide(i);
                restart();
              }}
              style={{
                width: i === slide ? 26 : 8,
                height: 8,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                padding: 0,
                background: i === slide ? "#A15E38" : "rgba(38,34,28,0.3)",
                transition: "background 0.4s ease, width 0.4s ease",
              }}
            />
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section
        className="section-pad"
        style={{ padding: "130px 48px", background: "#F6F1E9" }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div data-reveal style={{ textAlign: "center", marginBottom: 64 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#A15E38",
              }}
            >
              The Collection
            </div>
            <h2
              className="section-title h-xl"
              style={{ fontSize: 56, margin: "16px 0 0" }}
            >
              One family. Four rituals.
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "#6B6357",
                maxWidth: 520,
                margin: "18px auto 0",
                lineHeight: 1.6,
              }}
            >
              Every jar is the same pure, natural powder — mixed fresh, the
              moment you need it.
            </p>
          </div>
          <div
            className="grid-2"
            style={{ gap: 40, maxWidth: 920, margin: "0 auto" }}
          >
            {products.map((p) => (
              <div data-reveal key={p.slug} style={{ height: "100%" }}>
                <ProductPouch product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INNOVATION STRIP */}
      <section
        className="section-pad"
        style={{
          padding: "130px 48px",
          background: "#26221C",
          color: "#F6F1E9",
        }}
      >
        <div
          className="innovation-grid"
          style={{
            maxWidth: 720,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 0,
            alignItems: "center",
          }}
        >
          <div data-reveal>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#E8CBB2",
              }}
            >
              The Idea
            </div>
            <h2
              className="section-title h-lg"
              style={{ fontSize: 48, margin: "16px 0 20px", lineHeight: 1.1 }}
            >
              Pure powder.
              <br />
              Mixed fresh by you.
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "#C9C1B3",
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              50g of pure, natural face-pack powder in every jar — no
              preservatives, no chemicals. Scoop a spoonful, mix with water or
              rose water, and apply a freshly mixed face pack every single time.
            </p>
            <Link
              href="/how-it-works"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "#E8CBB2",
                color: "#26221C",
                borderRadius: 999,
                padding: "15px 32px",
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F6F1E9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#E8CBB2")
              }
            >
              See how it works →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
