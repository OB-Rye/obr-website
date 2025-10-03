// app/api/contact/route.ts
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Force Node.js runtime (not Edge) so SendGrid works
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

function required(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function POST(req: Request) {
  try {
    // 0) Parse + validate
    const data = (await req.json()) as Body;

    // Honeypot: if filled, pretend success (quietly drop spam)
    if (data._hp && String(data._hp).trim() !== "") {
      return NextResponse.json({ success: true });
    }

    const { firstName, lastName, email } = data;

    if (!required(firstName) || !required(lastName) || !required(email)) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // 1) Env vars
    const API_KEY = process.env.SENDGRID_API_KEY;
    const FROM = process.env.SENDGRID_FROM; // must be a *verified* sender in SendGrid
    const TO_LIST =
      process.env.CONTACT_TO || "obrye@obrye.global,obrye1@gmail.com";

    if (!API_KEY || !FROM) {
      return NextResponse.json(
        {
          success: false,
          message:
            "SendGrid is not configured (missing SENDGRID_API_KEY or SENDGRID_FROM).",
        },
        { status: 500 }
      );
    }

    // 2) Prepare email content
    const fullName = `${firstName} ${lastName}`.trim();
    const subject =
      (data.subject && data.subject.trim()) ||
      `New contact form submission from ${fullName}`;

    const interestsArray = Array.isArray(data.interests)
      ? data.interests
      : data.interests
      ? [data.interests]
      : [];

    const ownerText = `
New contact form submission:

Name: ${fullName}
Email: ${email}
Phone: ${data.phone || "-"}
Company: ${data.company || "-"}
Country: ${data.country || "-"}
Subject: ${subject}
Interests: ${interestsArray.join(", ") || "-"}

Message:
${data.message || "-"}
`.trim();

    const confirmationText = `
Hi ${firstName},

Thanks for reaching out — I received your message and will get back to you shortly.

Summary of your submission:
- Subject: ${subject}
- Interests: ${interestsArray.join(", ") || "-"}

Your message:
${data.message || "-"}

Best,
Ole Bent Rye
obrye@obrye.global
`.trim();

    // 3) Send emails
    sgMail.setApiKey(API_KEY);

    const toAddresses = TO_LIST.split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const ownerMsg = {
      to: toAddresses,
      from: FROM,
      replyTo: email, // so you can reply straight to the sender
      subject,
      text: ownerText,
    };

    const confirmMsg = {
      to: email,
      from: FROM,
      subject: "Thanks — I received your message",
      text: confirmationText,
    };

    // Send both (owner + confirmation)
    await sgMail.send(ownerMsg as any);
    await sgMail.send(confirmMsg as any);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Helpful error logging for troubleshooting
    const sgDetails =
      err?.response?.body ? JSON.stringify(err.response.body) : String(err);
    console.error("[/api/contact] SendGrid error:", sgDetails);

    return NextResponse.json(
      {
        success: false,
        message: "SendGrid error",
        details: sgDetails,
      },
      { status: 500 }
    );
  }
}
