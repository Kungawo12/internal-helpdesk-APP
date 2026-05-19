import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const ticketType = searchParams.get("ticketType"); // "IT" | "HR"
    const tagsParam = searchParams.get("tags") || "";  // "vpn,wifi"
    const tags = tagsParam.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);

    // Build OR conditions: match by type OR any overlapping tag
    const orConditions: object[] = [];
    if (ticketType) {
      orConditions.push({ type: ticketType });
      orConditions.push({ type: "general" });
    }
    for (const tag of tags) {
      orConditions.push({ tags: { contains: tag, mode: "insensitive" } });
    }

    const articles = await prisma.kbArticle.findMany({
      where: {
        published: true,
        ...(orConditions.length > 0 ? { OR: orConditions } : {}),
      },
      select: { id: true, title: true, type: true, tags: true, views: true },
      orderBy: { views: "desc" },
      take: 3,
    });

    return Response.json(articles);
  } catch (error) {
    console.error("KB related error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to load related articles" }, { status: 500 });
  }
}
