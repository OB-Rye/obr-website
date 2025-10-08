// app/api/contact/route.ts
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export const runtime = "nodejs";

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

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: Request) {
  try {
    const data: Payload = await req.json();

    // Honeypot (bots)
    if (data._hp) return NextResponse.json({ success: true });

    const name =
      (data.name || `${data.firstName || ""} ${data.lastName || ""}`)?.trim() || "Unknown";
    const email = data.email;

    // --- Build messages
    const adminMsg = {
      to: ADMIN_TO,
      cc: ADMIN_CC,
      from: FROM_ADDR,
      replyTo: email ? { email, name } : undefined,
      subject: `New website contact from ${name}`,
      text:
        `New contact form submission\n\n` +
        `Name: ${name}\n` +
        `Email: ${email || ""}\n` +
        `Phone: ${data.phone || ""}\n` +
        `Company: ${data.company || ""}\n` +
        `Country: ${data.country || ""}\n` +
        `Subject: ${data.subject || "(none)"}\n` +
        `Interests: ${
          Array.isArray(data.interests) ? data.interests.join(", ") : data.interests || ""
        }\n\n` +
        `Message:\n${data.message || "(none)"}\n`,
      headers: { "X-OBR-Email": "admin" },
      categories: ["obr-contact", "admin"],
    };

    const confirmMsg = {
      to: email,
      // ✅ BCC admin so you always receive a copy of the confirmation
      bcc: ADMIN_TO,
      from: FROM_ADDR,
      subject: "Thanks for contacting Ole Bent Rye",
      text:
        `Hi ${name},\n\n` +
        `Thank you for reaching out! We’ve received your message and will get back to you soon.\n\n` +
        `Best regards,\n` +
        `Ole Bent Rye\n` +
        `obrye.global\n`,
      headers: { "X-OBR-Email": "confirmation" },
      categories: ["obr-contact", "confirmation"],
    };

    // --- Ensure admin mail goes out (retry a couple times if transient issue)
    try {
      await sgMail.send(adminMsg);
    } catch {
      await delay(250);
      try {
        await sgMail.send(adminMsg);
      } catch {
        await delay(750);
        try {
          await sgMail.send(adminMsg);
        } catch {
          return NextResponse.json(
            { success: false, message: "Admin email could not be sent" },
            { status: 502 }
          );
        }
      }
    }

    // --- Send confirmation (with BCC to admin)
    await sgMail.send(confirmMsg);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "Error sending email" }, { status: 500 });
  }
}
