async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!apiKey) {
    console.log(`[EMAIL - BREVO_API_KEY NOT SET] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Helpdesk", email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[EMAIL ERROR] To: ${to} | Status: ${res.status} | ${err}`);
    } else {
      const data = await res.json();
      console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject} | ID: ${data.messageId}`);
    }
  } catch (err) {
    console.error(`[EMAIL ERROR] To: ${to} | Subject: ${subject}`, err);
  }
}

// ─── TICKET CREATED → notify relevant department staff ───────────────────────

export async function sendTicketCreatedEmail(
  staffEmail: string,
  ticketTitle: string,
  ticketType: string,
  ticketId: string,
  creatorName: string,
  priority: string
) {
  const appUrl = process.env.NEXTAUTH_URL;
  if (!appUrl) return; // H3: never embed localhost URLs in outgoing emails
  const ticketUrl = `${appUrl}/dashboard/ticket/${ticketId}`;
  const priorityColor = priority === "urgent" ? "#dc2626" : priority === "high" ? "#d97706" : "#3b82f6";
  const deptLabel = ticketType === "IT" ? "IT Support" : ticketType === "Software" ? "AI / Software Team" : "HR Support";
  const accentColor = ticketType === "Software" ? "#7c3aed" : "#0f172a";

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
      <div style="background:${accentColor};border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Karma Staff Helpdesk</span>
      </div>

      <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">${deptLabel} Queue</p>
        <h1 style="margin:0 0 24px;font-size:22px;font-weight:800;color:#0f172a;line-height:1.3;">New Ticket Assigned to Your Queue</h1>

        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid ${priorityColor};">
          <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#0f172a;">${ticketTitle}</p>
          <div style="display:flex;gap:16px;flex-wrap:wrap;">
            <span style="font-size:12px;font-weight:700;color:#64748b;">Type: <span style="color:#0f172a;">${ticketType}</span></span>
            <span style="font-size:12px;font-weight:700;color:#64748b;">Priority: <span style="color:${priorityColor};text-transform:capitalize;">${priority}</span></span>
            <span style="font-size:12px;font-weight:700;color:#64748b;">From: <span style="color:#0f172a;">${creatorName}</span></span>
          </div>
        </div>

        <a href="${ticketUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
          View &amp; Respond to Ticket →
        </a>

        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
          You received this because you are a member of the ${deptLabel} team.
        </p>
      </div>
    </div>
  `;

  await sendEmail(staffEmail, `[${priority.toUpperCase()}] New ${ticketType} Ticket: ${ticketTitle}`, html);
}

// ─── TICKET RESOLVED → notify the employee who raised it ─────────────────────

export async function sendTicketResolvedEmail(
  employeeEmail: string,
  ticketTitle: string,
  ticketId: string,
  solution: string,
  resolvedByName: string
) {
  const appUrl = process.env.NEXTAUTH_URL;
  if (!appUrl) return;
  const ticketUrl = `${appUrl}/dashboard/ticket/${ticketId}`;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
      <div style="background:#0f172a;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Helpdesk</span>
      </div>

      <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <div style="display:inline-flex;align-items:center;gap:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:6px 14px;margin-bottom:20px;">
          <span style="color:#16a34a;font-size:14px;">✓</span>
          <span style="color:#16a34a;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Resolved</span>
        </div>

        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;">Your ticket has been resolved</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;">${resolvedByName} has resolved your request.</p>

        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #16a34a;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Ticket</p>
          <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0f172a;">${ticketTitle}</p>
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Solution</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${solution}</p>
        </div>

        <a href="${ticketUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
          View Ticket &amp; Leave Feedback →
        </a>

        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
          If the issue persists, you can open a new ticket from your dashboard.
        </p>
      </div>
    </div>
  `;

  await sendEmail(employeeEmail, `✓ Resolved: ${ticketTitle}`, html);
}

// ─── NEW COMMENT → notify the ticket creator ─────────────────────────────────

export async function sendTicketCommentEmail(
  creatorEmail: string,
  ticketTitle: string,
  ticketId: string,
  commenterName: string,
  commentPreview: string
) {
  const appUrl = process.env.NEXTAUTH_URL;
  if (!appUrl) return;
  const ticketUrl = `${appUrl}/dashboard/ticket/${ticketId}`;
  const preview = commentPreview.length > 200 ? commentPreview.slice(0, 200) + "…" : commentPreview;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
      <div style="background:#0f172a;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Helpdesk</span>
      </div>
      <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <div style="display:inline-flex;align-items:center;gap:8px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:6px 14px;margin-bottom:20px;">
          <span style="color:#2563eb;font-size:14px;">💬</span>
          <span style="color:#2563eb;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">New Reply</span>
        </div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;">Someone replied to your ticket</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;">${commenterName} left a reply on your request.</p>
        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #3b82f6;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Ticket</p>
          <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0f172a;">${ticketTitle}</p>
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Reply</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;font-style:italic;">"${preview}"</p>
        </div>
        <a href="${ticketUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
          View &amp; Reply →
        </a>
      </div>
    </div>
  `;

  await sendEmail(creatorEmail, `💬 New reply on: ${ticketTitle}`, html);
}

// ─── TICKET IN PROGRESS → notify the employee who raised it ──────────────────

export async function sendTicketInProgressEmail(
  employeeEmail: string,
  ticketTitle: string,
  ticketId: string,
  staffName: string
) {
  const appUrl = process.env.NEXTAUTH_URL;
  if (!appUrl) return;
  const ticketUrl = `${appUrl}/dashboard/ticket/${ticketId}`;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
      <div style="background:#0f172a;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Helpdesk</span>
      </div>
      <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <div style="display:inline-flex;align-items:center;gap:8px;background:#fffbeb;border:1px solid #fde68a;border-radius:20px;padding:6px 14px;margin-bottom:20px;">
          <span style="color:#d97706;font-size:14px;">⚡</span>
          <span style="color:#d97706;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">In Progress</span>
        </div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;">Your ticket is being worked on</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;">${staffName} has picked up your request and is working on it now.</p>
        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #d97706;">
          <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${ticketTitle}</p>
        </div>
        <a href="${ticketUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
          View Ticket →
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
          We'll notify you again when your ticket is resolved.
        </p>
      </div>
    </div>
  `;

  await sendEmail(employeeEmail, `⚡ In Progress: ${ticketTitle}`, html);
}

// ─── TICKET ASSIGNED → notify the staff member assigned ──────────────────────

export async function sendTicketAssignedEmail(
  staffEmail: string,
  staffName: string,
  ticketTitle: string,
  ticketType: string,
  ticketId: string,
  assignedByName: string
) {
  const appUrl = process.env.NEXTAUTH_URL;
  if (!appUrl) return;
  const ticketUrl = `${appUrl}/dashboard/ticket/${ticketId}`;
  const deptLabel = ticketType === "IT" ? "IT Support" : ticketType === "Software" ? "AI / Software Team" : "HR Support";
  const accentColor = ticketType === "Software" ? "#7c3aed" : "#0f172a";

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
      <div style="background:${accentColor};border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Karma Staff Helpdesk</span>
      </div>
      <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">${deptLabel}</p>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;">You've been assigned a ticket</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;">Hi ${staffName}, ${assignedByName} has assigned the following ticket to you.</p>
        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #3b82f6;">
          <p style="margin:0;font-size:16px;font-weight:700;color:#0f172a;">${ticketTitle}</p>
        </div>
        <a href="${ticketUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
          View &amp; Work on Ticket →
        </a>
      </div>
    </div>
  `;

  await sendEmail(staffEmail, `Assigned to you: ${ticketTitle}`, html);
}

// ─── TICKET ESCALATED → notify admins ────────────────────────────────────────

export async function sendTicketEscalatedEmail(
  adminEmail: string,
  ticketTitle: string,
  ticketId: string,
  oldPriority: string,
  newPriority: string
) {
  const appUrl = process.env.NEXTAUTH_URL;
  if (!appUrl) return; // H3: never fall back to localhost in email links
  const ticketUrl = `${appUrl}/dashboard/ticket/${ticketId}`;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
      <div style="background:#0f172a;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Helpdesk</span>
      </div>
      <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <h2 style="margin:0 0 12px;font-size:18px;font-weight:800;color:#dc2626;">Ticket Escalated to ${newPriority.toUpperCase()}</h2>
        <p style="margin:0 0 20px;font-size:14px;color:#64748b;">
          <strong>${ticketTitle}</strong> was escalated from
          <em>${oldPriority}</em> to <strong>${newPriority}</strong>.
        </p>
        <a href="${ticketUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
          View Ticket &rarr;
        </a>
      </div>
    </div>
  `;

  await sendEmail(adminEmail, `Escalated to ${newPriority.toUpperCase()}: ${ticketTitle}`, html);
}

// ─── PASSWORD RESET ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.NEXTAUTH_URL;
  if (!appUrl) {
    console.log(`[DEV] NEXTAUTH_URL not set — password reset token for ${email}: ${token}`);
    return;
  }
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
      <div style="background:#0f172a;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Helpdesk</span>
      </div>
      <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;">Reset your password</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
          You requested a password reset. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
          Reset Password →
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
          If you didn't request this, ignore this email. Your password won't change.
        </p>
      </div>
    </div>
  `;

  await sendEmail(email, "Reset your Helpdesk password", html);
}
