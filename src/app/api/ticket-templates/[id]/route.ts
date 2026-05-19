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
    if (body.description !== undefined) data.description = String(body.description).trim();
    if (body.type !== undefined) data.type = body.type;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.category !== undefined) data.category = body.category || null;
    if (body.titlePrefix !== undefined) data.titlePrefix = body.titlePrefix?.trim() || null;
    if (body.bodyTemplate !== undefined) data.bodyTemplate = String(body.bodyTemplate).trim();
    if (body.active !== undefined) data.active = Boolean(body.active);

    const template = await prisma.ticketTemplate.update({ where: { id }, data });
    return Response.json(template);
  } catch (error) {
    console.error("Ticket template update error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to update template" }, { status: 500 });
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
    const existing = await prisma.ticketTemplate.findUnique({ where: { id } });
    if (!existing) return Response.json({ error: "Template not found" }, { status: 404 });

    await prisma.ticketTemplate.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Ticket template delete error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
