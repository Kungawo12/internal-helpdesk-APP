import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// M10: constant-time comparison prevents timing-based secret leakage
function verifyCronSecret(provided: string | null): boolean {
  const expected = process.env.CRON_SECRET;
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(`Bearer ${expected}`);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Vercel Cron — runs daily at 6am UTC (configure in vercel.json)
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  try {
    // Analyze recent tickets (last 7 days) to find common themes
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const recentTickets = await prisma.ticket.findMany({
      where: { createdAt: { gte: since } },
      select: { title: true, description: true, type: true, priority: true },
      orderBy: { createdAt: "desc" },
      take: 80,
    });

    // Get existing article titles to avoid duplication
    const existingArticles = await prisma.kbArticle.findMany({
      select: { title: true, type: true },
      take: 200,
    });

    const existingTitles = existingArticles.map((a) => a.title).join("\n");

    const ticketSummary =
      recentTickets.length > 0
        ? recentTickets.map((t) => `[${t.type}] ${t.title}: ${t.description.slice(0, 100)}`).join("\n")
        : "No recent tickets. Generate general helpdesk FAQ questions.";

    // Ask GPT-4o to generate 10 new FAQ articles
    const prompt = `You are an expert helpdesk knowledge base writer. Your job is to generate helpful FAQ articles for an internal company helpdesk.

Recent support tickets raised by employees:
${ticketSummary.slice(0, 3000)}

Existing articles (do NOT duplicate these):
${existingTitles.slice(0, 2000)}

Generate exactly 10 NEW knowledge base articles. Each article should:
- Answer a question employees commonly have (based on ticket patterns OR general workplace IT/HR knowledge)
- Be a different topic from existing articles
- Have a clear question as the title
- Have a detailed, practical answer (150-300 words) with step-by-step instructions where appropriate
- Include relevant tags

Types: "IT" (technical issues), "HR" (people/policy), or "general" (office/company)

Respond with JSON only:
{
  "articles": [
    {
      "title": "How do I reset my password?",
      "content": "Full answer here with steps...",
      "type": "IT",
      "tags": "password,login,account"
    }
  ]
}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4000,
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      // L2: don't log the full upstream response body — it may contain sensitive data
      console.error("OpenAI request failed:", res.status, res.statusText);
      return NextResponse.json({ error: "OpenAI request failed" }, { status: 500 });
    }

    const data = await res.json();
    let parsed: { articles?: { title: string; content: string; type: string; tags: string }[] } = {};
    try {
      parsed = JSON.parse(data.choices[0].message.content);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const newArticles = parsed.articles ?? [];
    if (newArticles.length === 0) {
      return NextResponse.json({ generated: 0, message: "No articles generated" });
    }

    // Find an admin user to attribute authorship
    const adminUser = await prisma.user.findFirst({
      where: { role: "admin", active: true },
      select: { id: true },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "No admin user found for authorship" }, { status: 500 });
    }

    const VALID_TYPES = ["IT", "HR", "general"];

    const created = await Promise.all(
      newArticles
        .filter((a) => a.title && a.content && VALID_TYPES.includes(a.type))
        .slice(0, 10)
        .map((a) =>
          prisma.kbArticle.create({
            data: {
              title: a.title.trim(),
              content: a.content.trim(),
              type: a.type,
              tags: (a.tags || "").toLowerCase(),
              // L8/M13: AI-generated articles require admin review before going live —
              // prompt-injection via ticket descriptions could push attacker content into KB
              published: false,
              authorId: adminUser.id,
            },
          })
        )
    );

    console.log(`[KB Refresh] Generated ${created.length} new articles`);

    return NextResponse.json({
      generated: created.length,
      titles: created.map((a) => a.title),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("KB refresh cron error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
