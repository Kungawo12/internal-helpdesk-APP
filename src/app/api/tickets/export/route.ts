import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// L-1 fix: added CSV formula injection (CSV injection) protection.
// A ticket title like "=cmd|' /C calc'!A0" would execute as a formula in
// Microsoft Excel / LibreOffice Calc when opened directly from the CSV file.
// We prefix any cell that starts with =, +, -, @, tab, or CR with a single
// quote, which Excel treats as a string literal prefix and strips from display.
function escapeCsv(value: string | null | undefined): string {
  if (value == null) return "";
  let str = String(value);
  // Neutralize formula injection prefixes (OWASP recommendation)
  if (/^[=+\-@\t\r]/.test(str)) str = `'${str}`;
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { role } = session.user;
    if (role !== "admin" && role !== "manager") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { name: true, email: true } },
        assignee: { select: { name: true } },
      },
    });

    const headers = [
      "ID",
      "Title",
      "Type",
      "Status",
      "Priority",
      "Creator",
      "Creator Email",
      "Assignee",
      "SLA Breached",
      "Created",
      "Updated",
    ];

    const rows = tickets.map((t) => [
      t.id,
      t.title,
      t.type,
      t.status,
      t.priority,
      t.creator.name,
      t.creator.email,
      t.assignee?.name ?? "",
      t.slaBreached ? "Yes" : "No",
      new Date(t.createdAt).toISOString(),
      new Date(t.updatedAt).toISOString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="tickets.csv"',
      },
    });
  } catch (error) {
    console.error("Export error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to export tickets" }, { status: 500 });
  }
}
