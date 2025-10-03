// app/api/contact/route.ts
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export const runtime = "nodejs"; // SendGrid requires Node runtime

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
  const API_KEY = process.env.SENDGRID_API_KEY;
  const FROM = process.env.SENDGRID_FROM;

  if (!API_KEY || !FROM) {
    return { ok: false, code: "SG_MISSING_CONFIG", message: "SendGrid not configured" };
  }

  sgMail.setApiKey(API_KEY);

  const toAddresses = (process.env.CONTACT_TO || "obrye@obrye.global,obrye1@gmail.com")
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
    // send to you
    await sgMail.send({
      to: toAddresses,
      from: FROM,
      replyTo: data.email,
      subject,
      text: ownerText,
    } as any);

    // confirmation to sender
    if (reqd(data.email)) {
      await sgMail.send({
        to: data.email,
        from: FROM,
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

async function sendViaResend(data: Required<Pick<Payload, "email">> & Payload) {
  const API_KEY = process.env.RESEND_API_KEY;
  if (!API_KEY) {
    return { ok: false, code: "RESEND_MISSING_CONFIG", message: "Resend not configured" };
  }

  const toAddresses = (process.env.CONTACT_TO || "obrye@obrye.global,obrye1@gmail.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const fullName = `${data.firstName || ""} ${data.lastName || ""} ${data.name || ""}`.trim();
  const subject =
    (data.subject && data.subject.trim()) ||
    `New contact form submission from ${fullName || data.email}`;

  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${fullName || "-"}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone || "-"}</p>
    <p><strong>Company:</strong> ${data.company || "-"}</p>
    <p><strong>Country:</strong> ${data.country || "-"}</p>
    <p><strong>Interests:</strong> ${joinInterests(data.interests) || "-"}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong><br/>${(data.message || "").replace(/\n/g, "<br/>")}</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "OBR Contact <onboarding@resend.dev>",
        to: toAddresses,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[/api/contact] Resend error:", text);
      return { ok: false, code: "RESEND_SEND_FAILED", message: "Resend send failed", details: text };
    }

    // Optional: also send confirmation via Resend (only if you’ve verified a from domain/address)
    // Skipped to keep fallback simple.

    return { ok: true };
  } catch (err: any) {
    console.error("[/api/contact] Resend error:", err);
    return { ok: false, code: "RESEND_SEND_FAILED", message: "Resend send failed", details: String(err) };
  }
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as Payload;

    // Honeypot: if filled, quietly pass as success
    if (data._hp && String(data._hp).trim() !== "") {
      return NextResponse.json({ success: true });
    }

    if (!reqd(data.email)) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    // 1) If SendGrid is configured, use it and return its precise error if it fails
    const hasSendGrid = !!process.env.SENDGRID_API_KEY && !!process.env.SENDGRID_FROM;

    if (hasSendGrid) {
      const sg = await sendViaSendGrid(data as Required<Pick<Payload, "email">> & Payload);
      if (sg.ok) return NextResponse.json({ success: true });
      // If SendGrid failed, surface its error to help fix quickly (don’t mask with fallback)
      return NextResponse.json({ success: false, message: sg.message, details: sg.details }, { status: 500 });
    }

    // 2) Otherwise, try Resend as a fallback (works even without verified domain via onboarding@resend.dev)
    const rs = await sendViaResend(data as Required<Pick<Payload, "email">> & Payload);
    if (rs.ok) return NextResponse.json({ success: true });
    return NextResponse.json({ success: false, message: rs.message, details: rs.details }, { status: 500 });
  } catch (err: any) {
    console.error("[/api/contact] API error:", err);
    return NextResponse.json({ success: false, message: "Server error", details: String(err) }, { status: 500 });
  }
}
