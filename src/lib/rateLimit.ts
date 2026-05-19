// Distributed rate limiter using the Upstash Redis REST API.
// Falls back to a per-process in-memory Map when UPSTASH_REDIS_REST_URL /
// UPSTASH_REDIS_REST_TOKEN are not configured (dev / early prod).
//
// Set those two env vars (Vercel → Settings → Environment Variables) to get
// cross-instance rate limiting that survives cold starts and concurrent replicas.
//
// Usage:
//   if (await isRateLimited("login:user@example.com", 10, 15 * 60 * 1000)) {
//     return 429;
//   }

interface Entry {
  count: number;
  resetAt: number;
}

// In-memory fallback — resets on cold start, per-process only
const store = new Map<string, Entry>();

function inMemoryCheck(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}

/**
 * Atomically increments a Redis counter and sets its TTL on first write.
 * Returns the new count, or null if Redis is unavailable.
 */
async function redisIncr(key: string, windowSecs: number): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSecs, "NX"], // NX = only set expiry on first write
      ]),
    });

    if (!res.ok) return null;
    const data = await res.json();
    // pipeline returns [{result: newCount}, {result: 0|1}]
    return typeof data[0]?.result === "number" ? data[0].result : null;
  } catch {
    return null; // Redis unreachable — fall back to in-memory
  }
}

/**
 * Returns true if the request should be blocked (rate limit exceeded).
 * @param key      Unique key, e.g. "login:user@example.com" or "register:1.2.3.4"
 * @param limit    Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export async function isRateLimited(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const windowSecs = Math.ceil(windowMs / 1000);
  const count = await redisIncr(key, windowSecs);

  if (count === null) {
    // Redis unavailable — fall back to in-memory
    return inMemoryCheck(key, limit, windowMs);
  }

  return count > limit;
}
