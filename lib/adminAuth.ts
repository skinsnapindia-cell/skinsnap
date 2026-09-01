import { createHmac, timingSafeEqual } from "crypto";

/**
 * Admin authentication. SERVER-ONLY.
 *
 * A single shared password (env `ADMIN_PASSWORD`) gates the /admin dashboard.
 * On successful login we set an httpOnly cookie whose value is an HMAC derived
 * from the password — so the cookie can be verified statelessly on every
 * request without a session store, and stealing the cookie never reveals the
 * password. Rotating `ADMIN_PASSWORD` instantly invalidates every session.
 */

export const ADMIN_COOKIE = "ss_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

/** The cookie value we expect for an authed session, or null if unconfigured. */
export function expectedToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < 12) return null;
  return createHmac("sha256", pw).update("skinsnap-admin-session-v1").digest("hex");
}

export function isAdminConfigured(): boolean {
  return expectedToken() !== null;
}

/** Constant-time comparison of two strings. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** True when the submitted password matches `ADMIN_PASSWORD`. */
export function verifyPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || typeof input !== "string") return false;
  return safeEqual(input, pw);
}

/** Read our session cookie out of a raw request's Cookie header. */
function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

/** True when the request carries a valid admin session cookie. */
export function isAuthedRequest(req: Request): boolean {
  const token = expectedToken();
  if (!token) return false;
  const got = readCookie(req, ADMIN_COOKIE);
  if (!got) return false;
  return safeEqual(got, token);
}
