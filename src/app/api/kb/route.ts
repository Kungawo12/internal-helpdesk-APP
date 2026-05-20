import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminServerSide } from "@/lib/adminAuth";
import { unstable_cache, revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

const VALID_TYPES = ["IT", "HR", "general"] as const;

function normalizeTags(tags?: string): string {
  if (!tags) return "";
  return tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).join(",");
}

/**
 * Cache KB article listings for 60 s.
 * Each unique combination of (type, q, isAdmin) gets its own cache entry.
 * All entries share the "kb-articles" tag so a single revalidateTag call
 * busts the entire KB cache when an article is created or updated.
 *
 * Why cache? KB articles are queried on every page load but change rarely.
 * Without this, every visitor hits Postgres — the cache layer absorbs the
 * read load so only one request per 60 s reaches the database per cache key.
 */
const getCachedArticles = unstable_cache(
  async (type: string | null, q: string | null, isAdmin: boolean) => {
    return prisma.kbArticle.findMany({
      where: {
        ...(!isAdmin && { published: true }),
        ...(type ? { type } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { tags: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        tags: true,
        views: true,
        published: true,
        createdAt: true,
        author: { select: { name: true } },
      },
      orderBy: { views: "desc" },
    });
  },
  ["kb-articles"],
  { revalidate: 60, tags: ["kb-articles"] }
);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminPortal = await isAdminServerSide();
    if (!session && !adminPortal) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const rawType = searchParams.get("type");
    const type =
      rawType && (VALID_TYPES as readonly string[]).includes(rawType)
        ? (rawType as (typeof VALID_TYPES)[number])
        : null;
    // Cap search length to prevent expensive unbounded ILIKE queries (M4)
    const rawQ = searchParams.get("q");
    const q = rawQ ? rawQ.slice(0, 100) : null;

    const isAdmin = adminPortal || session?.user.role === "admin";

    const articles = await getCachedArticles(type, q, isAdmin);

    return Response.json(articles);
  } catch (error) {
    console.error("KB list error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to load articles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminPortal = await isAdminServerSide();
    const isAdmin = adminPortal || session?.user.role === "admin";
    if (!isAdmin) return Response.json({ error: "Admin access required" }, { status: 403 });

    const { title, content, type, tags, published } = await req.json();

    if (!title || !content || !type) {
      return Response.json({ error: "title, content, and type are required" }, { status: 400 });
    }
    if (!VALID_TYPES.includes(type)) {
      return Response.json({ error: "type must be IT, HR, or general" }, { status: 400 });
    }

    // If coming from admin portal (no NextAuth session), use any admin user as author
    let authorId = session?.user.id;
    if (!authorId) {
      const anyAdmin = await prisma.user.findFirst({ where: { role: "admin", active: true }, select: { id: true } });
      if (!anyAdmin) return Response.json({ error: "No admin user found" }, { status: 500 });
      authorId = anyAdmin.id;
    }

    const article = await prisma.kbArticle.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type,
        tags: normalizeTags(tags),
        published: published !== false,
        authorId,
      },
      include: { author: { select: { name: true } } },
    });

    // Bust the cache so the new article is visible immediately.
    // expire: 0 purges the entry now; unstable_cache re-populates it (60 s TTL) on next read.
    revalidateTag("kb-articles", { expire: 0 });

    return Response.json(article, { status: 201 });
  } catch (error) {
    console.error("KB create error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to create article" }, { status: 500 });
  }
}
