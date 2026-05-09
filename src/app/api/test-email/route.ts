import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/test-email — admin only, sends a test email to themselves
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    return NextResponse.json({
      error: "SMTP not configured",
      missing: { host: !host, user: !user, pass: !pass },
    }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({ host, port, secure: false, auth: { user, pass } });

  try {
    await transporter.verify();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "SMTP connection failed", detail: message }, { status: 500 });
  }

  try {
    const info = await transporter.sendMail({
      from: `"Helpdesk" <${from}>`,
      to: session.user.email!,
      subject: "Helpdesk — SMTP Test",
      html: `<p style="font-family:sans-serif">SMTP is working correctly. Sent to <strong>${session.user.email}</strong>.</p>`,
    });
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Send failed", detail: message }, { status: 500 });
  }
}
