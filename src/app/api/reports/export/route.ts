/**
 * GET /api/reports/export
 *
 * Exports ticket or audit data as CSV for compliance reporting.
 * Admin and manager access only.
 *
 * Query params:
 *   type = "tickets" (default) | "audit"
 *   from = YYYY-MM-DD (optional, inclusive)
 *   to   = YYYY-MM-DD (optional, inclusive, defaults to today)
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * FIX L6: escapeCsv — safe CSV cell serialiser with formula-injection protection.
 *
 * WHY THE OLD cell() WAS DANGEROUS:
 *   The original helper only did RFC 4180 quoting (escape " → "").
 *   A value like  =cmd|' /C calc'!A0  would be written as-is, and Excel/LibreOffice
 *   would execute it as a formula when the user opened the CSV directly.
 *
 * WHAT WE DO NOW (OWASP CSV Injection recommendation):
 *   1. If the cell starts with =, +, -, @, TAB, or CR — prefix it with a single
 *      quote (').  Excel treats ' as a string literal prefix and strips it from
 *      display, so the value is shown correctly but never executed as a formula.
 *   2. If the value contains a comma, double-quote, or newline, wrap it in
 *      double-quotes and escape internal double-quotes as "" per RFC 4180.
 *
 * This is identical to the escapeCsv() already in /api/tickets/export/route.ts.
 */
function escapeCsv(value: unknown): string {
    if (value == null) return "";
    let str = String(value);
    // Neutralise formula-injection prefixes
  if (/^[=+\-@\t\r]/.test(str)) str = `'${str}`;
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function toCSV(header: string[], rows: unknown[][]): string {
    const lines = [header.map(escapeCsv).join(",")];
    for (const row of rows) {
          lines.push(row.map(escapeCsv).join(","));
    }
    return lines.join("\r\n");
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = session.user;
    if (role !== "admin" && role !== "manager") {
          return Response.json({ error: "Admin or manager access required" }, { status: 403 });
    }

  const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") === "audit" ? "audit" : "tickets";
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");

  const from = fromStr ? new Date(fromStr) : undefined;
    const to = toStr ? new Date(toStr + "T23:59:59.999Z") : undefined;

  if (from && isNaN(from.getTime())) {
        return Response.json({ error: "Invalid 'from' date" }, { status: 400 });
  }
    if (to && isNaN(to.getTime())) {
          return Response.json({ error: "Invalid 'to' date" }, { status: 400 });
    }

  const dateFilter = {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
  };

  try {
        if (type === "audit") {
                const logs = await prisma.auditLog.findMany({
                          where: Object.keys(dateFilter).length ? { createdAt: dateFilter } : {},
                          orderBy: { createdAt: "desc" },
                          include: { user: { select: { name: true, email: true } } },
                });

          const header = ["ID", "Action", "Ticket ID", "User", "Email", "Details", "Timestamp"];
                const rows = logs.map((l) => [
                          l.id,
                          l.action,
                          l.ticketId,
                          l.user?.name ?? "System",
                          l.user?.email ?? "",
                          typeof l.details === "string" ? l.details : JSON.stringify(l.details),
                          l.createdAt.toISOString(),
                        ]);

          const csv = toCSV(header, rows);
                return new Response(csv, {
                          headers: {
                                      "Content-Type": "text/csv",
                                      "Content-Disposition": `attachment; filename="audit-${Date.now()}.csv"`,
                          },
                });
        }

      // Default: tickets
      const tickets = await prisma.ticket.findMany({
              where: Object.keys(dateFilter).length ? { createdAt: dateFilter } : {},
              orderBy: { createdAt: "desc" },
              include: {
                        creator: { select: { name: true, email: true } },
                        assignee: { select: { name: true } },
              },
      });

      const header = [
              "ID", "Title", "Type", "Status", "Priority",
              "Creator", "Creator Email", "Assignee", "SLA Breached", "Created", "Updated",
            ];
        const rows = tickets.map((t) => [
                t.id,
                t.title,
                t.type,
                t.status,
                t.priority,
                t.creator.name,
                t.creator.email,
                t.assignee?.name ?? "Unassigned",
                t.slaBreached ? "Yes" : "No",
                t.createdAt.toISOString(),
                t.updatedAt.toISOString(),
              ]);

      const csv = toCSV(header, rows);
        return new Response(csv, {
                headers: {
                          "Content-Type": "text/csv",
                          "Content-Disposition": `attachment; filename="tickets-${Date.now()}.csv"`,
                },
        });
  } catch (error) {
        console.error("Report export error:", error instanceof Error ? error.message : "unknown");
        return Response.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
