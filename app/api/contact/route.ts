// app/api/contact/route.ts
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export const runtime = "nodejs"; // ensure Node runtime on Vercel

type Payload = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  company?: string;
  country?: string;
  phone?: string;
  interests?: string[] | string;
  subject?: string;
  message?: string;
  _hp?: string; // honeypot
};

const ADMIN_TO = "obrye@obrye.global";
const ADMIN_CC = "obrye1@gmail.com";
const FROM_ADDR = "noreply@obrye.global";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  try {
    const data: Payload = await req.json();

    // Honeypot check for bots
    if (data._hp) return NextResponse.json({ success: true });

    const name = data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim();
    const email = data.email;

    // 1️⃣  Admin notification
    const adminMsg = {
      to: ADMIN_TO,
      cc: ADMIN_CC,
      from: FROM_ADDR,
      subject: `New website contact from ${name || "Unknown"}`,
      text: `
New contact form submission:

Name: ${name}
Email: ${email}
Phone: ${data.phone || ""}
Company: ${data.company || ""}
Country: ${data.country || ""}
Subject: ${data.subject || "(none)"}
Interests: ${Array.isArray(data.interests) ? data.interests.join(", ") : data.interests || ""}
Message:
${data.message || "(none)"}
`,
    };

    await sgMail.send(adminMsg);

    // 2️⃣  Auto-confirmation to sender
    const confirmMsg = {
      to: email,
      from: FROM_ADDR,
      subject: "Thanks for contacting Ole Bent Rye",
      text: `Hi ${name || ""},

Thank you for reaching out! We’ve received your message and will get back to you soon.

Best regards,
Ole Bent Rye
obrye.global`,
    };

    await sgMail.send(confirmMsg);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error sending email" },
      { status: 500 }
    );
  }
}
