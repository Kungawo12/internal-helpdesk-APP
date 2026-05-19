import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const VALID_TYPES = ["IT", "HR"] as const;
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const VALID_CATEGORIES = ["Incident", "Service Request"] as const;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const templates = await prisma.ticketTemplate.findMany({
      where: {
        active: true,
        ...(type && VALID_TYPES.includes(type as any) ? { type } : {}),
      },
      orderBy: { name: "asc" },
    });

    return Response.json(templates);
  } catch (error) {
    console.error("Ticket templates list error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to load templates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { name, description, type, priority, category, titlePrefix, bodyTemplate, active } = await req.json();

    if (!name || !description || !type || !bodyTemplate) {
      return Response.json({ error: "name, description, type, and bodyTemplate are required" }, { status: 400 });
    }
    if (!VALID_TYPES.includes(type)) {
      return Response.json({ error: "type must be IT or HR" }, { status: 400 });
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return Response.json({ error: "Invalid priority" }, { status: 400 });
    }
    if (category && !VALID_CATEGORIES.includes(category)) {
      return Response.json({ error: "category must be Incident or Service Request" }, { status: 400 });
    }

    const template = await prisma.ticketTemplate.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        type,
        priority: priority || "medium",
        category: category || null,
        titlePrefix: titlePrefix?.trim() || null,
        bodyTemplate: bodyTemplate.trim(),
        active: active !== false,
      },
    });

    return Response.json(template, { status: 201 });
  } catch (error) {
    console.error("Ticket template create error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to create template" }, { status: 500 });
  }
}
