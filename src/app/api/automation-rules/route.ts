import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_ACTIONS = ["assign_to_role", "escalate_priority", "notify_admins"] as const;
// Issue-8 fix: added "Software" type and "ai_staff" role — they were missing,
// preventing admins from creating automation rules for Software tickets.
const VALID_TYPES = ["IT", "HR", "Software"];
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"];
const VALID_STATUSES = ["open", "in_progress"];
const VALID_ROLES = ["it_staff", "hr_staff", "ai_staff"];

// Issue-4 fix: GET was completely unguarded — any unauthenticated caller could
// read all automation rules. Restricted to admin only (same as POST).
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const rules = await prisma.automationRule.findMany({
      orderBy: { createdAt: "desc" },
    });
    return Response.json(rules);
  } catch (error) {
    console.error("Automation rules list error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to load rules" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { name, condTicketType, condPriority, condStatus, condUnassigned, action, actionValue } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return Response.json({ error: "name is required" }, { status: 400 });
    }
    if (!action || !VALID_ACTIONS.includes(action)) {
      return Response.json({ error: "action must be assign_to_role, escalate_priority, or notify_admins" }, { status: 400 });
    }

    // Validate action-specific values
    if (action === "assign_to_role") {
      if (!actionValue || !VALID_ROLES.includes(actionValue)) {
        return Response.json({ error: "actionValue must be it_staff, hr_staff, or ai_staff for assign_to_role" }, { status: 400 });
      }
    }
    if (action === "escalate_priority") {
      if (!actionValue || !VALID_PRIORITIES.includes(actionValue)) {
        return Response.json({ error: "actionValue must be a valid priority for escalate_priority" }, { status: 400 });
      }
    }

    // Validate conditions
    if (condTicketType && !VALID_TYPES.includes(condTicketType)) {
      return Response.json({ error: "condTicketType must be IT, HR, or Software" }, { status: 400 });
    }
    if (condPriority && !VALID_PRIORITIES.includes(condPriority)) {
      return Response.json({ error: "condPriority must be a valid priority" }, { status: 400 });
    }
    if (condStatus && !VALID_STATUSES.includes(condStatus)) {
      return Response.json({ error: "condStatus must be open or in_progress" }, { status: 400 });
    }

    const rule = await prisma.automationRule.create({
      data: {
        name: name.trim(),
        condTicketType: condTicketType ?? null,
        condPriority: condPriority ?? null,
        condStatus: condStatus ?? null,
        condUnassigned: condUnassigned === true,
        action,
        actionValue: actionValue ?? null,
        active: true,
      },
    });

    return Response.json(rule, { status: 201 });
  } catch (error) {
    console.error("Automation rules create error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to create rule" }, { status: 500 });
  }
}
