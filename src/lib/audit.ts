import { prisma } from "@/lib/prisma";

type AuditAction =
  | "CREATED"
  | "STATUS_CHANGED"
  | "PRIORITY_CHANGED"
  | "ASSIGNED"
  | "UNASSIGNED"
  | "RESOLVED"
  | "COMMENT_ADDED"
  | "INTERNAL_NOTE"
  | "SLA_BREACHED"
  | "SLA_RESPONSE_MET";

export async function logAudit(
  ticketId: string,
  userId: string,
  action: AuditAction,
  options?: { field?: string; oldValue?: string; newValue?: string }
) {
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
    // Audit logging must never crash the main request
    console.error("[AUDIT] Failed to write audit log:", err);
  }
}
