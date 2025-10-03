// app/api/diag/route.ts
import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    hasSendgridApiKey: Boolean(process.env.SENDGRID_API_KEY),
    hasSendgridFrom: Boolean(process.env.SENDGRID_FROM),
    hasResendApiKey: Boolean(process.env.RESEND_API_KEY),
    contactTo: process.env.CONTACT_TO ? "set" : "missing",
    node: process.version,
    env: process.env.VERCEL_ENV || "unknown",
    gitSha: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
    project: process.env.VERCEL_PROJECT_PRODUCTION_URL || "unknown",
  });
}
