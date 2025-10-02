import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export const runtime = "nodejs"; // explicit runtime

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "All fields (name, email, message) are required." },
        { status: 400 }
      );
    }

    const timestamp = new Date().toLocaleString("en-GB", { timeZone: "UTC" });

    // -------- 1) Email to you (To + CC + BCC) --------
    await sgMail.send({
      from: "OBR Contact <no-reply@obrye.global>", // must be verified in SendGrid
      to: ["obrye@obrye.global"],
      cc: ["obrye1@gmail.com"],
      bcc: ["archive@obrye.global"],
      replyTo: email,
      subject: `📩 New contact from ${name}`,
      text: `You have received a new contact form submission.

Name: ${name}
Email: ${email}
Time: ${timestamp} (UTC)

Message:
--------------------------------
${message}
--------------------------------

Submitted via: obrye.global/contact
`,
      html: `
        <h2>📩 New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Time:</strong> ${escapeHtml(timestamp)} (UTC)</p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left:3px solid #ccc; padding-left:10px; color:#555; white-space:pre-wrap;">
          ${escapeHtml(message)}
        </blockquote>
        <hr />
        <p style="font-size:0.9em; color:#888;">
          Submitted via <a href="https://obrye.global/contact">obrye.global/contact</a>
        </p>
      `,
    });

    // -------- 2) Auto-confirmation to sender --------
    await sgMail.send({
      from: "OBR <no-reply@obrye.global>",
      to: email,
      subject: `✅ Thank you, ${name} — we received your message`,
      text: `Hi ${name},

Thank you for contacting OBR. We’ve received your message and will get back to you as soon as possible.

At OBR, we believe that meaningful connections across cultures and borders create opportunities for growth and trust. Your message is important to us, and we’ll make sure it gets the attention it deserves.

Here’s a copy of what you sent:
--------------------------------
${message}
--------------------------------

Warm regards,
Ole Bent Rye
OBR – Mastering Cultural Dynamics
🌐 obrye.global
🔗 linkedin.com/in/olebentrye
`,
      html: `
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thank you for reaching out to <strong>OBR</strong>. We’ve received your message and will respond as soon as possible.</p>
        <p>At OBR, we believe that meaningful connections across cultures and borders create opportunities for growth and trust. Your message is important to us, and we’ll make sure it gets the attention it deserves.</p>
        <hr />
        <p><strong>Your message:</strong></p>
        <blockquote style="border-left:3px solid #ccc; padding-left:10px; color:#555; white-space:pre-wrap;">
          ${escapeHtml(message)}
        </blockquote>
        <hr />
        <p>
          Warm regards,<br/>
          Ole Bent Rye<br/>
          <em>OBR – Mastering Cultural Dynamics</em><br/>
          🌐 <a href="https://obrye.global">obrye.global</a><br/>
          🔗 <a href="https://www.linkedin.com/in/olebentrye">linkedin.com/in/olebentrye</a>
        </p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/contact:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Contact API is live" });
}
