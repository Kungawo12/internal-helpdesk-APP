/**
 * Outbound webhook dispatcher.
 *
 * Why webhooks?
 *  They turn this into an integration platform. A Slack bot, a Teams connector,
 *  or a third-party ITSM tool can subscribe to ticket events without polling
 *  the API. This is the foundation of the "public API" surface.
 *
 * Security:
 *  Every delivery is signed with HMAC-SHA256 using the webhook's stored secret.
 *  Receivers verify: `sha256=<hex>` in the `X-Webhook-Signature` header.
 *  This prevents a third party from spoofing events to a registered endpoint.
 *
 * Reliability:
 *  Dispatch is non-blocking (fire-and-forget). Failed deliveries increment
 *  `failCount`. Webhooks with 5+ consecutive failures are auto-disabled
 *  so a dead endpoint doesn't slow down every ticket event.
 */

import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export type WebhookEvent =
  | "ticket.created"
  | "ticket.resolved"
  | "ticket.escalated"
  | "ticket.assigned"
  | "ticket.status_changed"
  | "ticket.comment_added";

const MAX_FAIL_COUNT = 5;

/**
 * Fire all active webhooks subscribed to this event.
 * Non-blocking — never throws. Call with .catch(() => {}) from service layer.
 */
export async function dispatchWebhook(
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: { active: true },
  });

  const payload = { event, timestamp: new Date().toISOString(), data };
  const body = JSON.stringify(payload);

  await Promise.allSettled(
    webhooks
      .filter((wh) => {
        const subscribed = wh.events.split(",").map((e) => e.trim());
        return subscribed.includes(event) || subscribed.includes("*");
      })
      .map((wh) => deliverWebhook(wh.id, wh.url, wh.secret, body))
  );
}

async function deliverWebhook(
  id: string,
  url: string,
  secret: string,
  body: string
): Promise<void> {
  const signature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": `sha256=${signature}`,
        "User-Agent": "Helpdesk-Webhook/1.0",
      },
      body,
      signal: AbortSignal.timeout(10_000), // 10 s timeout per delivery
    });

    if (res.ok) {
      await prisma.webhook.update({
        where: { id },
        data: { lastFiredAt: new Date(), failCount: 0 },
      });
    } else {
      await incrementFailCount(id);
    }
  } catch {
    await incrementFailCount(id);
  }
}

async function incrementFailCount(id: string): Promise<void> {
  const wh = await prisma.webhook.update({
    where: { id },
    data: { failCount: { increment: 1 } },
    select: { failCount: true },
  });
  // Auto-disable after too many consecutive failures
  if (wh.failCount >= MAX_FAIL_COUNT) {
    await prisma.webhook.update({ where: { id }, data: { active: false } });
  }
}
