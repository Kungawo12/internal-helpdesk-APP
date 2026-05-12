/**
 * BUG FINDER — Helpdesk Platform
 * ================================
 * Uses GPT-4o-mini (fast scan) + GPT-4o (deep analysis on critical files)
 * Scans all API routes, lib files, and key components.
 * Writes findings to BUGS.md for review by the senior engineer and Tenzin.
 *
 * Run: npm run bug-finder
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found in environment. Add it to .env first.");
  process.exit(1);
}

// ─── Config ──────────────────────────────────────────────────────────────────

const CRITICAL_FILES = [
  // Auth & security
  "src/lib/auth.ts",
  "src/lib/adminAuth.ts",
  "src/middleware.ts",
  // Core API routes
  "src/app/api/tickets/route.ts",
  "src/app/api/tickets/[id]/route.ts",
  "src/app/api/tickets/[id]/resolve/route.ts",
  "src/app/api/tickets/[id]/assign/route.ts",
  "src/app/api/tickets/[id]/comments/route.ts",
  "src/app/api/auth/register/route.ts",
  "src/app/api/auth/forgot-password/route.ts",
  "src/app/api/auth/reset-password/route.ts",
  "src/app/api/admin-portal/users/route.ts",
  "src/app/api/admin-portal/users/[id]/route.ts",
  "src/app/api/admin-portal/wipe/route.ts",
  "src/app/api/ai/chat/route.ts",
  "src/app/api/ai/copilot/route.ts",
  // Business logic
  "src/lib/sla.ts",
  "src/lib/automationEngine.ts",
  "src/lib/email.ts",
  "src/lib/notify.ts",
  "src/lib/audit.ts",
];

const SCAN_DIRS = [
  "src/app/api",
  "src/lib",
  "src/app/dashboard",
  "src/components/dashboard",
];

const IGNORE_PATTERNS = [
  "node_modules", ".next", "generated", "__pycache__",
  "test", "spec", ".test.", ".spec.",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAllFiles(dir) {
  const exts = [".ts", ".tsx"];
  const results = [];
  const absDir = path.join(ROOT, dir);
  if (!fs.existsSync(absDir)) return results;
  const walk = (current) => {
    for (const entry of fs.readdirSync(current)) {
      const full = path.join(current, entry);
      const rel = path.relative(ROOT, full);
      if (IGNORE_PATTERNS.some((p) => rel.includes(p))) continue;
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (exts.some((e) => entry.endsWith(e))) results.push(rel);
    }
  };
  walk(absDir);
  return results;
}

function readFile(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, "utf-8");
}

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
      max_tokens: 1200,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// ─── Prompts ─────────────────────────────────────────────────────────────────

const FAST_SCAN_SYSTEM = `You are a senior software engineer reviewing a Next.js 16 App Router TypeScript helpdesk application.
Scan the provided file for bugs, security issues, and logic errors.
Be concise. Only report REAL issues — not style preferences or minor nitpicks.

For each bug found, output exactly this format:
BUG: [one-line title]
SEVERITY: critical | high | medium | low
FILE: [filename]
LINE: [approximate line number or range, or "unknown"]
DESCRIPTION: [2-3 sentences explaining the bug and its impact]
FIX: [1-2 sentences on how to fix it]
---

If no bugs found, output: NO_BUGS_FOUND`;

const DEEP_ANALYSIS_SYSTEM = `You are a security-focused senior software engineer auditing a production Next.js helpdesk app.
Perform deep analysis on this critical file. Look for:
- Authentication/authorization bypass
- SQL injection or Prisma query manipulation
- Missing input validation
- Race conditions
- Exposed sensitive data in API responses
- Improper error handling that leaks internals
- Business logic flaws (e.g., employees accessing other users' tickets)
- Missing rate limiting
- CSRF vulnerabilities

Use this exact format per issue:
BUG: [one-line title]
SEVERITY: critical | high | medium | low
FILE: [filename]
LINE: [approximate line number or range]
DESCRIPTION: [3-4 sentences explaining the bug, attack vector, and impact]
FIX: [2-3 sentences on how to fix it]
---

If no issues found, output: NO_BUGS_FOUND`;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🐛 BUG FINDER — Starting scan...\n");
  const startTime = Date.now();
  const allBugs = [];
  let filesScanned = 0;

  // Phase 1: Deep analysis of critical files using GPT-4o
  console.log("🔍 Phase 1: Deep analysis of critical files (GPT-4o)...");
  for (const relPath of CRITICAL_FILES) {
    const content = readFile(relPath);
    if (!content) {
      console.log(`  ⚠️  Skipping (not found): ${relPath}`);
      continue;
    }
    process.stdout.write(`  Analysing: ${relPath} ... `);
    try {
      const result = await callGPT(
        "gpt-4o",
        DEEP_ANALYSIS_SYSTEM,
        `FILE: ${relPath}\n\n\`\`\`typescript\n${content.slice(0, 6000)}\n\`\`\``
      );
      filesScanned++;
      if (result !== "NO_BUGS_FOUND") {
        const bugs = parseBugs(result, relPath, "deep");
        allBugs.push(...bugs);
        console.log(`⚠️  ${bugs.length} issue(s)`);
      } else {
        console.log("✅ clean");
      }
    } catch (err) {
      console.log(`❌ error: ${err.message}`);
    }
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  // Phase 2: Fast scan of all remaining files using GPT-4o-mini
  console.log("\n⚡ Phase 2: Fast scan of all other files (GPT-4o-mini)...");
  const allFiles = [...new Set(SCAN_DIRS.flatMap(getAllFiles))];
  const remainingFiles = allFiles.filter((f) => !CRITICAL_FILES.includes(f));

  // Batch files together to reduce API calls (3 files per call)
  const batches = [];
  for (let i = 0; i < remainingFiles.length; i += 3) {
    batches.push(remainingFiles.slice(i, i + 3));
  }

  for (const batch of batches) {
    const batchContent = batch
      .map((f) => {
        const content = readFile(f);
        if (!content) return null;
        return `=== FILE: ${f} ===\n${content.slice(0, 2500)}`;
      })
      .filter(Boolean)
      .join("\n\n");

    if (!batchContent) continue;
    process.stdout.write(`  Scanning batch of ${batch.length} files ... `);
    try {
      const result = await callGPT(
        "gpt-4o-mini",
        FAST_SCAN_SYSTEM,
        batchContent
      );
      filesScanned += batch.length;
      if (result !== "NO_BUGS_FOUND") {
        const bugs = parseBugs(result, null, "fast");
        allBugs.push(...bugs);
        console.log(`⚠️  ${bugs.length} issue(s)`);
      } else {
        console.log("✅ clean");
      }
    } catch (err) {
      console.log(`❌ error: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  // Phase 3: Generate report
  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n📄 Generating BUGS.md report...`);
  writeReport(allBugs, filesScanned, duration);

  const criticalCount = allBugs.filter((b) => b.severity === "critical").length;
  const highCount = allBugs.filter((b) => b.severity === "high").length;
  console.log(`\n✅ Scan complete in ${duration}s`);
  console.log(`   Files scanned: ${filesScanned}`);
  console.log(`   Bugs found: ${allBugs.length} (${criticalCount} critical, ${highCount} high)`);
  console.log(`   Report: BUGS.md\n`);
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseBugs(text, fallbackFile, phase) {
  const bugs = [];
  const sections = text.split("---").map((s) => s.trim()).filter(Boolean);
  for (const section of sections) {
    if (!section.includes("BUG:")) continue;
    const get = (key) => {
      const match = section.match(new RegExp(`${key}:\\s*(.+)`));
      return match ? match[1].trim() : "unknown";
    };
    const getMultiline = (key) => {
      const match = section.match(new RegExp(`${key}:\\s*([\\s\\S]+?)(?=\\n[A-Z]+:|$)`));
      return match ? match[1].trim() : "unknown";
    };
    bugs.push({
      title: get("BUG"),
      severity: get("SEVERITY").toLowerCase(),
      file: get("FILE") !== "unknown" ? get("FILE") : fallbackFile || "unknown",
      line: get("LINE"),
      description: getMultiline("DESCRIPTION"),
      fix: getMultiline("FIX"),
      phase,
    });
  }
  return bugs;
}

// ─── Report Writer ────────────────────────────────────────────────────────────

function writeReport(bugs, filesScanned, duration) {
  const now = new Date().toLocaleString("en-GB", {
    dateStyle: "full", timeStyle: "short", timeZone: "UTC",
  });

  const critical = bugs.filter((b) => b.severity === "critical");
  const high = bugs.filter((b) => b.severity === "high");
  const medium = bugs.filter((b) => b.severity === "medium");
  const low = bugs.filter((b) => b.severity === "low");

  const severityIcon = { critical: "🔴", high: "🟠", medium: "🟡", low: "🟢" };
  const severityOrder = ["critical", "high", "medium", "low"];

  const formatBug = (bug, idx) => `
### ${idx + 1}. ${severityIcon[bug.severity] || "⚪"} ${bug.title}

| Field | Value |
|-------|-------|
| **Severity** | \`${bug.severity.toUpperCase()}\` |
| **File** | \`${bug.file}\` |
| **Line** | ${bug.line} |
| **Scan Type** | ${bug.phase === "deep" ? "Deep (GPT-4o)" : "Fast (GPT-4o-mini)"} |

**Description:** ${bug.description}

**Fix:** ${bug.fix}

---`;

  let report = `# 🐛 Bug Finder Report

> **Generated:** ${now} UTC
> **Files Scanned:** ${filesScanned}
> **Scan Duration:** ${duration}s
> **Models Used:** GPT-4o (critical files) + GPT-4o-mini (all other files)

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | ${critical.length} |
| 🟠 High | ${high.length} |
| 🟡 Medium | ${medium.length} |
| 🟢 Low | ${low.length} |
| **Total** | **${bugs.length}** |

> **Instructions for Tenzin & Senior Engineer:**
> Review each issue below. Mark resolved ones with ~~strikethrough~~ or delete the entry.
> Do NOT auto-fix — each fix must be verified and approved before implementation.

---

`;

  if (bugs.length === 0) {
    report += "## ✅ No bugs found\n\nThe codebase looks clean. Run again after new features are added.\n";
  } else {
    for (const severity of severityOrder) {
      const group = bugs.filter((b) => b.severity === severity);
      if (group.length === 0) continue;
      report += `## ${severityIcon[severity]} ${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity (${group.length})\n`;
      group.forEach((bug, i) => {
        report += formatBug(bug, i);
      });
      report += "\n";
    }
  }

  report += `\n---\n*Report generated by Bug Finder — run \`npm run bug-finder\` to refresh.*\n`;

  fs.writeFileSync(path.join(ROOT, "BUGS.md"), report, "utf-8");
}

main().catch((err) => {
  console.error("❌ Bug Finder crashed:", err);
  process.exit(1);
});
