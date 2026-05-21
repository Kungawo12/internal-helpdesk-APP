import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rateLimit";
import { NextRequest } from "next/server";

// H6: role-to-KB-type mapping -- only return KB articles relevant to the requester's role
const ROLE_KB_TYPES: Record<string, string[]> = {
  admin: ["IT", "HR", "general"],
  manager: ["IT", "HR", "general"],
  it_staff: ["IT", "general"],
  hr_staff: ["HR", "general"],
  ai_staff: ["IT", "general"],
  employee: ["IT", "HR", "general"], // employees see all published articles
};

// L-2 fix: constants for history caps to prevent token exhaustion attacks.
// A client could previously send an unbounded history array, causing the
// OpenAI request to exceed token limits and exhaust budget even within the
// 30-per-minute rate limit.
const MAX_HISTORY_TURNS = 20;
const MAX_HISTORY_CONTENT_LENGTH = 1000;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // H6: per-user rate limit -- 30 messages per minute prevents API key abuse
  if (await isRateLimited(`ai-chat:${session.user.id}`, 30, 60 * 1000)) {
    return Response.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const body = await req.json();
  const message: string = body.message ?? "";

  // L-2 fix: cap history to last 20 turns, each message truncated to 1000 chars.
  // Prevents token exhaustion from unbounded history payloads.
  const history: { role: string; content: string }[] = (
    Array.isArray(body.history) ? body.history : []
  )
    .slice(-MAX_HISTORY_TURNS)
    .map((m: { role?: unknown; content?: unknown }) => ({
      role: String(m.role ?? "user").slice(0, 20),
      content: String(m.content ?? "").slice(0, MAX_HISTORY_CONTENT_LENGTH),
    }));

  if (!message.trim()) return Response.json({ error: "Message required" }, { status: 400 });

  // H6: cap message length server-side -- prevents token exhaustion attacks
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

  const kbContext =
    articles.length > 0
      ? articles.map((a) => `[${a.type}] ${a.title}:\n${a.content.slice(0, 600)}`).join("\n\n---\n\n")
      : "No specific Knowledge Base articles found for this query.";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ reply: "AI assistant is not configured. Please contact your admin." });

  const systemPrompt = `You are a helpful IT/HR helpdesk assistant for Karma Staff. 
Answer questions based on the company knowledge base provided below.
Be concise, professional, and helpful.

Knowledge Base Context:
${kbContext}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI error:", response.status);
      return Response.json({ reply: "Sorry, I encountered an error. Please try again." });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I could not generate a response.";
    return Response.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ reply: "Sorry, I encountered an error. Please try again." });
  }
}
