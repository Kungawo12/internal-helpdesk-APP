/**
 * BUG WATCHDOG — Helpdesk Platform
 * ==================================
 * Runs permanently in the background.
 * Watches src/ for any file changes → debounces 20s → scans changed files with GPT-4o-mini
 * Critical files (auth, API routes) get GPT-4o deep scan.
 * All findings are appended to BUGS.md in real time.
 *
 * Run: npm run bug-watch
 * Stop: Ctrl+C
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BUGS_FILE = path.join(ROOT, "BUGS.md");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found. Add it to .env.");
  process.exit(1);
}

// ─── Critical files → GPT-4o deep scan ───────────────────────────────────────
const CRITICAL_PATTERNS = [
  "src/lib/auth",
  "src/lib/adminAuth",
  "src/middleware",
  "src/app/api/tickets",
  "src/app/api/auth",
  "src/app/api/admin-portal",
  "src/app/api/ai",
  "src/lib/sla",
  "src/lib/automationEngine",
];

const IGNORE = ["node_modules", ".next", "generated", ".git", "scripts", "BUGS.md"];

function isCritical(relPath) {
  return CRITICAL_PATTERNS.some((p) => relPath.replace(/\\/g, "/").includes(p));
}

function shouldIgnore(relPath) {
  return IGNORE.some((p) => relPath.includes(p));
}

// ─── OpenAI ───────────────────────────────────────────────────────────────────
async function callGPT(model, systemPrompt, userPrompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

const DEEP_SYSTEM = `You are a security-focused senior software engineer auditing a production Next.js 16 App Router helpdesk app.
Perform deep analysis. Look for: auth/authorization bypass, missing input validation, exposed sensitive data, race conditions, business logic flaws, CSRF, improper error handling that leaks internals.

For each real issue found use EXACTLY this format:
BUG: [one-line title]
SEVERITY: critical | high | medium | low
FILE: [filepath]
LINE: [line number or range]
DESCRIPTION: [2-4 sentences: what the bug is, attack vector, impact]
FIX: [1-3 sentences on how to fix]
---

If no issues found, output only: NO_BUGS_FOUND`;

const FAST_SYSTEM = `You are a senior software engineer reviewing a Next.js 16 TypeScript helpdesk app.
Scan for bugs, security issues, and logic errors. Only report REAL issues.

For each issue use EXACTLY this format:
BUG: [one-line title]
SEVERITY: critical | high | medium | low
FILE: [filepath]
LINE: [line number or range]
DESCRIPTION: [2-3 sentences explaining the bug and impact]
FIX: [1-2 sentences on how to fix it]
---

If no issues found, output only: NO_BUGS_FOUND`;

// ─── Parser ───────────────────────────────────────────────────────────────────
function parseBugs(text, fallbackFile) {
  const bugs = [];
  const sections = text.split("---").map((s) => s.trim()).filter(Boolean);
  for (const section of sections) {
    if (!section.includes("BUG:")) continue;
    const get = (key) => {
      const m = section.match(new RegExp(`${key}:\\s*(.+)`));
      return m ? m[1].trim() : "unknown";
    };
    const getBlock = (key) => {
      const m = section.match(new RegExp(`${key}:\\s*([\\s\\S]+?)(?=\\n[A-Z]+:|$)`));
      return m ? m[1].trim() : "unknown";
    };
    bugs.push({
      title: get("BUG"),
      severity: get("SEVERITY").toLowerCase(),
      file: get("FILE") !== "unknown" ? get("FILE") : (fallbackFile || "unknown"),
      line: get("LINE"),
      description: getBlock("DESCRIPTION"),
      fix: getBlock("FIX"),
    });
  }
  return bugs;
}

// ─── Existing bugs in BUGS.md (to avoid duplicates) ──────────────────────────
function getExistingBugTitles() {
  if (!fs.existsSync(BUGS_FILE)) return new Set();
  const content = fs.readFileSync(BUGS_FILE, "utf-8");
  const matches = [...content.matchAll(/###\s+\d+\.\s+[🔴🟠🟡🟢⚪]\s+(.+)/g)];
  return new Set(matches.map((m) => m[1].trim().toLowerCase()));
}

// ─── Append new bugs to BUGS.md ───────────────────────────────────────────────
const SEVERITY_ICON = { critical: "🔴", high: "🟠", medium: "🟡", low: "🟢" };

function appendBugs(newBugs, scannedFile) {
  if (newBugs.length === 0) return;

  const existing = getExistingBugTitles();
  const truly_new = newBugs.filter((b) => !existing.has(b.title.trim().toLowerCase()));
  if (truly_new.length === 0) return;

  const timestamp = new Date().toLocaleString("en-GB", {
    dateStyle: "medium", timeStyle: "short", timeZone: "UTC",
  });

  let section = `\n---\n\n## 🔍 Watchdog Scan — ${timestamp} UTC\n`;
  section += `> **Triggered by change in:** \`${scannedFile}\`\n\n`;

  truly_new.forEach((bug, i) => {
    section += `### ${i + 1}. ${SEVERITY_ICON[bug.severity] || "⚪"} ${bug.title}\n\n`;
    section += `| Field | Value |\n|-------|-------|\n`;
    section += `| **Severity** | \`${bug.severity.toUpperCase()}\` |\n`;
    section += `| **File** | \`${bug.file}\` |\n`;
    section += `| **Line** | ${bug.line} |\n\n`;
    section += `**Description:** ${bug.description}\n\n`;
    section += `**Fix:** ${bug.fix}\n\n---\n`;
  });

  if (!fs.existsSync(BUGS_FILE)) {
    fs.writeFileSync(BUGS_FILE, `# 🐛 Bug Finder Report\n\n*Run \`npm run bug-finder\` for a full scan.*\n`);
  }

  fs.appendFileSync(BUGS_FILE, section, "utf-8");
  return truly_new.length;
}

// ─── Scan a single file ───────────────────────────────────────────────────────
async function scanFile(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return;
  const content = fs.readFileSync(full, "utf-8");
  if (content.trim().length < 50) return; // skip empty/tiny files

  const critical = isCritical(relPath);
  const model = critical ? "gpt-4o" : "gpt-4o-mini";
  const system = critical ? DEEP_SYSTEM : FAST_SYSTEM;

  try {
    const result = await callGPT(
      model,
      system,
      `FILE: ${relPath}\n\n\`\`\`typescript\n${content.slice(0, 5000)}\n\`\`\``
    );

    if (result === "NO_BUGS_FOUND") {
      log(`✅ Clean: ${relPath}`);
      return;
    }

    const bugs = parseBugs(result, relPath);
    if (bugs.length === 0) {
      log(`✅ Clean: ${relPath}`);
      return;
    }

    const added = appendBugs(bugs, relPath);
    if (added > 0) {
      log(`⚠️  ${added} new issue(s) found in ${relPath} → written to BUGS.md`);
      bugs.forEach((b) => log(`   ${SEVERITY_ICON[b.severity] || "⚪"} [${b.severity.toUpperCase()}] ${b.title}`));
    } else {
      log(`✅ Clean (already reported): ${relPath}`);
    }
  } catch (err) {
    log(`❌ Scan failed for ${relPath}: ${err.message}`);
  }
}

// ─── Logger ───────────────────────────────────────────────────────────────────
function log(msg) {
  const time = new Date().toLocaleTimeString("en-GB", { timeZone: "UTC" });
  console.log(`[${time}] ${msg}`);
}

// ─── Watchdog ─────────────────────────────────────────────────────────────────
const pendingScans = new Map(); // relPath → timer

function scheduleFileScan(relPath) {
  if (shouldIgnore(relPath)) return;
  if (![".ts", ".tsx"].some((e) => relPath.endsWith(e))) return;

  // Debounce: wait 20s after last change before scanning
  if (pendingScans.has(relPath)) {
    clearTimeout(pendingScans.get(relPath));
  }

  const timer = setTimeout(async () => {
    pendingScans.delete(relPath);
    log(`📡 Change detected: ${relPath} — scanning...`);
    await scanFile(relPath);
  }, 20000); // 20 second debounce

  pendingScans.set(relPath, timer);
}

// ─── Startup: scan recently modified files (last 24h) ────────────────────────
async function scanRecentFiles() {
  log("🚀 Startup scan: checking recently modified files...");
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const srcDir = path.join(ROOT, "src");
  const recent = [];

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const rel = path.relative(ROOT, full);
      if (shouldIgnore(rel)) continue;
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if ([".ts", ".tsx"].some((e) => entry.endsWith(e))) {
        if (stat.mtimeMs > cutoff) recent.push(rel);
      }
    }
  };
  walk(srcDir);

  if (recent.length === 0) {
    log("✅ No recently modified files to scan.");
    return;
  }

  log(`Found ${recent.length} recently modified file(s). Scanning...`);
  for (const f of recent) {
    await scanFile(f);
    await new Promise((r) => setTimeout(r, 300));
  }
  log("✅ Startup scan complete.");
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`
╔══════════════════════════════════════╗
║   🐛 BUG WATCHDOG — Active          ║
║   Watching: src/                    ║
║   Report:   BUGS.md                 ║
║   Stop:     Ctrl+C                  ║
╚══════════════════════════════════════╝
`);

  // Startup scan
  await scanRecentFiles();

  // Start watching
  const srcDir = path.join(ROOT, "src");
  log("👁  Watchdog active — monitoring src/ for changes...\n");

  fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    const relPath = path.join("src", filename);
    scheduleFileScan(relPath.replace(/\\/g, "/"));
  });

  // Keep process alive
  process.on("SIGINT", () => {
    log("\n🛑 Watchdog stopped. BUGS.md contains all findings.");
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("❌ Watchdog crashed:", err);
  process.exit(1);
});
