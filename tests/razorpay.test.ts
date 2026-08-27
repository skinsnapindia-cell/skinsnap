import { describe, it, expect, beforeAll } from "vitest";
import crypto from "node:crypto";
import { verifyPaymentSignature } from "@/lib/razorpay";

const SECRET = "test_secret_key";

beforeAll(() => {
  process.env.LIVE_KEY_SECRET = SECRET;
});

const sign = (orderId: string, paymentId: string) =>
  crypto.createHmac("sha256", SECRET).update(`${orderId}|${paymentId}`).digest("hex");

describe("verifyPaymentSignature", () => {
  it("accepts a correctly signed payment", () => {
    const orderId = "order_ABC";
    const paymentId = "pay_XYZ";
    expect(
      verifyPaymentSignature({ orderId, paymentId, signature: sign(orderId, paymentId) }),
    ).toBe(true);
  });

  it("rejects a tampered/forged signature", () => {
    expect(
      verifyPaymentSignature({ orderId: "order_ABC", paymentId: "pay_XYZ", signature: "deadbeef" }),
    ).toBe(false);
  });

  it("is bound to BOTH order id and payment id (no id swapping)", () => {
    const sig = sign("order_ABC", "pay_XYZ");
    expect(
      verifyPaymentSignature({ orderId: "order_ABC", paymentId: "pay_OTHER", signature: sig }),
    ).toBe(false);
    expect(
      verifyPaymentSignature({ orderId: "order_OTHER", paymentId: "pay_XYZ", signature: sig }),
    ).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(verifyPaymentSignature({ orderId: "", paymentId: "", signature: "" })).toBe(false);
  });
});
