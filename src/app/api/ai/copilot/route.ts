import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const STAFF_ROLES = ["it_staff", "hr_staff", "admin", "manager"];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!STAFF_ROLES.includes(session.user.role)) {
    return Response.json({ error: "Staff access required" }, { status: 403 });
  }

  const ticketId = new URL(req.url).searchParams.get("ticketId");
  if (!ticketId) return Response.json({ error: "ticketId required" }, { status: 400 });

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      creator: { select: { name: true } },
      assignee: { select: { name: true } },
      comments: {
        where: { isInternal: false },
        orderBy: { createdAt: "asc" },
        take: 10,
        select: { content: true, user: { select: { name: true } }, createdAt: true },
      },
    },
  });

  if (!ticket) return Response.json({ error: "Ticket not found" }, { status: 404 });

  // Role-based ticket type access
  const role = session.user.role;
  const canAccess =
    role === "admin" ||
    role === "manager" ||
    (role === "it_staff" && ["IT", "Software"].includes(ticket.type)) ||
    (role === "hr_staff" && ticket.type === "HR");

  if (!canAccess) {
    return Response.json({ error: "Access denied for this ticket type" }, { status: 403 });
  }

  const commentHistory = ticket.comments.length > 0
    ? ticket.comments.map((c) => `${c.user.name}: ${c.content}`).join("\n")
    : "No comments yet.";

  const prompt = `You are a helpful IT/HR support copilot. A staff member needs help with this ticket.

TICKET DETAILS:
Title: ${ticket.title}
Type: ${ticket.type}
Priority: ${ticket.priority}
Status: ${ticket.status}
Submitted by: ${ticket.creator.name}
Description: ${ticket.description}
${ticket.softwareName ? `Affected Software: ${ticket.softwareName}` : ""}
${ticket.affectedSystem ? `Platform/System: ${ticket.affectedSystem}` : ""}
${ticket.errorMessage ? `Error Message: ${ticket.errorMessage}` : ""}

CONVERSATION HISTORY:
${commentHistory}

Provide two things:
1. A brief summary (2-3 sentences) of what the issue is and its current state.
2. A suggested reply to send to the employee — professional, helpful, actionable. Do not include a subject line.

Format your response as JSON with keys "summary" and "suggestedReply" only. No extra text.`;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({
      summary: "AI Copilot is not configured.",
      suggestedReply: "Thank you for reaching out. We are looking into your request and will update you shortly.",
    });
  }

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!openaiRes.ok) {
    console.error("OpenAI copilot error:", await openaiRes.text());
    return Response.json({
      summary: "Could not analyse ticket at this time.",
      suggestedReply: "Thank you for reaching out. We are looking into your request and will update you shortly.",
    });
  }

  const data = await openaiRes.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";

  let parsed: { summary?: string; suggestedReply?: string };
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = {};
  }

  return Response.json({
    summary: parsed.summary ?? "Could not generate summary.",
    suggestedReply: parsed.suggestedReply ?? "Thank you for reaching out. We are looking into your request.",
  });
}
