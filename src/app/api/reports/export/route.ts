/**
 * GET /api/reports/export
 *
 * Exports ticket or audit data as CSV for compliance reporting.
 * Admin and manager access only.
 *
 * Query params:
 *   type    = "tickets" (default) | "audit"
 *   from    = YYYY-MM-DD  (optional, inclusive)
 *   to      = YYYY-MM-DD  (optional, inclusive, defaults to today)
 *
 * Why CSV?
 *  CSV opens directly in Excel/Sheets — the most common tool for compliance
 *  reviews and HR/IT reporting without requiring any custom tooling.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Safely quote a CSV cell — escapes embedded double-quotes per RFC 4180. */
function cell(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function toCSV(header: string[], rows: unknown[][]): string {
  const lines = [header.map(cell).join(",")];
  for (const row of rows) {
    lines.push(row.map(cell).join(","));
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

  let csv: string;
  let filename: string;

  if (type === "tickets") {
    const tickets = await prisma.ticket.findMany({
      where: Object.keys(dateFilter).length ? { createdAt: dateFilter } : {},
      include: {
        creator: { select: { name: true, email: true } },
        assignee: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    csv = toCSV(
      ["ID", "Title", "Type", "Status", "Priority", "Creator", "Creator Email", "Assignee", "SLA Breached", "Created At", "Updated At"],
      tickets.map((t) => [
        t.id,
        t.title,
        t.type,
        t.status,
        t.priority,
        t.creator.name,
        t.creator.email,
        t.assignee?.name ?? "",
        t.slaBreached ? "Yes" : "No",
        t.createdAt.toISOString(),
        t.updatedAt.toISOString(),
      ])
    );
    filename = `tickets-export-${new Date().toISOString().slice(0, 10)}.csv`;
  } else {
    const logs = await prisma.auditLog.findMany({
      where: Object.keys(dateFilter).length ? { createdAt: dateFilter } : {},
      include: {
        ticket: { select: { title: true, type: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    csv = toCSV(
      ["Log ID", "Ticket ID", "Ticket Title", "Ticket Type", "Action", "Field", "Old Value", "New Value", "User", "User Email", "Timestamp"],
      logs.map((l) => [
        l.id,
        l.ticketId,
        l.ticket.title,
        l.ticket.type,
        l.action,
        l.field ?? "",
        l.oldValue ?? "",
        l.newValue ?? "",
        l.user.name,
        l.user.email,
        l.createdAt.toISOString(),
      ])
    );
    filename = `audit-export-${new Date().toISOString().slice(0, 10)}.csv`;
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
