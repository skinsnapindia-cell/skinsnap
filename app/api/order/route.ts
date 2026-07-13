import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * The ONLY server-side code in this project.
 *
 * Resend requires a secret API key and blocks direct browser (CORS) calls, so
 * the confirmation email cannot be sent from the frontend alone. This tiny
 * relay does one thing: send the order-confirmation email. There is no
 * database and no other backend logic.
 *
 * Configure via .env.local:
 *   RESEND_API_KEY=re_xxxxxxxx
 *   RESEND_FROM="SkinSnap <onboarding@resend.dev>"   (optional)
 */

export const runtime = "nodejs";

type OrderItem = { title: string; qty: number; priceEach: string; lineTotal: string };

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

  type Address = { line?: string; city?: string; state?: string; pincode?: string };
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    address?: Address;
    payment?: string;
    items?: OrderItem[];
    total?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, phone, address, payment, items, total } = body;
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

  const rows = items
    .map(
      (it) => `
          <tr>
            <td style="padding:6px 0;color:#26221C;">${Number(it.qty) || 1} × ${escapeHtml(it.title)} Face Pack</td>
            <td style="padding:6px 0;text-align:right;color:#26221C;">${escapeHtml(it.lineTotal || "")}</td>
          </tr>`
    )
    .join("");

  const html = `
  <div style="margin:0;padding:0;background:#F6F1E9;font-family:'Helvetica Neue',Arial,sans-serif;color:#26221C;">
    <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
      <div style="font-family:Georgia,serif;font-size:26px;letter-spacing:2px;color:#26221C;">SKINSNAP</div>
      <div style="font-family:Georgia,serif;font-style:italic;color:#A15E38;font-size:15px;margin-top:4px;">Fresh Clay. Zero Mess.</div>
      <div style="height:1px;background:#E0D6C6;margin:26px 0;"></div>
      <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:30px;margin:0 0 14px;">Thank you, ${firstName}!</h1>
      <p style="font-size:15px;line-height:1.7;color:#5A5348;margin:0 0 24px;">
        We've received your order. Your freshly activated face pack ritual is on the way.
      </p>
      <div style="background:#FCFAF5;border:1px solid #EAE0D0;border-radius:16px;padding:22px 24px;">
        <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#A15E38;margin-bottom:14px;">Order Summary</div>
        <table style="width:100%;border-collapse:collapse;font-size:15px;">
          ${rows}
          <tr>
            <td style="padding:12px 0 0;border-top:1px solid #EAE0D0;font-weight:bold;">Total</td>
            <td style="padding:12px 0 0;border-top:1px solid #EAE0D0;text-align:right;font-weight:bold;">${escapeHtml(total || "")}</td>
          </tr>
          <tr>
            <td style="padding:6px 0 0;color:#6B6357;">Payment</td>
            <td style="padding:6px 0 0;text-align:right;color:#6B6357;">${paymentLabel}</td>
          </tr>
        </table>
      </div>
      <div style="background:#FCFAF5;border:1px solid #EAE0D0;border-radius:16px;padding:22px 24px;margin-top:16px;">
        <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#A15E38;margin-bottom:12px;">Shipping To</div>
        <div style="font-size:14px;line-height:1.7;color:#26221C;">${shipTo}</div>
      </div>
      <p style="font-size:14px;line-height:1.7;color:#6B6357;margin:24px 0 0;">
        Press the rose water chamber, massage 10–15 seconds, tear, and glow.
        Questions? Just reply to this email.
      </p>
      <div style="height:1px;background:#E0D6C6;margin:28px 0 18px;"></div>
      <div style="font-size:12px;color:#9B8F7C;">© 2026 SkinSnap · Freshly Activated. Naturally Beautiful.</div>
    </div>
  </div>`;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: email,
      subject: `Your SkinSnap order is confirmed 🌿`,
      html,
    });
    if (error) {
      return NextResponse.json(
        { error: error.message || "Email provider rejected the request." },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send email." },
      { status: 500 }
    );
  }
}
