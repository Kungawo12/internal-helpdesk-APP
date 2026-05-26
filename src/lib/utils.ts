export function timeAgo(dateString: string | Date): string {
  const mins = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

// ---------------------------------------------------------------------------
// HTML sanitisation
// ---------------------------------------------------------------------------

/**
 * Escapes user-controlled strings before embedding them in HTML email bodies.
 * Prevents XSS payloads in ticket titles/descriptions from executing in the
 * recipient's email client.
 */
export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ---------------------------------------------------------------------------
// CSV sanitisation
// ---------------------------------------------------------------------------

/**
 * Escapes a single CSV cell value per RFC 4180.
 * Prefixes formula-injection characters (=, +, -, @, |, %) with a tab so
 * spreadsheet applications don't interpret them as formulas.
 */
export function escapeCsv(value: unknown): string {
  const str = value == null ? "" : String(value);
  const safe = /^[=+\-@|%]/.test(str) ? `\t${str}` : str;
  if (safe.includes(",") || safe.includes("\n") || safe.includes('"')) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

/**
 * Builds a complete RFC 4180 CSV string from a header row and data rows.
 */
export function toCSV(header: string[], rows: unknown[][]): string {
  const lines = [
    header.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ];
  return lines.join("\r\n");
}

// ---------------------------------------------------------------------------
// IP extraction
// ---------------------------------------------------------------------------

/**
 * Extracts the real client IP from a request.
 * Only trusts x-vercel-forwarded-for (set by Vercel's proxy, not spoofable).
 * x-forwarded-for is user-controllable and must not be used for rate limiting.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

// ---------------------------------------------------------------------------
// Async retry helper
// ---------------------------------------------------------------------------

/**
 * Retries an async operation up to maxAttempts times with exponential backoff.
 * Used for OpenAI API calls which can return transient 5xx errors.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 500
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** (attempt - 1)));
      }
    }
  }
  throw lastError;
}
