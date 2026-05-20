import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;
  const { active } = await req.json();

  if (typeof active !== "boolean") {
    return Response.json({ error: "active must be a boolean" }, { status: 400 });
  }

  const webhook = await prisma.webhook.update({
    where: { id },
    data: { active, ...(active && { failCount: 0 }) }, // reset fail count when re-enabling
    select: { id: true, name: true, active: true },
  });

  return Response.json(webhook);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.webhook.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
