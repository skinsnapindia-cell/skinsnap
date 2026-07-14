"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { fbqInit, fbqPageView } from "@/lib/fbpixel";

/**
 * Initialises the Meta Pixel and fires PageView on load + every route
 * change. Rendered from the root layout inside <Suspense>. The remote
 * fbevents.js script is loaded separately in app/layout.tsx.
 */
export default function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    fbqInit();
    fbqPageView(pathname);
  }, [pathname]);

  return null;
}
