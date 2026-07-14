/**
 * Meta (Facebook) Pixel helper. The base snippet in app/layout.tsx is a
 * plain inline <script> that executes during HTML parsing — window.fbq is
 * therefore always defined (and init'd) before any React code runs, so
 * tracking calls need no queueing or init guards.
 *
 * PageViews: the snippet fires the initial one; fbevents.js's built-in
 * pushState tracking reports every client-side route change.
 */

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Track a standard pixel event. eventId enables future CAPI deduplication. */
export function fbqTrack(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  if (!FB_PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  if (eventId) {
    window.fbq("track", event, params ?? {}, { eventID: eventId });
  } else {
    window.fbq("track", event, params ?? {});
  }
}
