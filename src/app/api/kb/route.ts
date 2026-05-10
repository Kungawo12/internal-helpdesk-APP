import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const VALID_TYPES = ["IT", "HR", "general"] as const;

function normalizeTags(tags?: string): string {
  if (!tags) return "";
  return tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).join(",");
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const q = searchParams.get("q");

    const isAdmin = session.user.role === "admin";
    const articles = await prisma.kbArticle.findMany({
      where: {
        ...(isAdmin ? {} : { published: true }),
        ...(type && VALID_TYPES.includes(type as any) ? { type } : {}),
        ...(q ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { tags: { contains: q, mode: "insensitive" } },
          ],
        } : {}),
      },
      select: { id: true, title: true, type: true, tags: true, views: true, published: true, createdAt: true, author: { select: { name: true } } },
      orderBy: { views: "desc" },
    });

    return Response.json(articles);
  } catch (error) {
    console.error("KB list error:", error);
    return Response.json({ error: "Failed to load articles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { title, content, type, tags, published } = await req.json();

    if (!title || !content || !type) {
      return Response.json({ error: "title, content, and type are required" }, { status: 400 });
    }
    if (!VALID_TYPES.includes(type)) {
      return Response.json({ error: "type must be IT, HR, or general" }, { status: 400 });
    }

    const article = await prisma.kbArticle.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type,
        tags: normalizeTags(tags),
        published: published !== false,
        authorId: session.user.id,
      },
      include: { author: { select: { name: true } } },
    });

    return Response.json(article, { status: 201 });
  } catch (error) {
    console.error("KB create error:", error);
    return Response.json({ error: "Failed to create article" }, { status: 500 });
  }
}
