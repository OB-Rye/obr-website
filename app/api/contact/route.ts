// app/api/contact/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime on Vercel

type Payload = {
  firstName?: string;
  lastName?: string;
  name?: string;              // fallback if V0 uses single name field
  email: string;
  company?: string;
  country?: string;
  phone?: string;
  interests?: string[] | string;
  subject?: string;
  message: string;
  _hp?: string;               // honeypot
};

const ADMIN_TO = "obrye@obrye.global";
const ADMIN_CC = "obrye1@gmail.com";
const ADMIN_BCC = "obrye@obrye.global"; // used only on the user confirmation

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function adminHtml(p: Payload) {
  const interests = Array.isArray(p.interests) ? p.interests.join(", ") : (p.interests || "");
  const name = (p.firstName || p.lastName)
    ? `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()
    : (p.name ?? "");
  return `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif">
      <h2>New Contact Form Submission</h2>
      <table cellspacing="0" cellpadding="6" style="border-collapse:collapse">
        ${[
          ["Name", name],
          ["Email", p.email],
          ["Company", p.company || ""],
          ["Country", p.country || ""],
          ["Phone", p.phone || ""],
          ["Interests", interests],
        ].map(([k, v]) => `<tr><td style="font-weight:600">${k}</td><td>${esc(String(v))}</td></tr>`).join("")}
      </table>
      <h3 style="margin-top:16px">Message</h3>
      <div style="white-space:pre-wrap;border:1px solid #eee;padding:12px;border-radius:8px">${esc(p.message)}</div>
    </div>
  `;
}

function userHtml(p: Payload) {
  const first = p.firstName || p.name || "there";
  return `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif">
      <p>Hi ${esc(first)},</p>
      <p>Thanks for reaching out. I’ve received your message and will respond as soon as I can.</p>
      <p style="margin-top:12px">— Ole Bent Rye</p>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    // Honeypot: silently succeed if filled
    if (body._hp && body._hp.trim() !== "") return NextResponse.json({ success: true });

    const name = (body.firstName || body.lastName)
      ? `${body.firstName ?? ""} ${body.lastName ?? ""}`.trim()
      : (body.name ?? "");

    if (!name || !body.email || !body.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "SENDGRID_API_KEY not configured" }, { status: 500 });
    }

    const interests = Array.isArray(body.interests) ? body.interests : body.interests ? [body.interests] : [];

    // --- Admin email (TO + CC only; no BCC to avoid duplication) ---
    const adminMail = {
      personalizations: [
        {
          to: [{ email: ADMIN_TO }],
          cc: [{ email: ADMIN_CC }],
          subject: body.subject || "New website contact",
        },
      ],
      from: { email: "no-reply@obrye.global", name: "OBR Website" },
      reply_to: { email: body.email, name },
      content: [{ type: "text/html", value: adminHtml({ ...body, interests }) }],
    };

    // --- User confirmation (with BCC to you) ---
    const userMail = {
      personalizations: [
        {
          to: [{ email: body.email }],
          bcc: [{ email: ADMIN_BCC }],
          subject: "Thanks for your message",
        },
      ],
      from: { email: "no-reply@obrye.global", name: "Ole Bent Rye" },
      content: [{ type: "text/html", value: userHtml(body) }],
      headers: { "X-Entity-Ref-ID": String(Date.now()) }, // avoid provider dedupe
    };

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    const [r1, r2] = await Promise.all([
      fetch("https://api.sendgrid.com/v3/mail/send", { method: "POST", headers, body: JSON.stringify(adminMail) }),
      fetch("https://api.sendgrid.com/v3/mail/send", { method: "POST", headers, body: JSON.stringify(userMail) }),
    ]);

    if (!r1.ok) return NextResponse.json({ error: `SendGrid admin mail failed: ${await r1.text()}` }, { status: 502 });
    if (!r2.ok) return NextResponse.json({ error: `SendGrid user mail failed: ${await r2.text()}` }, { status: 502 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unexpected error" }, { status: 500 });
  }
}
