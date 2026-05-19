import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { type: true, creatorId: true },
    });
    if (!ticket) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }

    const { role, id: userId } = session.user;
    const canAccess =
      role === "admin" ||
      (role === "it_staff" && ticket.type === "IT") ||
      (role === "ai_staff" && ticket.type === "Software") ||
      (role === "hr_staff" && ticket.type === "HR") ||
      ticket.creatorId === userId;

    if (!canAccess) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const isStaffOrAbove = ["it_staff", "hr_staff", "ai_staff", "admin"].includes(role);

    const comments = await prisma.comment.findMany({
      where: {
        ticketId: id,
        // Employees cannot see internal notes
        ...(isStaffOrAbove ? {} : { isInternal: false }),
      },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return Response.json(comments);
  } catch (error) {
    console.error("Fetch comments error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to load comments" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: ticketId } = await params;
    const { content, isInternal } = await req.json();

    if (!content || content.trim().length < 2) {
      return Response.json({ error: "Comment must be at least 2 characters" }, { status: 400 });
    }

    const ticketForPost = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { type: true, creatorId: true },
    });
    if (!ticketForPost) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }

    const postRole = session.user.role;
    const canAccessPost =
      postRole === "admin" ||
      (postRole === "it_staff" && ticketForPost.type === "IT") ||
      (postRole === "ai_staff" && ticketForPost.type === "Software") ||
      (postRole === "hr_staff" && ticketForPost.type === "HR") ||
      ticketForPost.creatorId === session.user.id;

    if (!canAccessPost) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const isStaffOrAbove = ["it_staff", "hr_staff", "ai_staff", "admin"].includes(postRole);
    const internal = isStaffOrAbove && isInternal === true;

    // Fetch creator info for notification (only when staff posts a public reply)
    let ticketCreator: { email: string; id: string; title: string } | null = null;
    if (isStaffOrAbove && !internal) {
      const t = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: { title: true, creatorId: true, creator: { select: { email: true } } },
      });
      if (t) ticketCreator = { email: t.creator.email, id: t.creatorId, title: t.title };
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        isInternal: internal,
        ticketId,
        userId: session.user.id,
      },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    });

    logAudit(ticketId, session.user.id, internal ? "INTERNAL_NOTE" : "COMMENT_ADDED").catch(() => {});

    // Mark first response SLA met when staff posts the first public reply
    if (isStaffOrAbove && !internal) {
      prisma.ticket.updateMany({
        where: { id: ticketId, slaFirstResponseMet: false, slaFirstResponseDue: { not: null } },
        data: { slaFirstResponseMet: true },
      }).catch(() => {});

      // Notify ticket creator (skip if the commenter IS the creator)
      if (ticketCreator && ticketCreator.id !== session.user.id) {
        notify(ticketCreator.id, "TICKET_COMMENT", `New reply on "${ticketCreator.title}" from ${session.user.name ?? "Staff"}.`, ticketId).catch(() => {});
      }
    }

    return Response.json(comment, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
