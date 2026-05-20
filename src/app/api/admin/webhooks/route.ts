import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const CreateWebhookSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  url: z.string().url("Must be a valid HTTPS URL").startsWith("https://", "Webhook URL must use HTTPS"),
  events: z
    .array(z.string())
    .min(1, "At least one event is required")
    .transform((arr) => arr.join(",")),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const webhooks = await prisma.webhook.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      url: true,
      events: true,
      active: true,
      createdAt: true,
      lastFiredAt: true,
      failCount: true,
      // secret is intentionally excluded — never returned after creation
    },
  });

  return Response.json(webhooks);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const parsed = CreateWebhookSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  // Generate a cryptographically random secret — shown ONCE, then stored and never returned
  const secret = crypto.randomBytes(32).toString("hex");

  const webhook = await prisma.webhook.create({
    data: { ...parsed.data, secret },
    select: {
      id: true,
      name: true,
      url: true,
      events: true,
      active: true,
      createdAt: true,
      secret: true, // returned only here — caller must save it
    },
  });

  return Response.json(
    {
      ...webhook,
      _note: "Save the secret — it will not be shown again. Use it to verify the X-Webhook-Signature header on deliveries.",
    },
    { status: 201 }
  );
}
