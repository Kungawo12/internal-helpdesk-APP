/**
 * UX DESIGN TESTER — Visual & Dark Mode Audit
 * =============================================
 * GPT-4o acts as a professional UX designer reviewing the helpdesk
 * across ALL pages, checking:
 *   - Visual design quality (spacing, typography, colour)
 *   - Light mode vs dark mode consistency
 *   - Colour palette coherence and accessibility
 *   - Empty space usage
 *   - Hover states and interactive design
 *   - Overall polish and brand consistency
 *
 * Writes full report to UX_DESIGN_REPORT.md
 *
 * Run: npm run ux-design-test
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPORT_FILE = path.join(ROOT, "UX_DESIGN_REPORT.md");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found.");
  process.exit(1);
}

// ─── Pages to audit ───────────────────────────────────────────────────────────

const PAGES = [
  { path: "src/app/page.tsx",                        name: "Landing Page" },
  { path: "src/app/login/page.tsx",                  name: "Login Page" },
  { path: "src/app/register/page.tsx",               name: "Register Page" },
  { path: "src/app/dashboard/layout.tsx",            name: "Dashboard Layout / Sidebar" },
  { path: "src/app/dashboard/page.tsx",              name: "Employee Dashboard" },
  { path: "src/app/dashboard/create/page.tsx",       name: "Create Ticket" },
  { path: "src/app/dashboard/ticket/[id]/page.tsx",  name: "Ticket Detail" },
  { path: "src/app/dashboard/staff/page.tsx",        name: "Staff Queue" },
  { path: "src/app/dashboard/kb/page.tsx",           name: "Knowledge Base" },
  { path: "src/app/dashboard/manager/page.tsx",      name: "Manager Dashboard" },
  { path: "src/app/admin/page.tsx",                  name: "Admin Portal Home" },
  { path: "src/app/admin/analytics/page.tsx",        name: "Admin Analytics" },
  { path: "src/app/globals.css",                     name: "Global CSS / Design Tokens" },
];

// ─── File reader ──────────────────────────────────────────────────────────────

function readFile(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return `[File not found: ${relPath}]`;
  return fs.readFileSync(full, "utf-8").slice(0, 6000);
}

// ─── OpenAI ───────────────────────────────────────────────────────────────────

async function callGPT4(systemPrompt, userPrompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.6,
      max_tokens: 2500,
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

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior UX designer and visual design expert with 15 years of experience at top product companies. You specialise in design systems, dark mode implementation, colour theory, and visual hierarchy.

You are conducting a thorough visual and UX design audit of an internal company helpdesk application. You will be given the actual React/Next.js source code of each page.

Your job is to:
1. Read the code to understand exactly what the UI looks like — colours used, spacing, component layout, Tailwind classes applied
2. Identify REAL design issues based on what the code actually produces
3. Check both light mode and dark mode specifically — look for dark: classes, missing dark: variants, colour mismatches
4. Be brutally specific: don't say "improve spacing" — say "the ticket card has p-4 but the surrounding grid has gap-2 which creates visual tension"

FOCUS AREAS for each page:
- Colour palette: consistent? accessible? beautiful in both light and dark?
- Typography: sizing scale, weight hierarchy, letter-spacing
- Spacing: padding/margin rhythm, whitespace use (too much empty space? too cramped?)
- Dark mode: every element that has a light colour — does it have a dark: variant? Are dark mode colours too similar to light mode?
- Hover states: do interactive elements have good hover feedback?
- Visual hierarchy: is the most important info most prominent?
- Component consistency: do cards, buttons, badges look cohesive across pages?
- Empty states: do pages with no data handle that gracefully?
- Brand polish: does the page feel professional and cohesive?

Be specific, reference actual CSS classes and colour values from the code. This report will be actioned by developers.`;

// ─── Audit one page ───────────────────────────────────────────────────────────

async function auditPage(page) {
  console.log(`  🎨 Auditing: ${page.name}...`);

  const content = readFile(page.path);
  const globalCss = readFile("src/app/globals.css");

  const userPrompt = `## Page: ${page.name}
File: ${page.path}

### Global CSS (design tokens + utilities):
\`\`\`css
${globalCss.slice(0, 2000)}
\`\`\`

### Page source code:
\`\`\`tsx
${content}
\`\`\`

Conduct a full visual design audit of this page. Focus especially on:
1. Does dark mode work properly? List every element that's missing dark: variants
2. What colours are used and do they form a coherent palette?
3. Spacing and layout issues — empty space, cramped areas
4. Typography hierarchy issues
5. Hover/interactive states
6. What are the top 3 design improvements needed?

Structure your response as:

### 🌑 Dark Mode Issues
Specific list with exact class names missing

### 🎨 Colour & Visual Issues
Specific issues with colour usage, contrast, consistency

### 📐 Spacing & Layout Issues
Whitespace problems, cramped areas, alignment

### ✍️ Typography Issues
Font size hierarchy, weight, readability

### 🖱️ Interaction Design Issues
Hover states, click targets, animations

### ✅ What Works Well
2-3 things that are done right

### 🔧 Top 3 Fixes (Priority Order)
Actionable, specific, code-level fixes

### ⭐ Design Score
X/10 with one line reason`;

  return await callGPT4(SYSTEM_PROMPT, userPrompt);
}

// ─── Synthesis ────────────────────────────────────────────────────────────────

async function synthesise(pageReports) {
  console.log("\n🧠 Synthesising design findings across all pages...");

  const combined = pageReports
    .map((r) => `### ${r.page.name}\n${r.report}`)
    .join("\n\n---\n\n");

  return await callGPT4(
    `You are a senior design director synthesising a visual audit of a web application.
Read all page audits and produce an executive design brief.

Structure EXACTLY as:

## 🔴 Critical Design Failures (Fix This Week)
Issues that make the product look broken or unprofessional. Max 5.

## 🟠 Dark Mode Fix List
Every dark mode issue found, consolidated, with the exact Tailwind classes needed.
Format: "Page — Element — Add class: dark:xxx"

## 🟡 Design System Inconsistencies
Where colours, spacing, or components differ across pages when they should match.

## 🎨 Colour Palette Verdict
Is the overall colour palette coherent? What colours are overused, underused, or clashing?

## 📱 Responsive Design Issues
Any breakpoint or mobile issues spotted.

## 💎 Top 10 Design Improvements (Ranked)
Ranked list — biggest visual impact first. Each fix must be specific and actionable.

## ⭐ Overall Design Score
Average across all pages, X/10, with one paragraph of honest assessment.

Be direct and specific. Reference exact pages and CSS classes.`,
    `Here are all the page audits:\n\n${combined}`
  );
}

// ─── Write report ─────────────────────────────────────────────────────────────

function writeReport(pageReports, synthesis) {
  const now = new Date().toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  });

  let report = `# 🎨 UX Design & Dark Mode Audit Report

> **Generated:** ${now} UTC
> **Method:** GPT-4o visual design expert reviewing actual page source code
> **Pages audited:** ${pageReports.length}
> **Scope:** Visual design quality, dark mode consistency, colour palette, spacing, typography

---

## Executive Design Brief

${synthesis}

---

# Individual Page Audits

`;

  for (const r of pageReports) {
    report += `---\n\n## 📄 ${r.page.name}\n\`${r.page.path}\`\n\n`;
    report += r.report + "\n\n";
  }

  report += `\n---\n*Design audit generated by UX Design Tester — run \`npm run ux-design-test\` to refresh.*\n`;

  fs.writeFileSync(REPORT_FILE, report, "utf-8");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`
╔══════════════════════════════════════════════╗
║   🎨 UX DESIGN TESTER — Visual Audit        ║
║   ${PAGES.length} pages · GPT-4o design expert         ║
║   Light + Dark mode · Colour · Spacing      ║
║   Report → UX_DESIGN_REPORT.md              ║
╚══════════════════════════════════════════════╝
`);

  const startTime = Date.now();
  const pageReports = [];

  for (const page of PAGES) {
    try {
      const report = await auditPage(page);
      pageReports.push({ page, report });
      console.log(`  ✅ ${page.name} — done`);
    } catch (err) {
      console.log(`  ❌ ${page.name} — failed: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  const synthesis = await synthesise(pageReports);

  console.log("\n📄 Writing UX_DESIGN_REPORT.md...");
  writeReport(pageReports, synthesis);

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n✅ Design audit complete in ${duration}s`);
  console.log(`   Pages audited: ${pageReports.length}/${PAGES.length}`);
  console.log(`   Report: UX_DESIGN_REPORT.md\n`);
}

main().catch((err) => {
  console.error("❌ Design Tester crashed:", err);
  process.exit(1);
});
