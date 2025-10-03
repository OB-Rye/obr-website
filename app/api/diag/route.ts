import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    has_SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
    has_SENDGRID_FROM: !!process.env.SENDGRID_FROM,
    SENDGRID_FROM: process.env.SENDGRID_FROM || null,
    CONTACT_TO: process.env.CONTACT_TO || null,
    CONFIRMATION_BCC: process.env.CONFIRMATION_BCC || null,
  });
}
