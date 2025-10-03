import { NextResponse } from "next/server";
import sendgrid from "@sendgrid/mail";

export const runtime = "nodejs"; // ensure Node runtime on Vercel

type Payload = {
  firstName?: string;
  lastName?: string;
  name?: string; // fallback if only one name field
  email: string;
  company?: string;
  country?: string;
  phone?: string;
  interests?: string[] | string;
  subject?: string;
  message: string;
  _hp?: string; // honeypot
};

// Try SendGrid first
async function sendWithSendGrid(data: Payload) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM;

  if (!apiKey || !from) {
    return { ok: false, error: "SendGrid not configured" };
  }

  sendgrid.setApiKey(apiKey);

  const interests = Array.isArray(data.interests)
    ? data.interests.join(", ")
    : data.interests || "";

  const msg = {
    to: ["obrye@obrye.global", "obrye1@gmail.com"],
    from,
    subject: data.subject || "New Contact Form Submission",
    text: `
New contact form submission:

Name: ${data.firstName || ""} ${data.lastName || ""} ${data.name || ""}
Email: ${data.email}
Company: ${data.company || ""}
Country: ${data.country || ""}
Phone: ${data.phone || ""}
Interests: ${interests}
Subject: ${data.subject || ""}
Message: ${data.message || ""}
    `,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.firstName || ""} ${data.lastName || ""} ${data.name || ""}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Company:</strong> ${data.company || ""}</p>
      <p><strong>Country:</strong> ${data.country || ""}</p>
      <p><strong>Phone:</strong> ${data.phone || ""}</p>
      <p><strong>Interests:</strong> ${interests}</p>
      <p><strong>Subject:</strong> ${data.subject || ""}</p>
      <p><strong>Message:</strong><br/>${data.message || ""}</p>
    `,
  };

  try {
    await sendgrid.send(msg);
    return { ok: true };
  } catch (err: any) {
    console.error("SendGrid error:", err);
    return { ok: false, error: err.message || "SendGrid send failed" };
  }
}

// Fallback: Resend
async function sendWithResend(data: Payload) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { ok: false, error: "Resend not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "no-reply@obrye.global",
        to: ["obrye@obrye.global", "obrye1@gmail.com"],
        subject: data.subject || "New Contact Form Submission",
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.firstName || ""} ${data.lastName || ""} ${data.name || ""}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Company:</strong> ${data.company || ""}</p>
          <p><strong>Country:</strong> ${data.country || ""}</p>
          <p><strong>Phone:</strong> ${data.phone || ""}</p>
          <p><strong>Interests:</strong> ${Array.isArray(data.interests) ? data.interests.join(", ") : data.interests || ""}</p>
          <p><strong>Subject:</strong> ${data.subject || ""}</p>
          <p><strong>Message:</strong><br/>${data.message || ""}</p>
        `,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Resend failed: ${text}`);
    }

    return { ok: true };
  } catch (err: any) {
    console.error("Resend error:", err);
    return { ok: false, error: err.message || "Resend send failed" };
  }
}

export async function POST(req: Request) {
  try {
    const data: Payload = await req.json();

    // Honeypot spam check
    if (data._hp) {
      console.warn("Spam bot blocked via honeypot");
      return NextResponse.json({ success: true });
    }

    // Try SendGrid first
    let result = await sendWithSendGrid(data);

    if (!result.ok) {
      console.warn("SendGrid failed, falling back to Resend:", result.error);
      result = await sendWithResend(data);
    }

    if (result.ok) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: result.error || "All providers failed" });
    }
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" });
  }
}
