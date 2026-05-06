import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: `"Helpdesk" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your Helpdesk password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;">
        <div style="background:#0f172a;padding:24px;border-radius:12px;text-align:center;margin-bottom:32px;">
          <span style="color:white;font-size:24px;font-weight:900;">Helpdesk</span>
        </div>
        <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin-bottom:8px;">Reset your password</h1>
        <p style="color:#64748b;margin-bottom:32px;line-height:1.6;">
          You requested a password reset. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:14px;">
          Reset Password
        </a>
        <p style="margin-top:32px;font-size:12px;color:#94a3b8;">
          If you didn't request this, ignore this email.<br>
          Link: <a href="${resetUrl}" style="color:#3b82f6;">${resetUrl}</a>
        </p>
      </div>
    `,
  });
}

export async function sendTicketCreatedEmail(
  staffEmail: string,
  ticketTitle: string,
  ticketType: string,
  creatorName: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: staffEmail,
    subject: `New ${ticketType} Ticket: ${ticketTitle}`,
    html: `
      <h2>New ${ticketType} Ticket Created</h2>
      <p><strong>Title:</strong> ${ticketTitle}</p>
      <p><strong>Created by:</strong> ${creatorName}</p>
      <p>Please log in to the ticketing system to review and resolve this ticket.</p>
    `,
  });
}

export async function sendTicketResolvedEmail(
  employeeEmail: string,
  ticketTitle: string,
  solution: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: employeeEmail,
    subject: `Ticket Resolved: ${ticketTitle}`,
    html: `
      <h2>Your Ticket Has Been Resolved</h2>
      <p><strong>Ticket:</strong> ${ticketTitle}</p>
      <p><strong>Solution:</strong> ${solution}</p>
      <p>Please log in to the ticketing system to review the solution and provide feedback.</p>
    `,
  });
}
