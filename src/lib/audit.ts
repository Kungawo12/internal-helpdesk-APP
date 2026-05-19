import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "CREATED"
  | "STATUS_CHANGED"
  | "PRIORITY_CHANGED"
  | "ASSIGNED"
  | "UNASSIGNED"
  | "RESOLVED"
  | "COMMENT_ADDED"
  | "INTERNAL_NOTE"
  | "SLA_BREACHED"
  | "SLA_AT_RISK"
  | "SLA_RESPONSE_MET";

export async function logAudit(
  ticketId: string,
  userId: string,
  action: AuditAction,
  options?: { field?: string; oldValue?: string; newValue?: string }
) {
  // M6: "system" is used for automated actions (automation engine, SLA cron) but there is
  // no database row with id="system" — writing it would violate the FK constraint.
  // Log to console instead so the event is at least visible in server logs.
  if (userId === "system") {
    console.log(`[AUDIT:SYSTEM] ticket=${ticketId} action=${action}`, options ?? {});
    return;
  }

  try {
    await prisma.auditLog.create({
      data: {
        ticketId,
        userId,
        action,
        field: options?.field ?? null,
        oldValue: options?.oldValue ?? null,
        newValue: options?.newValue ?? null,
      },
    });
  } catch (err) {
    // M5: log only the message — never the full Prisma error which may expose schema details
    const msg = err instanceof Error ? err.message : "unknown error";
    console.error(`[AUDIT] Failed to write audit log (action=${action}):`, msg);
  }
}
