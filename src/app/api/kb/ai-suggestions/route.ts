import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const apiKey = process.env.OPENAI_API_KEY;

    // Get recent ticket titles (last 30 days) to understand what's on employees' minds
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const recentTickets = await prisma.ticket.findMany({
      where: { createdAt: { gte: since } },
      select: { title: true, type: true, priority: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Get existing article titles so we don't repeat them
    const existingTitles = await prisma.kbArticle.findMany({
      where: { published: true },
      select: { title: true },
      take: 100,
    });

    const existingList = existingTitles.map((a) => a.title).join("\n");

    // Static fallback questions (used when no OpenAI key or as defaults)
    const staticSuggestions = [
      { question: "How do I reset my password if I'm locked out?", category: "IT" },
      { question: "What is the process for booking annual leave?", category: "HR" },
      { question: "How do I connect to the company VPN from home?", category: "IT" },
      { question: "What should I do if I receive a suspicious email?", category: "IT" },
      { question: "How do I submit an expense claim?", category: "HR" },
      { question: "My laptop is running slow — what should I try first?", category: "IT" },
      { question: "What is the sick leave policy?", category: "HR" },
      { question: "How do I get access to a new software application?", category: "IT" },
      { question: "What are the company's remote working guidelines?", category: "HR" },
      { question: "How do I book a meeting room?", category: "General" },
    ];

    if (!apiKey || recentTickets.length === 0) {
      return Response.json({ suggestions: staticSuggestions });
    }

    const ticketSummary = recentTickets
      .map((t) => `- [${t.type}] ${t.title}`)
      .join("\n");

    const prompt = `You are an internal helpdesk analyst. Below are the most recent support tickets raised by employees:

${ticketSummary}

These are already covered in the knowledge base (do NOT suggest these):
${existingList.slice(0, 1000)}

Based on the ticket patterns above, predict 10 questions that employees are LIKELY to ask next or haven't asked yet but probably need help with. Focus on practical, actionable questions.

Respond with JSON only:
{
  "suggestions": [
    { "question": "How do I...", "category": "IT" | "HR" | "General" },
    ...
  ]
}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      return Response.json({ suggestions: staticSuggestions });
    }

    const data = await res.json();
    let parsed: { suggestions?: { question: string; category: string }[] } = {};
    try {
      parsed = JSON.parse(data.choices[0].message.content);
    } catch {
      parsed = {};
    }

    const suggestions = parsed.suggestions?.slice(0, 10) ?? staticSuggestions;
    return Response.json({ suggestions });
  } catch (error) {
    console.error("KB suggestions error:", error);
    return Response.json({ error: "Failed to load suggestions" }, { status: 500 });
  }
}
