import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.active !== undefined) data.active = Boolean(body.active);
    if ("condTicketType" in body) data.condTicketType = body.condTicketType || null;
    if ("condPriority" in body) data.condPriority = body.condPriority || null;
    if ("condStatus" in body) data.condStatus = body.condStatus || null;
    if (body.condUnassigned !== undefined) data.condUnassigned = Boolean(body.condUnassigned);
    if (body.action !== undefined) data.action = body.action;
    if ("actionValue" in body) data.actionValue = body.actionValue || null;

    const rule = await prisma.automationRule.update({ where: { id }, data });
    return Response.json(rule);
  } catch (error) {
    console.error("Automation rule update error:", error);
    return Response.json({ error: "Failed to update rule" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.automationRule.findUnique({ where: { id } });
    if (!existing) return Response.json({ error: "Rule not found" }, { status: 404 });

    await prisma.automationRule.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Automation rule delete error:", error);
    return Response.json({ error: "Failed to delete rule" }, { status: 500 });
  }
}
