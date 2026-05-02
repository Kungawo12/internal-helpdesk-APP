import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketResolvedEmail } from "@/lib/email";

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

  if (status === "resolved" && (!solution || solution.trim().length < 5)) {
    return Response.json(
      { error: "A solution description is required when resolving a ticket" },
      { status: 400 }
    );
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      solution: solution?.trim() || undefined,
      status: status || "resolved",
      assigneeId: userId,
    },
    include: {
      creator: { select: { email: true, name: true } },
    },
  });

  // Send email to employee when ticket is resolved (non-blocking)
  if (status === "resolved" && ticket.creator.email) {
    sendTicketResolvedEmail(
      ticket.creator.email,
      ticket.title,
      solution
    ).catch(() => {});
  }

  return Response.json(ticket);
}
