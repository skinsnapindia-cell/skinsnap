"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerLenis } from "@/lib/lenisControl";

/**
 * Global smooth-scroll wrapper. Sets up a single Lenis instance and syncs it
 * with GSAP's ticker + ScrollTrigger, mirroring the reference prototype's
 * `new Lenis({ duration: 1.15, smoothWheel: true })` setup.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    registerLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
