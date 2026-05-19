import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rateLimit";
import { NextRequest } from "next/server";

// H6: role-to-KB-type mapping — only return KB articles relevant to the requester's role
const ROLE_KB_TYPES: Record<string, string[]> = {
  admin:    ["IT", "HR", "general"],
  manager:  ["IT", "HR", "general"],
  it_staff: ["IT", "general"],
  hr_staff: ["HR", "general"],
  ai_staff: ["IT", "general"],
  employee: ["IT", "HR", "general"], // employees see all published articles
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // H6: per-user rate limit — 30 messages per minute prevents API key abuse
  if (await isRateLimited(`ai-chat:${session.user.id}`, 30, 60 * 1000)) {
    return Response.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const body = await req.json();
  const message: string = body.message ?? "";
  const history: { role: string; content: string }[] = Array.isArray(body.history) ? body.history : [];

  if (!message.trim()) return Response.json({ error: "Message required" }, { status: 400 });

  // H6: cap message length server-side — prevents token exhaustion attacks
  if (message.length > 2000) {
    return Response.json({ error: "Message too long (max 2000 characters)" }, { status: 400 });
  }

  // M1: filter KB articles by the requester's role so cross-role data doesn't leak
  const allowedTypes = ROLE_KB_TYPES[session.user.role] ?? ["general"];

  const articles = await prisma.kbArticle.findMany({
    where: {
      published: true,
      type: { in: allowedTypes },
      OR: [
        { title: { contains: message.slice(0, 100), mode: "insensitive" } },
        { tags: { contains: message.slice(0, 100), mode: "insensitive" } },
        { content: { contains: message.slice(0, 100), mode: "insensitive" } },
      ],
    },
    select: { title: true, content: true, type: true },
    orderBy: { views: "desc" },
    take: 5,
  });

  const kbContext = articles.length > 0
    ? articles.map((a) => `[${a.type}] ${a.title}:\n${a.content.slice(0, 600)}`).join("\n\n---\n\n")
    : "No specific Knowledge Base articles found for this query.";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ reply: "AI assistant is not configured. Please contact your admin." });

  // H6: cap history to last 6 turns and truncate individual content to prevent injection padding
  const safeHistory = history.slice(-6).map((h) => ({
    role: h.role === "assistant" ? "assistant" : "user",
    content: String(h.content).slice(0, 1000),
  }));

  const messages = [
    {
      role: "system",
      content: `You are a helpful IT and HR helpdesk assistant for an internal company platform. Answer questions concisely and clearly based on the Knowledge Base context below. If the context doesn't cover the question, give a general helpful response and suggest the employee raise a ticket if needed.\n\nKnowledge Base Context:\n${kbContext}`,
    },
    ...safeHistory,
    { role: "user", content: message },
  ];

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 400,
      temperature: 0.4,
    }),
  });

  if (!openaiRes.ok) {
    // L2: log only status — never log the full response body which may expose API details
    console.error("OpenAI request failed:", openaiRes.status, openaiRes.statusText);
    return Response.json({ reply: "Sorry, I'm having trouble responding right now. Please try again." });
  }

  const data = await openaiRes.json();
  const reply = data.choices?.[0]?.message?.content?.trim() ?? "I'm not sure how to answer that. Try raising a ticket.";

  return Response.json({ reply });
}
