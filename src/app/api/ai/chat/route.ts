import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { message, history } = await req.json();
  if (!message?.trim()) return Response.json({ error: "Message required" }, { status: 400 });

  // Fetch up to 5 relevant KB articles as context
  const articles = await prisma.kbArticle.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: message, mode: "insensitive" } },
        { tags: { contains: message, mode: "insensitive" } },
        { content: { contains: message, mode: "insensitive" } },
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

  const messages = [
    {
      role: "system",
      content: `You are a helpful IT and HR helpdesk assistant for an internal company platform. Answer questions concisely and clearly based on the Knowledge Base context below. If the context doesn't cover the question, give a general helpful response and suggest the employee raise a ticket if needed.\n\nKnowledge Base Context:\n${kbContext}`,
    },
    ...(history || []).slice(-6).map((h: { role: string; content: string }) => ({
      role: h.role,
      content: h.content,
    })),
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
    console.error("OpenAI error:", await openaiRes.text());
    return Response.json({ reply: "Sorry, I'm having trouble responding right now. Please try again." });
  }

  const data = await openaiRes.json();
  const reply = data.choices?.[0]?.message?.content?.trim() ?? "I'm not sure how to answer that. Try raising a ticket.";

  return Response.json({ reply });
}
