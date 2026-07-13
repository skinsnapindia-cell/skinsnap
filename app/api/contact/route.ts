import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * Sends a thank-you email to whoever submits the Contact page form. Same
 * pattern as /api/order — a minimal Resend relay, no database, no other
 * backend logic.
 *
 * Configure via .env.local:
 *   RESEND_API_KEY=re_xxxxxxxx
 *   RESEND_FROM="SkinSnap <onboarding@resend.dev>"   (optional)
 */

export const runtime = "nodejs";

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

  let body: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, phone, subject, message } = body;
  const emailOk = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk || !name || !message) {
    return NextResponse.json(
      { error: "Name, a valid email, and a message are required." },
      { status: 400 }
    );
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || "SkinSnap <onboarding@resend.dev>";
  const firstName = escapeHtml(name.split(" ")[0]);
  const safeSubject = escapeHtml(subject || "General enquiry");
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  const safePhone = phone ? escapeHtml(phone) : "";

  const html = `
  <div style="margin:0;padding:0;background:#F6F1E9;font-family:'Helvetica Neue',Arial,sans-serif;color:#26221C;">
    <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
      <div style="font-family:Georgia,serif;font-size:26px;letter-spacing:2px;color:#26221C;">SKINSNAP</div>
      <div style="font-family:Georgia,serif;font-style:italic;color:#A15E38;font-size:15px;margin-top:4px;">Fresh Clay. Zero Mess.</div>
      <div style="height:1px;background:#E0D6C6;margin:26px 0;"></div>
      <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:30px;margin:0 0 14px;">Thank you, ${firstName}!</h1>
      <p style="font-size:15px;line-height:1.7;color:#5A5348;margin:0 0 24px;">
        We've received your message and will get back to you within one business day.
      </p>
      <div style="background:#FCFAF5;border:1px solid #EAE0D0;border-radius:16px;padding:22px 24px;">
        <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#A15E38;margin-bottom:12px;">Your Message</div>
        <div style="font-size:14px;color:#6B6357;margin-bottom:10px;"><strong style="color:#26221C;">Subject:</strong> ${safeSubject}</div>
        ${safePhone ? `<div style="font-size:14px;color:#6B6357;margin-bottom:10px;"><strong style="color:#26221C;">Phone:</strong> ${safePhone}</div>` : ""}
        <div style="font-size:14px;line-height:1.7;color:#26221C;">${safeMessage}</div>
      </div>
      <p style="font-size:14px;line-height:1.7;color:#6B6357;margin:24px 0 0;">
        Need to add anything? Just reply to this email — it comes straight to our team.
      </p>
      <div style="height:1px;background:#E0D6C6;margin:28px 0 18px;"></div>
      <div style="font-size:12px;color:#9B8F7C;">© 2026 SkinSnap · Freshly Activated. Naturally Beautiful.</div>
    </div>
  </div>`;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: email,
      subject: "Thanks for reaching out to SkinSnap 🌿",
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
