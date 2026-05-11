import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminServerSide } from "@/lib/adminAuth";

const VALID_TYPES = ["IT", "HR", "general"] as const;

function normalizeTags(tags?: string): string {
  if (!tags) return "";
  return tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).join(",");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const adminPortal = await isAdminServerSide();
    if (!session && !adminPortal) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const isAdmin = adminPortal || session?.user.role === "admin";
    const article = await prisma.kbArticle.findFirst({
      where: { id, ...(isAdmin ? {} : { published: true }) },
      include: { author: { select: { name: true } } },
    });

    if (!article) return Response.json({ error: "Article not found" }, { status: 404 });

    // Increment views non-blocking
    prisma.kbArticle.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

    return Response.json(article);
  } catch (error) {
    console.error("KB get error:", error);
    return Response.json({ error: "Failed to load article" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const adminPortal = await isAdminServerSide();
    if (!adminPortal && session?.user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.content !== undefined) data.content = String(body.content).trim();
    if (body.type !== undefined) {
      if (!VALID_TYPES.includes(body.type)) {
        return Response.json({ error: "type must be IT, HR, or general" }, { status: 400 });
      }
      data.type = body.type;
    }
    if (body.tags !== undefined) data.tags = normalizeTags(body.tags);
    if (body.published !== undefined) data.published = Boolean(body.published);

    const article = await prisma.kbArticle.update({
      where: { id },
      data,
      include: { author: { select: { name: true } } },
    });

    return Response.json(article);
  } catch (error) {
    console.error("KB update error:", error);
    return Response.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const adminPortal = await isAdminServerSide();
    if (!adminPortal && session?.user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.kbArticle.findUnique({ where: { id } });
    if (!existing) return Response.json({ error: "Article not found" }, { status: 404 });

    await prisma.kbArticle.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error("KB delete error:", error);
    return Response.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
