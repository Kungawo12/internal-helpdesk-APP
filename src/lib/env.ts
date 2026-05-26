/**
 * Environment variable validation.
 *
 * Validated at import time so misconfigured deployments fail loudly at startup
 * rather than silently at the first request that needs the missing variable.
 *
 * Usage: import "@/lib/env" at the top of next.config.ts so validation runs
 * during the build/start process before any request is served.
 */

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
}

const ENV_VARS: EnvVar[] = [
  { name: "DATABASE_URL", required: true, description: "PostgreSQL connection string" },
  { name: "DIRECT_URL", required: true, description: "Direct PostgreSQL URL (bypasses pooler for migrations)" },
  { name: "NEXTAUTH_SECRET", required: true, description: "Random secret for NextAuth JWT signing (openssl rand -base64 32)" },
  { name: "NEXTAUTH_URL", required: true, description: "Full URL of this deployment (e.g. https://yourapp.vercel.app)" },
  { name: "ADMIN_PASSKEY", required: true, description: "Passkey required to create the first admin account" },
  // Optional — warn if absent but do not block startup
  { name: "BREVO_API_KEY", required: false, description: "Brevo (Sendinblue) API key for email sending" },
  { name: "SMTP_FROM", required: false, description: "From address for outbound emails" },
  { name: "OPENAI_API_KEY", required: false, description: "OpenAI API key for AI assistant features" },
  { name: "GOOGLE_CLIENT_ID", required: false, description: "Google OAuth client ID (enables Google SSO)" },
  { name: "GOOGLE_CLIENT_SECRET", required: false, description: "Google OAuth client secret" },
  { name: "UPSTASH_REDIS_REST_URL", required: false, description: "Upstash Redis URL for distributed rate limiting" },
  { name: "UPSTASH_REDIS_REST_TOKEN", required: false, description: "Upstash Redis token" },
  { name: "CRON_SECRET", required: false, description: "Bearer secret for Vercel cron endpoints" },
  { name: "BLOB_READ_WRITE_TOKEN", required: false, description: "Vercel Blob token for file attachments" },
];

function validateEnv(): void {
  // Only run validation in server contexts (not in the browser bundle)
  if (typeof window !== "undefined") return;

  const missing: string[] = [];
  const warnings: string[] = [];

  for (const v of ENV_VARS) {
    const value = process.env[v.name];
    if (!value) {
      if (v.required) {
        missing.push(`  ✗ ${v.name} — ${v.description}`);
      } else {
        warnings.push(`  ! ${v.name} — ${v.description} (optional — feature disabled)`);
      }
    }
  }

  if (warnings.length > 0) {
    console.warn("[env] Optional environment variables not set:\n" + warnings.join("\n"));
  }

  if (missing.length > 0) {
    throw new Error(
      "[env] Required environment variables are missing. " +
        "Set them in .env.local (development) or Vercel → Settings → Environment Variables (production).\n\n" +
        missing.join("\n") +
        "\n\nSee .env.example for descriptions of all variables."
    );
  }
}

validateEnv();
