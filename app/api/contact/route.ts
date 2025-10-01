// app/api/contact/route.ts
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export const runtime = "nodejs"; // ensure Node, not Edge

// --- Env ----
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
const CONTACT_FROM = process.env.CONTACT_FROM || ""; // verified sender (domain or single)
const CONTACT_TO = process.env.CONTACT_TO || "";     // primary recipient
const CONTACT_CC = process.env.CONTACT_CC || "";     // optional, comma-separated

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// --- Types & Helpers ----
type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  company?: string;
  country?: string;
  phone?: string;
  interests?: string[] | string | null;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseCc(cc: string): string[] | undefined {
  const list = cc
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return list.length ? list : undefined;
}

function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String).map((x) => x.trim()).filter(Boolean);
  if (typeof val === "string") return [val.trim()].filter(Boolean);
  return [];
}

function clip(s: string | undefined | null, max: number) {
  const v = (s ?? "").toString();
  return v.length > max ? v.slice(0, max) : v;
}

// --- Routes ----
export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      message,
      company,
      country,
      phone,
      interests,
    } = (await req.json()) as ContactPayload;

    // Required
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, email, message." },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Reasonable limits (soft)
    const cleanName = clip(name.trim(), 200);
    const cleanEmail = clip(email.trim(), 320);
    const cleanMessage = clip(mess
# Ensure the folder exists
mkdir -p app/api/contact

# Write the final contact route with SendGrid + extra fields
cat > app/api/contact/route.ts <<'EOF'
// app/api/contact/route.ts
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export const runtime = "nodejs"; // ensure Node, not Edge

// --- Env ----
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
const CONTACT_FROM = process.env.CONTACT_FROM || ""; // verified sender (domain or single)
const CONTACT_TO = process.env.CONTACT_TO || "";     // primary recipient
const CONTACT_CC = process.env.CONTACT_CC || "";     // optional, comma-separated

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// --- Types & Helpers ----
type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  company?: string;
  country?: string;
  phone?: string;
  interests?: string[] | string | null;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseCc(cc: string): string[] | undefined {
  const list = cc
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return list.length ? list : undefined;
}

function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String).map((x) => x.trim()).filter(Boolean);
  if (typeof val === "string") return [val.trim()].filter(Boolean);
  return [];
}

function clip(s: string | undefined | null, max: number) {
  const v = (s ?? "").toString();
  return v.length > max ? v.slice(0, max) : v;
}

// --- Routes ----
export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      message,
      company,
      country,
      phone,
      interests,
    } = (await req.json()) as ContactPayload;

    // Required
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, email, message." },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Reasonable limits (soft)
    const cleanName = clip(name.trim(), 200);
    const cleanEmail = clip(email.trim(), 320);
    const cleanMessage = clip(message.trim(), 5000);
    if (!cleanName || !cleanEmail || !cleanMessage) {
      return NextResponse.json(
        { success: false, error: "Validation failed. Please check your inputs." },
        { status: 400 }
      );
    }

    // Optional fields (light clipping)
    const cleanCompany = clip((company ?? "").toString().trim(), 200);
    const cleanCountry = clip((country ?? "").toString().trim(), 120);
    const cleanPhone = clip((phone ?? "").toString().trim(), 120);
    const interestList = toArray(interests).slice(0, 20).map((x) => clip(x, 120));
    const interestDisplayText = interestList.length ? `• ${interestList.join("\n• ")}` : "—";
    const interestDisplayHtml = interestList.length
      ? `<ul>${interestList.map((i) => `<li>${escapeHtml(i!)}</li>`).join("")}</ul>`
      : "—";

    if (!SENDGRID_API_KEY || !CONTACT_FROM || !CONTACT_TO) {
      console.error("[contact] Missing env vars", {
        hasKey: !!SENDGRID_API_KEY,
        hasFrom: !!CONTACT_FROM,
        hasTo: !!CONTACT_TO,
      });
      return NextResponse.json(
        { success: false, error: "Email service not configured." },
        { status: 500 }
      );
    }

    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const ua = req.headers.get("user-agent") || "unknown";

    const subject = `New inquiry from ${cleanName}`;

    // --- TEXT body (plain) ---
    const textBody =
`You have a new contact form submission.

Name: ${cleanName}
Email: ${cleanEmail}
Company: ${cleanCompany || "—"}
Country: ${cleanCountry || "—"}
Phone: ${cleanPhone || "—"}
Interests:
${interestDisplayText}

IP: ${ip}
UA: ${ua}

Message:
${cleanMessage}
`;

    // --- HTML body ---
    const htmlBody =
`<h2>New contact form submission</h2>
<p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
<p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>
<p><strong>Company:</strong> ${escapeHtml(cleanCompany || "—")}</p>
<p><strong>Country:</strong> ${escapeHtml(cleanCountry || "—")}</p>
<p><strong>Phone:</strong> ${escapeHtml(cleanPhone || "—")}</p>
<p><strong>Interests:</strong> ${interestDisplayHtml}</p>
<p><strong>IP:</strong> ${escapeHtml(ip)}</p>
<p><strong>UA:</strong> ${escapeHtml(ua)}</p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0" />
<p style="white-space:pre-wrap;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">${escapeHtml(
  cleanMessage
)}</p>`;

    const ccList = parseCc(CONTACT_CC);

    await sgMail.send({
      to: CONTACT_TO,
      cc: ccList,
      from: { email: CONTACT_FROM, name: "OBR Website" },
      replyTo: { email: cleanEmail, name: cleanName },
      subject,
      text: textBody,
      html: htmlBody,
      headers: { "X-Contact-Form-Source": "obrye.global" },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("[contact] Error sending email", err?.response?.body || err || "unknown");
    return NextResponse.json({ success: false, error: "Failed to send" }, { status: 500 });
  }
}

// Health check (handy on Vercel)
export async function GET() {
  return NextResponse.json({ ok: true });
}

// CORS preflight (in case you ever submit from another origin)
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
