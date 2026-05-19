import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { canAccessTicket } from "@/lib/ticketAccess";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// Magic bytes for types that have reliable signatures
// M8: extended to cover OOXML (ZIP-based) and legacy MS Office (CFB) formats
const MAGIC: Record<string, number[][]> = {
  "image/jpeg":       [[0xff, 0xd8, 0xff]],
  "image/png":        [[0x89, 0x50, 0x4e, 0x47]],
  "image/gif":        [[0x47, 0x49, 0x46, 0x38]],
  "image/webp":       [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  "application/pdf":  [[0x25, 0x50, 0x44, 0x46]], // %PDF
  // OOXML (.docx, .xlsx) are ZIP archives
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [[0x50, 0x4b, 0x03, 0x04]],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":       [[0x50, 0x4b, 0x03, 0x04]],
  // Legacy MS Office (.doc) uses the Compound File Binary (CFB) magic
  "application/msword": [[0xd0, 0xcf, 0x11, 0xe0]],
};

async function verifyMagicBytes(file: Blob, mimeType: string): Promise<boolean> {
  const sigs = MAGIC[mimeType];
  if (!sigs) return true; // No known magic for this type — skip
  const buf = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  return sigs.some((sig) => sig.every((b, i) => buf[i] === b));
}

// M9: strip dangerous characters from filenames before using in blob paths
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_") // allow only safe chars
    .replace(/\.{2,}/g, "_")           // collapse path traversal sequences
    .slice(0, 100);                    // cap length
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { creatorId: true, type: true },
    });
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    if (!canAccessTicket(session.user.role, session.user.id, ticket)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const attachments = await prisma.attachment.findMany({
      where: { ticketId: id },
      include: { uploadedBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error("Fetch attachments error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to load attachments" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: ticketId } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { creatorId: true, type: true },
    });
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    if (!canAccessTicket(session.user.role, session.user.id, ticket)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    // H-6: verify file content matches declared MIME type
    if (!(await verifyMagicBytes(file, file.type))) {
      return NextResponse.json({ error: "File content does not match declared type" }, { status: 400 });
    }

    const filename = sanitizeFilename((file as File).name || "upload");
    const blob = await put(`tickets/${ticketId}/${filename}`, file, {
      access: "private",
      addRandomSuffix: true,
    });

    const attachment = await prisma.attachment.create({
      data: {
        url: blob.url,
        filename,
        size: file.size,
        ticketId,
        uploadedById: session.user.id,
      },
      include: { uploadedBy: { select: { name: true } } },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Upload attachment error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to upload attachment" }, { status: 500 });
  }
}
