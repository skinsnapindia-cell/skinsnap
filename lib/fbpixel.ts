/**
 * Meta (Facebook) Pixel helpers. The base snippet in app/layout.tsx defines a
 * queueing window.fbq stub, but it loads afterInteractive — React effects and
 * click handlers can run before it exists on a hard load. fbqTrack creates
 * the same queueing stub on demand so no event is ever dropped; the real
 * fbevents.js drains the queue when it arrives (same fix as GoogleAnalytics).
 */

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

type FbqParams = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: FbqStub;
    _fbq?: FbqStub;
  }
}

type FbqStub = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: FbqStub;
  loaded: boolean;
  version: string;
  /** set by whichever code path queued fbq('init') first */
  __ssInit?: boolean;
  /** stop fbevents.js auto-firing PageView on pushState/replaceState —
   * Next.js history updates otherwise double-count our manual PageViews */
  disablePushState?: boolean;
};

function ensureFbq(): FbqStub | undefined {
  if (typeof window === "undefined") return undefined;
  if (window.fbq) {
    window.fbq.disablePushState = true;
    return window.fbq;
  }
  const stub = function (this: unknown) {
    if (stub.callMethod) {
      // biome-ignore lint/complexity/noArguments: Meta's stub must forward the live Arguments object
      stub.callMethod.apply(stub, arguments as unknown as unknown[]);
    } else {
      // biome-ignore lint/complexity/noArguments: Meta's stub must forward the live Arguments object
      stub.queue.push(arguments);
    }
  } as FbqStub;
  stub.queue = [];
  stub.push = stub;
  stub.loaded = true;
  stub.version = "2.0";
  stub.disablePushState = true;
  window.fbq = stub;
  window._fbq = stub;
  return stub;
}

/**
 * Returns fbq with `init` guaranteed to have been queued first. Effect
 * ordering means a page's ViewContent can otherwise reach the queue before
 * MetaPixel's init — fbevents.js silently drops events tracked before init.
 * The flag lives on the fbq object itself so the inline stub in
 * app/layout.tsx and this module can't double-init.
 */
function ensureInit(): FbqStub | undefined {
  if (!FB_PIXEL_ID) return undefined;
  const fbq = ensureFbq();
  if (!fbq) return undefined;
  if (!fbq.__ssInit) {
    fbq.__ssInit = true;
    fbq("init", FB_PIXEL_ID);
  }
  return fbq;
}

/** Track a standard pixel event. eventId enables future CAPI deduplication. */
export function fbqTrack(event: string, params?: FbqParams, eventId?: string) {
  const fbq = ensureInit();
  if (!fbq) return;
  if (eventId) {
    fbq("track", event, params ?? {}, { eventID: eventId });
  } else {
    fbq("track", event, params ?? {});
  }
}

let lastPageViewPath: string | null = null;

/** Fires PageView once per path change (guards double-mount re-fires). */
export function fbqPageView(path: string) {
  if (path === lastPageViewPath) return;
  const fbq = ensureInit();
  if (!fbq) return;
  lastPageViewPath = path;
  fbq("track", "PageView");
}

export function fbqInit() {
  ensureInit();
}
