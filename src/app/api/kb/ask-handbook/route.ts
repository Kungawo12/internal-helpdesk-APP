import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

let cachedText: string | null = null;

async function getHandbookText(): Promise<string> {
  if (cachedText) return cachedText;

  const pdfPath = path.join(process.cwd(), "public", "handbook.pdf");
  const buffer = fs.readFileSync(pdfPath);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
  const data = await pdfParse(buffer);
  cachedText = data.text;
  return cachedText!;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // M-12: cap length and strip control characters to prevent prompt injection
    const raw = typeof body?.question === "string" ? body.question : "";
    const question = raw.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "").slice(0, 500).trim();
    if (question.length < 3) {
      return NextResponse.json({ error: "Please enter a question" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI search is not configured yet. Please add your OpenAI API key." },
        { status: 503 }
      );
    }

    const handbookText = await getHandbookText();

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a helpful HR and IT policy assistant for Karma Staff.
Your job is to answer employee questions using ONLY the information in the Employee Handbook provided below.

Rules:
- Answer concisely and clearly (2–4 sentences max unless a list is genuinely needed).
- Quote the relevant policy section when helpful.
- If the answer is NOT in the handbook, respond exactly: "I couldn't find that in the handbook. Please raise a support ticket and our team will help you directly."
- Never make up or guess policy information.
- Do not answer questions unrelated to company policies, IT, HR, or workplace matters.

EMPLOYEE HANDBOOK:
${handbookText}`,
          },
          {
            role: "user",
            content: question.trim(),
          },
        ],
        max_tokens: 600,
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI error:", err);
      return NextResponse.json({ error: "AI service error. Please try again." }, { status: 502 });
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content ?? "No response received.";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Handbook ask error:", error);
    return NextResponse.json({ error: "Failed to process your question." }, { status: 500 });
  }
}
