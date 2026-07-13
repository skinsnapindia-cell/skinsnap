"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Wires the scroll/entrance animations used across the site:
 *  - [data-hero]   : staggered intro on load
 *  - [data-reveal] : rise-and-fade as it scrolls into view
 * Respects prefers-reduced-motion by leaving everything visible.
 *
 * Pass `{ hero: false }` when the caller animates [data-hero] itself (the home
 * page runs its own pre-paint intro) — this avoids a double-animation flicker.
 */
export function useReveals(
  scopeRef: React.RefObject<HTMLElement>,
  options: { hero?: boolean } = {}
) {
  const animateHero = options.hero !== false;

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);
    let failSafe: ReturnType<typeof setTimeout> | undefined;
    let refresh: ReturnType<typeof setTimeout> | undefined;

    const ctx = gsap.context(() => {
      if (animateHero) {
        // Fail-safe: if fonts/scripts stall, force hero visible after a beat.
        failSafe = setTimeout(() => {
          gsap.utils.toArray<HTMLElement>("[data-hero]").forEach((el) => {
            if (parseFloat(getComputedStyle(el).opacity) < 0.1)
              gsap.set(el, { opacity: 1, y: 0 });
          });
        }, 1600);

        gsap.utils.toArray<HTMLElement>("[data-hero]").forEach((el, i) => {
          gsap.from(el, {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            delay: 0.1 + i * 0.11,
          });
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      refresh = setTimeout(() => ScrollTrigger.refresh(), 300);
    }, scope);

    return () => {
      if (failSafe) clearTimeout(failSafe);
      if (refresh) clearTimeout(refresh);
      ctx.revert();
    };
  }, [scopeRef, animateHero]);
}
