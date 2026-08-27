import crypto from "node:crypto";

/**
 * Razorpay client. SERVER-ONLY — the key secret must never reach the browser.
 * The publishable key id (LIVE_API_KEY) is returned to the client only so it can
 * open Razorpay Checkout; the secret (LIVE_KEY_SECRET) is used here to create
 * orders and verify payment signatures.
 *
 * Configured via .env:
 *   LIVE_API_KEY     = rzp_live_xxxxx   (key id — publishable)
 *   LIVE_KEY_SECRET  = xxxxxxxx         (key secret — keep private)
 */

const API = "https://api.razorpay.com/v1";

export function isRazorpayConfigured(): boolean {
  return !!(process.env.LIVE_API_KEY && process.env.LIVE_KEY_SECRET);
}

/** Publishable key id — safe to send to the browser. */
export function razorpayKeyId(): string {
  return process.env.LIVE_API_KEY || "";
}

function authHeader(): string {
  const id = process.env.LIVE_API_KEY || "";
  const secret = process.env.LIVE_KEY_SECRET || "";
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

export type RazorpayOrder = { id: string; amount: number; currency: string };

/** Create a Razorpay order for the given amount (in paise). */
export async function createRazorpayOrder(opts: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader() },
    body: JSON.stringify({
      amount: opts.amountPaise,
      currency: "INR",
      receipt: opts.receipt,
      notes: opts.notes ?? {},
    }),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.id) {
    throw new Error(data?.error?.description || "Could not create the payment order.");
  }
  return { id: data.id, amount: Number(data.amount), currency: data.currency };
}

/**
 * Verify a Razorpay Checkout success signature:
 *   HMAC_SHA256(`${order_id}|${payment_id}`, key_secret) === signature
 * Uses a timing-safe comparison. Returns false on any missing input.
 */
export function verifyPaymentSignature(opts: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.LIVE_KEY_SECRET || "";
  if (!secret || !opts.orderId || !opts.paymentId || !opts.signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${opts.orderId}|${opts.paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(opts.signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
