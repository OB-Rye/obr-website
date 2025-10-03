// app/api/contact/route.ts
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// ✅ Force Node.js runtime (SendGrid does not work on Edge runtime)
export const runtime = "nodejs";

type Body = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  country?: string;
  subject?: string;
  message?: string;
  interests?: string[] | string;
  _hp?: string | null; // honeypot
};

// helper to check required string
function reqd(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as Body;

    // Honeypot: if filled, silently succeed (spam prevention)
    if (data._hp && String(data._hp).trim() !== "") {
      return NextResponse.json({ success: true });
    }

    const { firstName, lastName, email } = data;
    if (!reqd(firstName) || !reqd(lastName) || !reqd(email)) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (firstName, lastName, email)." },
        { status: 400 }
      );
    }

    // Load env vars
    const API_KEY = process.env.SENDGRID_API_KEY;
    const FROM = process.env.SENDGRID_FROM; // must be verified sender
    const TO_LIST = process.env.CONTACT_TO || "obrye@obrye.global,obrye1@gmail.com";

    if (!API_KEY || !FROM) {
      return NextResponse.json(
        { success: false, message: "SendGrid not configured (missing SENDGRID_API_KEY or SENDGRID_FROM)." },
        { status: 500 }
      );
    }

    sgMail.setApiKey(API_KEY);

    const fullName = `${firstName} ${lastName}`.trim();
    const subject =
      (data.subject && data.subject.trim()) ||
      `New contact form submission from ${fullName}`;

    const interestsArr = Array.isArray(data.interests)
      ? data.interests
      : data.interests
      ? [data.interests]
      : [];

    // Message for you
    const ownerText = `
New contact form submission:

Name: ${fullName}
Email: ${email}
Phone: ${data.phone || "-"}
Company: ${data.company || "-"}
Country: ${data.country || "-"}
Subject: ${subject}
Interests: ${interestsArr.join(", ") || "-"}

Message:
${data.message || "-"}
    `.trim();

    // Confirmation for sender
    const confirmationText = `
Hi ${firstName},

Thanks for reaching out — I received your message and will get back to you shortly.

Summary:
- Subject: ${subject}
- Interests: ${interestsArr.join(", ") || "-"}

Your message:
${data.message || "-"}

Best,  
Ole Bent Rye  
obrye@obrye.global
    `.trim();

    const toAddresses = TO_LIST.split(",").map((s) => s.trim()).filter(Boolean);

    // Send to you
    await sgMail.send({
      to: toAddresses,
      from: FROM,
      replyTo: email,
      subject,
      text: ownerText,
    } as any);

    // Auto-confirmation to sender
    await sgMail.send({
      to: email,
      from: FROM,
      subject: "Thanks — I received your message",
      text: confirmationText,
    } as any);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const sgDetails =
      err?.response?.body ? JSON.stringify(err.response.body) : String(err);
    console.error("[/api/contact] SendGrid error:", sgDetails);

    return NextResponse.json(
      { success: false, message: "SendGrid error", details: sgDetails },
      { status: 500 }
    );
  }
}
