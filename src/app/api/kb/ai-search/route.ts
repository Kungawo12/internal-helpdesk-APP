import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (!q || q.length < 3) {
      return Response.json({ answer: null, articles: [] });
    }

    // Fetch all published articles (titles + first 300 chars of content)
    const allArticles = await prisma.kbArticle.findMany({
      where: { published: true },
      select: { id: true, title: true, content: true, type: true, tags: true, views: true },
      orderBy: { views: "desc" },
      take: 100,
    });

    if (allArticles.length === 0) {
      return Response.json({ answer: null, articles: [] });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback: keyword search
      const lower = q.toLowerCase();
      const matched = allArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(lower) ||
          a.content.toLowerCase().includes(lower) ||
          a.tags.toLowerCase().includes(lower)
      );
      return Response.json({ answer: null, articles: matched.slice(0, 9) });
    }

    // Build a concise index of articles for GPT
    const index = allArticles
      .map((a, i) => `[${i}] ${a.title} (${a.type}) — ${a.content.slice(0, 200)}`)
      .join("\n");

    const prompt = `You are a workplace helpdesk AI. You ONLY answer questions about IT support, HR policies, and software issues within this company. If a question is unrelated to workplace IT, HR, or software support, respond with: "I can only help with workplace IT, HR, and software support questions. Please raise a ticket if you need further assistance."

A user searched for: "${q}"

Here is the knowledge base index:
${index}

Task:
1. Write a brief direct answer (2-3 sentences) based ONLY on the articles above. Do not use outside knowledge. If no article is relevant OR the question is off-topic, say so clearly.
2. Return the indexes (0-based) of the top 5 most relevant articles, ranked by relevance. Return an empty array if nothing is relevant.

Respond with JSON only:
{
  "answer": "...",
  "indexes": [0, 3, 7, ...]
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
        max_tokens: 400,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      // Fallback to keyword search
      const lower = q.toLowerCase();
      const matched = allArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(lower) ||
          a.content.toLowerCase().includes(lower) ||
          a.tags.toLowerCase().includes(lower)
      );
      return Response.json({ answer: null, articles: matched.slice(0, 9) });
    }

    const data = await res.json();
    let parsed: { answer?: string; indexes?: number[] } = {};
    try {
      parsed = JSON.parse(data.choices[0].message.content);
    } catch {
      parsed = {};
    }

    const indexes = (parsed.indexes ?? []).filter((i) => i >= 0 && i < allArticles.length);
    const articles = indexes.map((i) => allArticles[i]).filter(Boolean);

    return Response.json({
      answer: parsed.answer ?? null,
      articles,
    });
  } catch (error) {
    console.error("KB AI search error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
