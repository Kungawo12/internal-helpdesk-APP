// Simple in-memory rate limiter. Resets on server restart.
// TODO (H-8): replace with Upstash Redis for multi-instance correctness.
// Use x-vercel-forwarded-for as the IP key — it is set by Vercel's proxy
// and cannot be spoofed, unlike x-forwarded-for.

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

/**
 * Returns true if the request should be blocked.
 * @param key      Unique key (e.g. IP + route)
 * @param limit    Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  if (entry.count > limit) return true;
  return false;
}
