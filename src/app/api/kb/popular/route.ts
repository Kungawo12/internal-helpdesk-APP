import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Find resolved tickets that have a solution, grouped by lowercase title
    // to surface genuinely repeated questions
    const groups = await prisma.$queryRaw<
      Array<{ title: string; type: string; count: number; solution: string }>
    >`
      SELECT
        MIN(title)    AS title,
        type,
        COUNT(*)::int AS count,
        MAX(solution) AS solution
      FROM "Ticket"
      WHERE status IN ('resolved', 'closed')
        AND solution IS NOT NULL
        AND solution <> ''
      GROUP BY LOWER(TRIM(title)), type
      ORDER BY count DESC, MAX("updatedAt") DESC
      LIMIT 30
    `;

    // Separate truly repeated (count > 1) from one-offs
    const repeated = groups.filter((g) => g.count > 1);
    const oneOffs  = groups.filter((g) => g.count === 1);

    // Return repeated first; pad with single-occurrence recent resolutions if < 5 items
    const result = repeated.length >= 5
      ? repeated
      : [...repeated, ...oneOffs].slice(0, 15);

    return Response.json(result);
  } catch (error) {
    console.error("Popular KB error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to load popular questions" }, { status: 500 });
  }
}
