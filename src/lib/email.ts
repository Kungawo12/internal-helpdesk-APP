import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
