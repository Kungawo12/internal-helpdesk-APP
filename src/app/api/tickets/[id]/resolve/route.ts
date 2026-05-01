import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role, id: userId } = session.user;
  if (role !== "it_staff" && role !== "hr_staff") {
    return Response.json({ error: "Only staff can resolve tickets" }, { status: 403 });
  }

  const { solution, status } = await req.json();
  const { id } = await params;

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      solution: solution || undefined,
      status: status || "resolved",
      assigneeId: userId,
    },
  });

  return Response.json(ticket);
}
