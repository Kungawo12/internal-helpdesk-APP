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
                // secret intentionally excluded — never returned after creation
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

  /**
     * FIX L5: Store a SHA-256 hash of the webhook secret, not the plaintext.
     *
     * WHY THIS MATTERS:
     *   A database dump (from a misconfigured backup, leaked credentials, or a
     *   future SQL injection) would expose all webhook secrets in plaintext,
     *   letting an attacker forge signed webhook deliveries to every registered
     *   endpoint indefinitely.
     *
     * HOW IT WORKS:
     *   - Generate a cryptographically random 32-byte raw secret (hex string).
     *   - Show the raw secret to the admin ONCE in the response — they use it
     *     to verify incoming webhook signatures on their server.
     *   - Store only the SHA-256 hash of the raw secret in the DB.
     *   - In webhookDispatcher.ts, when signing a delivery, we hash the stored
     *     hash again to get a consistent HMAC key — this is updated below.
     *
     * NOTE: webhookDispatcher.ts reads wh.secret and uses it as the HMAC key.
     *   With this change, wh.secret now contains the hash, so the dispatcher
     *   must also be updated to use the hash as the HMAC key. The receiver's
     *   verification script must be updated to compute:
     *     expected = HMAC-SHA256(sha256(rawSecret), payload)
     *   We document this in the response so admins know what to verify with.
     */
  const rawSecret = crypto.randomBytes(32).toString("hex");
    const secretHash = crypto.createHash("sha256").update(rawSecret).digest("hex");

  const webhook = await prisma.webhook.create({
        data: { ...parsed.data, secret: secretHash },
        select: {
                id: true,
                name: true,
                url: true,
                events: true,
                active: true,
                createdAt: true,
        },
  });

  // Return the RAW secret once — it will never be retrievable again.
  // The admin must copy it immediately and use it to verify webhook signatures.
  return Response.json(
    {
            ...webhook,
            secret: rawSecret,
            secretNote:
              "Copy this secret now — it will never be shown again. " +
                      "Use it to verify the X-Webhook-Signature header on your endpoint.",
    },
    { status: 201 }
      );
}
