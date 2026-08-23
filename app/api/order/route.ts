import { NextResponse } from "next/server";
import { Resend } from "resend";
import { productDisplayName } from "@/lib/products";
import { generateOrderNumber, markEmailSent, saveOrder } from "@/lib/orders";

/**
 * Places a pre-order booking: saves it to Supabase, then emails the customer a
 * confirmation via Resend.
 *
 * It does NOT create a Shiprocket shipment — Shiprocket is used only to quote
 * the shipping charge at checkout (see /api/shipping-rate). Fulfilment is
 * managed manually in the Shiprocket dashboard.
 *
 * Both the DB save and the email are best-effort in the sense that a Supabase
 * outage still lets the email send; only a hard email failure returns an error
 * to the customer.
 */

export const runtime = "nodejs";

type OrderItem = {
  title: string;
  qty: number;
  priceEach: string;
  lineTotal: string;
  slug?: string;
  priceEachNum?: number;
};

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Email service not configured. Add RESEND_API_KEY to .env.local and restart the server.",
      },
      { status: 500 }
    );
  }

  type Address = {
    flat?: string;
    street?: string;
    area?: string;
    line?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    address?: Address;
    payment?: string;
    items?: OrderItem[];
    total?: string;
    subtotalNum?: number;
    /** null when no real courier quote was available */
    shippingNum?: number | null;
    shippingCourier?: string | null;
    totalNum?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    name,
    email,
    phone,
    address,
    payment,
    items,
    total,
    subtotalNum,
    shippingNum,
    shippingCourier,
    totalNum,
  } = body;
  const emailOk = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const addr = address || {};
  const addressOk = !!(addr.line && addr.city && addr.state && addr.pincode);
  if (!emailOk || !Array.isArray(items) || items.length === 0 || !addressOk) {
    return NextResponse.json(
      {
        error:
          "A valid email, complete shipping address, and at least one product are required.",
      },
      { status: 400 }
    );
  }

  // One reference shared by the DB row, the customer's email and Shiprocket.
  const orderNumber = generateOrderNumber();

  // Persist before anything else, so the order survives an email or Shiprocket
  // failure. Returns null (and logs) if Supabase isn't set up or is down —
  // never blocks the sale.
  const orderRowId = await saveOrder({
    orderNumber,
    name: name || "",
    email,
    phone,
    address: addr,
    items: items.map((i) => ({
      slug: i.slug,
      title: i.title,
      qty: Number(i.qty) || 1,
      priceEach: Number(i.priceEachNum) || 0,
      lineTotal: i.lineTotal,
    })),
    subtotal: typeof subtotalNum === "number" ? subtotalNum : 0,
    shipping: typeof shippingNum === "number" ? shippingNum : null,
    total: typeof totalNum === "number" ? totalNum : 0,
    paymentMethod: payment || "Cash on Delivery",
    shippingCourier: shippingCourier ?? null,
  });

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || "SkinSnap <onboarding@resend.dev>";
  const firstName = escapeHtml((name || "there").split(" ")[0]);

  const shipTo = escapeHtml(
    [
      name,
      addr.line,
      `${addr.city}, ${addr.state} ${addr.pincode}`,
      phone ? `Phone: ${phone}` : "",
    ]
      .filter(Boolean)
      .join("\n")
  ).replace(/\n/g, "<br>");
  const paymentLabel = escapeHtml(payment || "Cash on Delivery");

  // A real courier quote came through only when shippingNum is a number.
  const hasQuote = typeof shippingNum === "number";
  const shippingLabel = hasQuote
    ? `₹${shippingNum}${shippingCourier ? ` · ${escapeHtml(shippingCourier)}` : ""}`
    : "Charges may apply";
  const shippingNote = hasQuote
    ? "Shipping is included in the total above and is collected on delivery."
    : "Applicable shipping charges will be confirmed before dispatch and collected on delivery.";

  const rows = items
    .map(
      (it) => `
          <tr>
            <td style="padding:6px 0;color:#26221C;">${Number(it.qty) || 1} × ${escapeHtml(
              // use the real display name so the combo isn't "Combo Pack Face Pack"
              it.slug
                ? productDisplayName({ slug: it.slug, title: it.title })
                : `${it.title} Face Pack`
            )}</td>
            <td style="padding:6px 0;text-align:right;color:#26221C;">${escapeHtml(it.lineTotal || "")}</td>
          </tr>`
    )
    .join("");

  const subtotalRow =
    typeof subtotalNum === "number"
      ? `<tr>
            <td style="padding:12px 0 0;border-top:1px solid #EAE0D0;color:#6B6357;">Subtotal</td>
            <td style="padding:12px 0 0;border-top:1px solid #EAE0D0;text-align:right;color:#6B6357;">₹${subtotalNum}</td>
          </tr>`
      : "";

  const html = `
  <div style="margin:0;padding:0;background:#F6F1E9;font-family:'Helvetica Neue',Arial,sans-serif;color:#26221C;">
    <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
      <div style="font-family:Georgia,serif;font-size:26px;letter-spacing:2px;color:#26221C;">SKINSNAP</div>
      <div style="font-family:Georgia,serif;font-style:italic;color:#A15E38;font-size:15px;margin-top:4px;">Fresh Clay. Zero Mess.</div>
      <div style="height:1px;background:#E0D6C6;margin:26px 0;"></div>
      <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:30px;margin:0 0 14px;">Thank you, ${firstName}!</h1>
      <p style="font-size:15px;line-height:1.7;color:#5A5348;margin:0 0 24px;">
        We're happy to confirm your <strong>pre-order booking</strong> with SkinSnap. This is not a dispatch confirmation — we'll email you again as soon as your freshly activated face packs are ready to ship.
      </p>
      <div style="background:#FCFAF5;border:1px solid #EAE0D0;border-radius:16px;padding:22px 24px;">
        <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#A15E38;margin-bottom:4px;">Pre-Order Booking Summary</div>
        <div style="font-size:13px;color:#9B8F7C;margin-bottom:14px;">Reference: <strong style="color:#26221C;">${escapeHtml(orderNumber)}</strong></div>
        <table style="width:100%;border-collapse:collapse;font-size:15px;">
          ${rows}
          ${subtotalRow}
          <tr>
            <td style="padding:6px 0 0;color:#6B6357;">Shipping</td>
            <td style="padding:6px 0 0;text-align:right;color:#6B6357;">${shippingLabel}</td>
          </tr>
          <tr>
            <td style="padding:12px 0 0;border-top:1px solid #EAE0D0;font-weight:bold;">Total</td>
            <td style="padding:12px 0 0;border-top:1px solid #EAE0D0;text-align:right;font-weight:bold;">${escapeHtml(total || "")}</td>
          </tr>
          <tr>
            <td style="padding:6px 0 0;color:#6B6357;">Payment</td>
            <td style="padding:6px 0 0;text-align:right;color:#6B6357;">${paymentLabel}</td>
          </tr>
        </table>
        <div style="font-size:12px;color:#9B8F7C;margin-top:14px;line-height:1.6;">
          ${shippingNote}
        </div>
      </div>
      <div style="background:#FCFAF5;border:1px solid #EAE0D0;border-radius:16px;padding:22px 24px;margin-top:16px;">
        <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#A15E38;margin-bottom:12px;">Shipping To</div>
        <div style="font-size:14px;line-height:1.7;color:#26221C;">${shipTo}</div>
      </div>
      <p style="font-size:14px;line-height:1.7;color:#6B6357;margin:24px 0 0;">
        We'll be in touch soon with your dispatch details. Questions about your pre-order booking? Just reply to this email.
      </p>
      <div style="height:1px;background:#E0D6C6;margin:28px 0 18px;"></div>
      <div style="font-size:12px;color:#9B8F7C;">© 2026 SkinSnap · Freshly Activated. Naturally Beautiful.</div>
    </div>
  </div>`;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: email,
      subject: `Your SkinSnap Pre-Order Booking is confirmed 🌿`,
      html,
    });
    if (error) {
      return NextResponse.json(
        { error: error.message || "Email provider rejected the request." },
        { status: 502 }
      );
    }

    await markEmailSent(orderRowId);

    return NextResponse.json({ ok: true, orderNumber, id: data?.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send email." },
      { status: 500 }
    );
  }
}
