/**
 * UX TESTER — Customer Experience Audit
 * =======================================
 * GPT-4o acts as 4 different real users navigating the helpdesk.
 * Each persona walks through their user journey, reports friction,
 * missing features, design issues, and what they wish existed.
 *
 * Writes full report to UX_REPORT.md
 *
 * Run: npm run ux-test
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPORT_FILE = path.join(ROOT, "UX_REPORT.md");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found.");
  process.exit(1);
}

// ─── Personas ─────────────────────────────────────────────────────────────────

const PERSONAS = [
  {
    name: "Sarah — New Employee",
    role: "employee",
    emoji: "👩‍💼",
    background: `You are Sarah, 28, recently joined the company as a Marketing Coordinator.
You're not very technical. You've never used an internal helpdesk before.
Your laptop screen keeps flickering and you need IT help. You also need to ask HR about your holiday allowance.
You log into the helpdesk for the first time.`,
    pages: [
      "src/app/page.tsx",
      "src/app/login/page.tsx",
      "src/app/dashboard/page.tsx",
      "src/app/dashboard/create/page.tsx",
      "src/app/dashboard/kb/page.tsx",
    ],
    journey: `Walk through this journey:
1. Land on the homepage — what's your first impression?
2. Sign in — any confusion?
3. Reach the dashboard — do you understand what to do?
4. Try to submit an IT ticket about your flickering screen — how easy is it?
5. Try to find an HR article about holiday allowance in the knowledge base
6. Check your ticket status later`,
  },
  {
    name: "James — IT Staff",
    role: "it_staff",
    emoji: "🧑‍💻",
    background: `You are James, 34, IT Support Engineer. You handle 20-30 tickets a day.
You care about speed — you need to process tickets fast, see priorities clearly,
and not waste time on slow UI. You're used to tools like Jira and Zendesk.
You've been using this helpdesk for 2 weeks.`,
    pages: [
      "src/app/dashboard/layout.tsx",
      "src/app/dashboard/staff/page.tsx",
      "src/app/dashboard/ticket/[id]/page.tsx",
    ],
    journey: `Walk through this journey:
1. Log in and reach your ticket queue — first impressions vs tools like Jira/Zendesk?
2. Find the highest priority open ticket — how easy is it to spot urgency?
3. Open a ticket, read it, post an internal note, then mark it in progress
4. Resolve a ticket with a solution
5. Use the AI Copilot to draft a reply — does it feel useful or gimmicky?
6. End of day — how efficient did the tool feel overall?`,
  },
  {
    name: "Priya — HR Staff",
    role: "hr_staff",
    emoji: "👩‍🏫",
    background: `You are Priya, 41, HR Business Partner. You handle sensitive employee requests —
payroll queries, leave requests, grievances. You care about professionalism, privacy,
and clear communication. You're not technical at all and hate confusing interfaces.`,
    pages: [
      "src/app/dashboard/layout.tsx",
      "src/app/dashboard/staff/page.tsx",
      "src/app/dashboard/ticket/[id]/page.tsx",
    ],
    journey: `Walk through this journey:
1. Check your HR ticket queue — are HR tickets clearly separated from IT?
2. Open a sensitive payroll ticket — does the interface feel professional/private enough?
3. Respond to an employee via comment — is it clear if they'll be notified?
4. Try to filter only unresolved HR tickets
5. Look at the audit trail / history of a ticket
6. Overall — would you trust this tool with sensitive HR matters?`,
  },
  {
    name: "David — Senior Manager",
    role: "admin",
    emoji: "👨‍💼",
    background: `You are David, 52, Head of Operations. You don't use the tool daily —
you check it weekly for a 10-minute overview. You want to see: are things under control?
Are SLAs being met? Is the team performing? You present this data to the board.
You find dashboards overwhelming if they have too much noise.`,
    pages: [
      "src/app/dashboard/manager/page.tsx",
      "src/app/admin/page.tsx",
      "src/app/admin/analytics/page.tsx",
    ],
    journey: `Walk through this journey:
1. Log in and navigate to your overview — does it immediately tell you if things are OK or not?
2. Check SLA compliance — can you find the number in under 5 seconds?
3. See which staff member is performing best and worst
4. Check if there are any urgent/overdue tickets requiring attention
5. Navigate to analytics — does it give you board-ready insights?
6. Would you feel confident presenting this data to the board?`,
  },
];

// ─── Page reader ──────────────────────────────────────────────────────────────

function readPage(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return `[File not found: ${relPath}]`;
  const content = fs.readFileSync(full, "utf-8");
  return content.slice(0, 5000); // cap to avoid token limits
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
      temperature: 0.7,
      max_tokens: 2000,
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

function buildSystemPrompt(persona) {
  return `${persona.background}

You are doing a real user experience audit of an internal company helpdesk web application.
You will be shown the actual source code (React/Next.js) of the pages you navigate.

Your job is to think and respond EXACTLY like a real user with your background.
Do NOT analyse the code technically. Read it to understand what the UI looks like and how it works.
Respond from a pure user perspective — frustrations, confusion, delight, missing things.

Structure your response EXACTLY as follows:

## 🧭 My Journey
A narrative of what I experienced step by step. First person. Honest and specific.

## 😤 What Frustrated Me
Bullet list. Specific friction points. What made me slow down or confused me.

## 😊 What I Liked
Bullet list. What worked well, what felt smooth or professional.

## ❓ Questions I Had That Were Never Answered
Bullet list. Things I wanted to know but couldn't find.

## 🚨 Showstopper Issues
Bullet list. Things that would make me give up or complain to my manager. If none, say "None — but close calls below."

## 💡 What I Wish Existed
Bullet list. Features, design changes, or information I wanted but wasn't there.

## ⭐ Overall Rating
Score out of 10 with one sentence explanation.

Be brutally honest. This report will be read by the engineering team and used to improve the product.`;
}

// ─── Run one persona ──────────────────────────────────────────────────────────

async function testPersona(persona) {
  console.log(`\n${persona.emoji} Testing as: ${persona.name}...`);

  const pageContents = persona.pages
    .map((p) => {
      const content = readPage(p);
      return `\n=== PAGE: ${p} ===\n${content}\n`;
    })
    .join("\n");

  const userPrompt = `Here are the pages you will navigate through (source code):

${pageContents}

Your journey to complete:
${persona.journey}

Now write your full UX audit report.`;

  const report = await callGPT4(buildSystemPrompt(persona), userPrompt);
  return report;
}

// ─── Synthesis ────────────────────────────────────────────────────────────────

async function synthesise(personaReports) {
  console.log("\n🧠 Synthesising findings across all users...");

  const combined = personaReports
    .map((r) => `### ${r.persona.emoji} ${r.persona.name}\n${r.report}`)
    .join("\n\n---\n\n");

  const synthesis = await callGPT4(
    `You are a senior UX director synthesising customer research from 4 user interviews.
Read all 4 user reports and produce an executive summary.

Structure EXACTLY as:

## 🔴 Critical Issues (Fix Immediately)
Numbered list. Issues that appeared across 2+ users or are showstoppers.

## 🟠 High Priority UX Improvements
Numbered list. Significant friction points that degrade experience.

## 🟡 Design Recommendations
Numbered list. Visual and interaction design improvements.

## 💎 Top 5 Feature Requests
Ranked list. Features users wished existed, consolidated across all personas.

## 📊 Average Rating
Average score across all 4 users with commentary.

## 🎯 One Sentence Summary
What is the #1 thing this product needs right now?

Be specific, actionable, and direct.`,
    `Here are the 4 user reports:\n\n${combined}`
  );

  return synthesis;
}

// ─── Write report ─────────────────────────────────────────────────────────────

function writeReport(personaReports, synthesis) {
  const now = new Date().toLocaleString("en-GB", {
    dateStyle: "full", timeStyle: "short", timeZone: "UTC",
  });

  let report = `# 🧪 UX Customer Experience Report

> **Generated:** ${now} UTC
> **Method:** GPT-4o acting as real users navigating the actual page source code
> **Personas tested:** ${personaReports.length}

---

## Executive Summary

${synthesis}

---

# Individual User Reports

`;

  for (const r of personaReports) {
    report += `---\n\n# ${r.persona.emoji} ${r.persona.name} (${r.persona.role})\n\n`;
    report += `> *${r.persona.background.split("\n")[0]}*\n\n`;
    report += r.report + "\n\n";
  }

  report += `\n---\n*UX Report generated by UX Tester — run \`npm run ux-test\` to refresh.*\n`;

  fs.writeFileSync(REPORT_FILE, report, "utf-8");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`
╔══════════════════════════════════════════╗
║   🧪 UX TESTER — Customer Audit         ║
║   4 personas · GPT-4o                   ║
║   Report → UX_REPORT.md                 ║
╚══════════════════════════════════════════╝
`);

  const startTime = Date.now();
  const personaReports = [];

  for (const persona of PERSONAS) {
    try {
      const report = await testPersona(persona);
      personaReports.push({ persona, report });
      console.log(`  ✅ ${persona.name} — done`);
    } catch (err) {
      console.log(`  ❌ ${persona.name} — failed: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  const synthesis = await synthesise(personaReports);

  console.log("\n📄 Writing UX_REPORT.md...");
  writeReport(personaReports, synthesis);

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n✅ UX audit complete in ${duration}s`);
  console.log(`   Personas tested: ${personaReports.length}/4`);
  console.log(`   Report: UX_REPORT.md\n`);
}

main().catch((err) => {
  console.error("❌ UX Tester crashed:", err);
  process.exit(1);
});
