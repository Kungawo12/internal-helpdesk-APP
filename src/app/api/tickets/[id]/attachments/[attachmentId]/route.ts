import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// H-5: Proxy for private Vercel Blob attachments.
// Re-checks authorization before fetching the blob server-side,
// so the raw blob URL is never exposed to the client.

function canAccessTicket(
  role: string,
  userId: string,
  ticket: { creatorId: string; type: string }
): boolean {
  if (role === "admin" || role === "manager") return true;
  if (role === "employee") return ticket.creatorId === userId;
  if (role === "it_staff") return ticket.type === "IT";
  if (role === "hr_staff") return ticket.type === "HR";
  if (role === "ai_staff") return ticket.type === "Software";
  return false;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: ticketId, attachmentId } = await params;

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: { select: { creatorId: true, type: true, id: true } } },
    });

    if (!attachment || attachment.ticket.id !== ticketId) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    if (!canAccessTicket(session.user.role, session.user.id, attachment.ticket)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch the private blob server-side using the store token
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
    }

    const blobRes = await fetch(attachment.url, {
      headers: { Authorization: `Bearer ${blobToken}` },
    });

    if (!blobRes.ok) {
      return NextResponse.json({ error: "Failed to retrieve file" }, { status: 502 });
    }

    const contentType = blobRes.headers.get("content-type") ?? "application/octet-stream";
    const body = await blobRes.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.filename)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Download attachment error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to download attachment" }, { status: 500 });
  }
}
