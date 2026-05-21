/**
 * Unit tests for src/lib/rateLimit.ts (in-memory fallback path)
 *
 * We do NOT set UPSTASH_REDIS_REST_URL/TOKEN so the in-memory fallback
 * is used. This tests the logic without needing a Redis instance.
 *
 * Why test rate limiting?
 * isRateLimited is the front-line defence against brute-force attacks.
 * A regression (always returns false, count never increments) would
 * silently disable all login throttling.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Ensure Redis env vars are NOT set so in-memory path is exercised
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

import { isRateLimited } from "@/lib/rateLimit";

// Use a unique key per test to avoid state leakage between tests
let keyCounter = 0;
function uniqueKey(): string {
  return `test-key-${++keyCounter}-${Date.now()}`;
}

describe("isRateLimited (in-memory fallback)", () => {
  it("returns false for the first request within the limit", async () => {
    const key = uniqueKey();
    const result = await isRateLimited(key, 5, 60_000);
    expect(result).toBe(false);
  });

  it("returns false while under the limit", async () => {
    const key = uniqueKey();
    for (let i = 0; i < 4; i++) {
      expect(await isRateLimited(key, 5, 60_000)).toBe(false);
    }
  });

  it("returns true once the limit is exceeded", async () => {
    const key = uniqueKey();
    // limit = 3: first 3 calls are false, 4th should be true
    for (let i = 0; i < 3; i++) {
      await isRateLimited(key, 3, 60_000);
    }
    const result = await isRateLimited(key, 3, 60_000);
    expect(result).toBe(true);
  });

  it("returns false again after the window expires", async () => {
    vi.useFakeTimers();
    try {
      const key = uniqueKey();
      const WINDOW_MS = 1000;
      // Exhaust the limit
      for (let i = 0; i < 3; i++) {
        await isRateLimited(key, 3, WINDOW_MS);
      }
      expect(await isRateLimited(key, 3, WINDOW_MS)).toBe(true);
      // Advance past the window
      vi.advanceTimersByTime(WINDOW_MS + 1);
      // Should reset
      expect(await isRateLimited(key, 3, WINDOW_MS)).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("different keys have independent counters", async () => {
    const key1 = uniqueKey();
    const key2 = uniqueKey();
    // Exhaust key1
    for (let i = 0; i < 3; i++) {
      await isRateLimited(key1, 3, 60_000);
    }
    expect(await isRateLimited(key1, 3, 60_000)).toBe(true);
    // key2 should still be clear
    expect(await isRateLimited(key2, 3, 60_000)).toBe(false);
  });
});
