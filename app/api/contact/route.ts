// app/api/contact/route.ts
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export const runtime = "nodejs"; // ensure Node runtime on Vercel

type Payload = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  country?: string;
  subject?: string;
  message?: string;
  interests?: string[] | string;
  _hp?: string | null; // honeypot
};

function reqd(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

function joinInterests(v: string[] | string | undefined) {
  if (!v) return "";
  return Array.isArray(v) ? v.join(", ") : v;
}

async function sendViaSendGrid(data: Required<Pick<Payload, "email">> & Payload) {
  const API_KEY = process.env.SENDGRID_API_KEY?.trim();
  // Fallback: allow either SENDGRID_FROM or MAIL_FROM
  const FROM =
    process.env.SENDGRID_FROM?.trim() ||
    process.env.MAIL_FROM?.trim() ||
    "";

  if (!API_KEY || !FROM) {
    return {
      ok: false,
      code: "SG_MISSING_CONFIG",
      message: "SendGrid not configured",
      details: {
        has_SENDGRID_API_KEY: !!API_KEY,
        has_SENDGRID_FROM: !!process.env.SENDGRID_FROM,
        has_MAIL_FROM: !!process.env.MAIL_FROM,
      },
    };
  }

  sgMail.setApiKey(API_KEY);

  // Admin recipients for inbound notification
  const toAddresses = (process.env.CONTACT_TO || "obrye@obrye.global,obrye1@gmail.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Who should be BCC’d on the confirmation back to the sender
  const confirmationBcc = (process.env.CONFIRMATION_BCC || "obrye@obrye.global")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const fullName = `${data.firstName || ""} ${data.lastName || ""} ${data.name || ""}`.trim();
  const subject =
    (data.subject && data.subject.trim()) ||
    `New contact form submission from ${fullName || data.email}`;

  const ownerText = `
New contact form submission

Name: ${fullName || "-"}
Email: ${data.email}
Phone: ${data.phone || "-"}
Company: ${data.company || "-"}
Country: ${data.country || "-"}
Subject: ${subject}
Interests: ${joinInterests(data.interests) || "-"}

Message:
${data.message || "-"}
`.trim();

  const confirmText = `
Hi ${data.firstName || fullName || ""},

Thanks for your message — I received it and will get back to you shortly.

Subject: ${subject}
Interests: ${joinInterests(data.interests) || "-"}

Your message:
${data.message || "-"}

Best,
Ole Bent Rye
obrye@obrye.global
`.trim();

  try {
    // 1) Send notification to you (admin)
    await sgMail.send({
      to: toAddresses,
      from: FROM,
      replyTo: reqd(data.email) ? data.email : undefined,
      subject,
      text: ownerText,
    } as any);

    // 2) Send confirmation to the sender, BCC you on it
    if (reqd(data.email)) {
      await sgMail.send({
        to: data.email,
        from: FROM,
        bcc: confirmationBcc, // copy of confirmation to you
        subject: "Thanks — I received your message",
        text: confirmText,
      } as any);
    }

    return { ok: true };
  } catch (err: any) {
    const details = err?.response?.body ?? err?.message ?? String(err);
    console.error("[/api/contact] SendGrid error:", details);
    return {
      ok: false,
      code: "SG_SEND_FAILED",
      message: "SendGrid send failed",
      details,
    };
  }
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as Payload;

    // Honeypot: if filled, quietly pass as success
    if (data._hp && String(data._hp).trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // Basic validation
    if (!reqd(data.email)) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }
    if (!reqd(data.message)) {
      return NextResponse.json(
        { success: false, message: "Message is required." },
        { status: 400 }
      );
    }

    const result = await sendViaSendGrid(data as Required<Pick<Payload, "email">> & Payload);
    if (result.ok) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(
      { success: false, message: result.message, details: result.details },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("[/api/contact] API error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
