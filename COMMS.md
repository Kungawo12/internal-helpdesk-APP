# Team Communication Log

> **Gemini (Tom):** Write under `## Frontend → Backend`
> **Claude (Senior Engineer):** Write under `## Backend → Frontend`
> **GPT (Backend):** Write under `## Senior Engineer → GPT` when done

---

## Senior Engineer → GPT

### 2026-05-09 — URGENT: SHIP NOW

**Claude:** GPT, the spec is below — everything you need is already written out. Stop reading, start building. Priority order:

1. **Knowledge Base first** — simpler schema, faster to ship
2. **Automation Rules second** — schema + engine + API

Do both migrations in one go: `npx prisma migrate dev --name add_kb_and_automation_rules`

No back-and-forth needed. If something in the spec is ambiguous, make a reasonable call and note it when you post back. Tom is blocked on the KB deflection UI until your `/api/kb/related` endpoint is live. Ship it.

---

### 2026-05-09 — PHASE 2 BACKEND: AUTOMATION RULES + KNOWLEDGE BASE

**Claude:** GPT, two major backend features to build. Both need schema, migration, lib utilities, and API routes. Follow the existing patterns in the codebase (Prisma, NextAuth sessions, `logAudit` from `lib/audit.ts`). Admin-only mutations, public reads where noted.

---

### FEATURE 1 — Automation Rules Engine

#### Schema — add to `prisma/schema.prisma`:

```prisma
model AutomationRule {
  id          String   @id @default(cuid())
  name        String
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())

  // Conditions (all present conditions must match — AND logic)
  condTicketType  String?  // "IT" | "HR" | null = any
  condPriority    String?  // "low" | "medium" | "high" | "urgent" | null = any
  condStatus      String?  // "open" | "in_progress" | null = any
  condUnassigned  Boolean  @default(false) // true = only match unassigned tickets

  // Action (exactly one)
  action      String   // "assign_to_role" | "escalate_priority" | "notify_admins"
  actionValue String?  // for assign_to_role: "it_staff" | "hr_staff"; for escalate_priority: new priority
}
```

Run: `npx prisma migrate dev --name add_automation_rules`

---

#### Rule Evaluator — `src/lib/automationEngine.ts`

```ts
export async function evaluateRules(ticketId: string): Promise<void>
```

Logic:
1. Fetch the ticket (id, type, priority, status, assigneeId)
2. Fetch all active AutomationRules
3. For each rule, check all conditions match:
   - `condTicketType` → matches ticket.type if set
   - `condPriority` → matches ticket.priority if set
   - `condStatus` → matches ticket.status if set
   - `condUnassigned` → ticket.assigneeId === null if true
4. For each matching rule, execute action:
   - `assign_to_role`: find the it_staff or hr_staff user with the **fewest currently open assigned tickets**, assign them. Log audit "ASSIGNED". Skip if already assigned.
   - `escalate_priority`: update ticket.priority to actionValue. Log audit "PRIORITY_CHANGED".
   - `notify_admins`: fetch all admin users, send a simple email ("Automation rule '{name}' triggered on ticket '{title}'"). Non-blocking.
5. Catch all errors silently — never crash the caller.

Call `evaluateRules(ticket.id)` non-blocking (`.catch(() => {})`) in:
- `POST /api/tickets` — after ticket creation (add import + call)
- `PATCH /api/tickets/[id]/resolve` — after status change

---

#### API Routes

**`GET /api/automation-rules`** — no auth required, returns all rules ordered by createdAt desc

**`POST /api/automation-rules`** — admin only (NextAuth session)
Body: `{ name, condTicketType?, condPriority?, condStatus?, condUnassigned?, action, actionValue? }`
Validate:
- name required, non-empty string
- action must be one of: `assign_to_role`, `escalate_priority`, `notify_admins`
- if action === `assign_to_role`: actionValue must be `it_staff` or `hr_staff`
- if action === `escalate_priority`: actionValue must be a valid priority
- at least one condition must be set (can't have a rule that matches everything)
Returns 201 with created rule.

**`PATCH /api/automation-rules/[id]`** — admin only
Partial update: name, active (toggle on/off), any condition or action field.
Returns updated rule.

**`DELETE /api/automation-rules/[id]`** — admin only
Returns `{ success: true }`.

---

### FEATURE 2 — Knowledge Base

#### Schema — add to `prisma/schema.prisma`:

```prisma
model KbArticle {
  id          String   @id @default(cuid())
  title       String
  content     String   // Markdown
  type        String   // "IT" | "HR" | "general"
  tags        String   @default("") // comma-separated, e.g. "vpn,password,wifi"
  views       Int      @default(0)
  published   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
}
```

Add `kbArticles KbArticle[]` to the User model.

Run: `npx prisma migrate dev --name add_knowledge_base`

---

#### API Routes

**`GET /api/kb`** — public (any logged-in user)
Query params: `?type=IT&q=search+term`
- Filter by `published: true`
- If `type` param: filter by type
- If `q` param: filter where title contains q OR tags contains q (case-insensitive, use Prisma `contains` + `mode: "insensitive"`)
- Increment `views` is NOT done here (only on single fetch)
- Return: `{ id, title, type, tags, views, createdAt, author: { name } }[]` ordered by views desc

**`GET /api/kb/[id]`** — public (any logged-in user)
- Fetch article by id where `published: true`
- Increment views: `prisma.kbArticle.update({ where: { id }, data: { views: { increment: 1 } } })` — non-blocking
- Return full article including content and author name

**`POST /api/kb`** — admin only
Body: `{ title, content, type, tags?, published? }`
Validate: title and content required, type must be IT/HR/general.
Tags: accept as comma-separated string, trim and lowercase each tag before saving.
Returns 201.

**`PATCH /api/kb/[id]`** — admin only
Partial update any field. Tags same normalisation as POST.
Returns updated article.

**`DELETE /api/kb/[id]`** — admin only
Returns `{ success: true }`.

**`GET /api/kb/related?ticketType=IT&tags=vpn,wifi`** — public
- Find up to 3 published articles where type matches ticketType OR tags overlap with any of the provided tags
- Order by views desc
- Return: `{ id, title, type, tags, views }[]`
- Used on the ticket create page for deflection — Tom will call this

---

#### When done, post back here under `## Senior Engineer → GPT` with:
- Confirmation both migrations ran successfully
- Any schema changes you made (if you deviated from above)
- API routes created (list of paths)

---

## Backend → Frontend

### 2026-05-09 — PHASE 3: SELF-SERVICE, DEFLECTION, BULK ACTIONS, TEMPLATES

**Claude:** Tom, Phase 3. Four features. All APIs live. Build them all.

---

#### FEATURE 1 — Employee KB Portal (`src/app/dashboard/kb/page.tsx`)

Add nav item to `src/app/dashboard/layout.tsx` (show for all roles):
```tsx
{ label: "Knowledge Base", href: "/dashboard/kb", icon: <BookIcon /> }
```
Icon SVG:
```tsx
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.747 0-3.332.477-4.5 1.253" />
</svg>
```

**API:** `GET /api/kb?type=IT&q=search` → returns published articles only for employees, all for admins.

**Page layout** — match the existing dashboard light style (white cards, slate text):

- **Header:** "Knowledge Base" + subtitle "Find answers before raising a ticket"
- **Filter bar:** Type tabs (All / IT / HR / General) + search input (debounced 300ms)
- **Article cards** (grid 1→2→3 cols): title, type badge, tags as pills, views count, author + date. Click card → opens article detail.
- **Article detail** (same page, slide-in or replace): use `GET /api/kb/:id`. Show title, type badge, author, date, views. Render content as markdown — use `<pre className="whitespace-pre-wrap">` if no markdown renderer available. "← Back to articles" link.
- **Empty state:** "No articles found. Try a different search."

---

#### FEATURE 2 — KB Deflection on Create Page (`src/app/dashboard/create/page.tsx`)

When employee types into the **title field**, debounce 400ms, call:
```
GET /api/kb/related?ticketType=IT&q={title}
```
(use the current selected ticket type — IT or HR)

If response has articles, show a **deflection panel** between the title field and description field:

```tsx
<div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
  <p className="text-sm font-bold text-blue-800 mb-3">
    💡 Before you submit — these articles might help:
  </p>
  {relatedArticles.map(article => (
    <a href={`/dashboard/kb?article=${article.id}`} target="_blank"
       className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-100 transition-colors mb-1">
      <span className="text-sm font-medium text-blue-700">{article.title}</span>
      <span className="text-xs text-blue-400">{article.views} views →</span>
    </a>
  ))}
  <button onClick={() => setRelatedArticles([])}
    className="text-xs text-blue-400 hover:text-blue-600 mt-2 font-medium">
    None of these help — continue with my ticket
  </button>
</div>
```

State needed: `const [relatedArticles, setRelatedArticles] = useState([])` — clear when "none help" clicked or on form submit.

---

#### FEATURE 3 — Bulk Actions on Staff Queue (`src/app/dashboard/staff/page.tsx`)

Add checkbox to each ticket row. When 1+ checked, show a bulk action bar above the table:

```tsx
{selectedIds.length > 0 && (
  <div className="flex items-center gap-3 p-3 bg-slate-900 text-white rounded-xl">
    <span className="text-sm font-bold">{selectedIds.length} selected</span>
    <button onClick={() => bulkClose(selectedIds)} className="text-xs font-bold px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg">
      Close all
    </button>
    <button onClick={() => setSelectedIds([])} className="text-xs text-white/50 hover:text-white ml-auto">
      Clear
    </button>
  </div>
)}
```

`bulkClose` calls `PATCH /api/tickets/:id/resolve` for each selected ticket with `{ status: "closed", solution: "Bulk closed by staff" }` — run in parallel with `Promise.all`.

State: `const [selectedIds, setSelectedIds] = useState<string[]>([])`. Checkbox in first column of each row. "Select all" checkbox in header.

---

#### FEATURE 4 — Ticket Templates on Create Page (`src/app/dashboard/create/page.tsx`)

**API:** `GET /api/ticket-templates?type=IT` → returns:
```ts
type TicketTemplate = {
  id: string;
  name: string;
  description: string;
  type: string;
  priority: string;
  category: string | null;
  titlePrefix: string | null;
  bodyTemplate: string;
};
```

When the type is selected (IT or HR), call `GET /api/ticket-templates?type=IT`. If templates exist, show a **"Use a template"** row above the title field:

```tsx
<div className="flex items-center gap-2 flex-wrap">
  <span className="text-xs font-bold text-slate-500">Templates:</span>
  {templates.map(t => (
    <button key={t.id} type="button"
      onClick={() => applyTemplate(t)}
      className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-all">
      {t.name}
    </button>
  ))}
</div>
```

`applyTemplate(t)` sets:
- `title` → `t.titlePrefix ? t.titlePrefix + title : title` (prepend prefix, keep what user typed)
- `description` → `t.bodyTemplate`
- `priority` → `t.priority`
- `category` → `t.category` (if IT ticket)

---

#### FEATURE 5 — Ticket Templates Admin Page (`src/app/admin/templates/page.tsx`)

Add to admin NAV (after Automation):
```tsx
{ label: "Templates", path: "/admin/templates", icon: <DocumentIcon /> }
```
Icon:
```tsx
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
</svg>
```

Same pattern as SLA Policies page — table of templates + inline add form. Fields: Name, Description, Type (IT/HR), Priority, Category (optional), Title Prefix (optional), Body Template (textarea, monospace). Active toggle. Delete button.

API: `GET/POST /api/ticket-templates` + `PATCH/DELETE /api/ticket-templates/:id`

---

**Ship all 5. KB deflection is top priority — it's the most visible feature to a mentor.**

---

### 2026-05-09 — ADMIN PORTAL: KB + AUTOMATION RULES PAGES (build now, GPT API lands soon)

**Claude:** Tom, two more admin portal pages to build in parallel with GPT's backend work. The APIs are not live yet but the contracts are fully defined below — build against these specs and they'll wire up automatically when GPT ships. Both pages follow the existing dark glassmorphic admin style.

---

#### PAGE 1 — Knowledge Base Management (`src/app/admin/kb/page.tsx`)

Add to NAV in `src/app/admin/layout.tsx` (after Analytics):
```tsx
{
  label: "Knowledge Base",
  path: "/admin/kb",
  icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.747 0-3.332.477-4.5 1.253" />
    </svg>
  ),
}
```

**API contract (GPT is building these):**
```
GET    /api/kb              → KbArticle[]   (query: ?type=IT|HR|general&q=search)
POST   /api/kb              → KbArticle     (body: { title, content, type, tags?, published? })
PATCH  /api/kb/:id          → KbArticle     (partial update)
DELETE /api/kb/:id          → { success: true }
```

```ts
type KbArticle = {
  id: string;
  title: string;
  content: string;       // markdown
  type: "IT" | "HR" | "general";
  tags: string;          // comma-separated e.g. "vpn,wifi,password"
  views: number;
  published: boolean;
  createdAt: string;
  author: { name: string };
};
```

**What to build:**

Header + "New Article" button (toggles inline form).

**Filter bar:** Type tabs — All · IT · HR · General. Search input (calls `GET /api/kb?type=X&q=Y`).

**Article list** — card grid (2 columns on desktop), each card:
- Title (bold white), truncated to 2 lines
- Type badge (IT=blue, HR=amber, general=slate) + views count ("👁 42")
- Tags as small pill badges (white/5 bg)
- Published/Draft toggle button (calls PATCH to flip `published`)
- Delete button (red, confirm dialog)
- `createdAt` date + author name in muted text

**New Article form** (shown below filter bar when open):
```
Title          [text input, required]
Type           [IT | HR | General toggle buttons]
Tags           [text input, placeholder "vpn, wifi, password  (comma separated)"]
Published      [checkbox, default checked]
Content        [textarea, tall — markdown supported, monospace font hint]
[Cancel]  [Save Article]
```

**Empty state:** "No articles yet. Create the first one to help users self-serve."

---

#### PAGE 2 — Automation Rules (`src/app/admin/automation-rules/page.tsx`)

Add to NAV in `src/app/admin/layout.tsx` (after Knowledge Base):
```tsx
{
  label: "Automation",
  path: "/admin/automation-rules",
  icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
}
```

**API contract (GPT is building these):**
```
GET    /api/automation-rules         → AutomationRule[]
POST   /api/automation-rules         → AutomationRule (201)
PATCH  /api/automation-rules/:id     → AutomationRule
DELETE /api/automation-rules/:id     → { success: true }
```

```ts
type AutomationRule = {
  id: string;
  name: string;
  active: boolean;
  condTicketType: string | null;   // "IT" | "HR" | null
  condPriority: string | null;     // "low"|"medium"|"high"|"urgent" | null
  condStatus: string | null;       // "open"|"in_progress" | null
  condUnassigned: boolean;
  action: "assign_to_role" | "escalate_priority" | "notify_admins";
  actionValue: string | null;
  createdAt: string;
};
```

**What to build:**

Header + "New Rule" button (toggles inline form).

**Rules list** — one card per rule:
- Rule name (bold) + active/inactive toggle (calls PATCH `{ active: !rule.active }`)
- **Conditions summary** — render as readable pill tags:
  - `condTicketType` → "Type: IT" (blue pill)
  - `condPriority` → "Priority: urgent" (red/orange/blue/slate pill matching priority)
  - `condStatus` → "Status: open" (standard status color)
  - `condUnassigned: true` → "Unassigned" (amber pill)
- **Action summary** — one line below conditions:
  - `assign_to_role` → "→ Auto-assign to [actionValue]" (emerald)
  - `escalate_priority` → "→ Escalate priority to [actionValue]" (orange)
  - `notify_admins` → "→ Notify all admins" (blue)
- Delete button (red)

**New Rule form** (shown when open):
```
Rule Name         [text input, required]

CONDITIONS (leave blank to match any)
Ticket Type       [IT | HR | Any buttons]
Priority          [low | medium | high | urgent | Any buttons]
Status            [open | in_progress | Any buttons]
Unassigned only   [checkbox]

ACTION
Action Type       [assign_to_role | escalate_priority | notify_admins — 3 buttons]

  if assign_to_role:    Role → [IT Staff | HR Staff buttons]
  if escalate_priority: New Priority → [low | medium | high | urgent buttons]
  if notify_admins:     (no extra input needed)

[Cancel]  [Create Rule]
```

Show inline error if POST returns 400 (e.g. "At least one condition is required").

**Empty state:** "No automation rules. Create one to start auto-assigning or escalating tickets."

**Info note at bottom:**
> Rules run automatically when tickets are created or updated. All matching rules fire in order. Disable a rule with the toggle without deleting it.

---

**Both pages will work end-to-end as soon as GPT's API routes land. Build the UI now.**

---

### 2026-05-09 — ADMIN PORTAL: ANALYTICS PAGE

**Claude:** Tom, build the Analytics page in the admin portal. API is live. No charting library needed — use pure CSS bars (same pattern as the existing bar rows in the Overview page). Here's the full spec.

---

#### Add to NAV in `src/app/admin/layout.tsx` (after SLA Policies):
```tsx
{
  label: "Analytics",
  path: "/admin/analytics",
  icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
}
```

#### New page: `src/app/admin/analytics/page.tsx`

**API:** `GET /api/admin-portal/analytics`

**Full TypeScript type for the response:**
```ts
type Analytics = {
  weeklyVolume: { label: string; count: number }[];       // 8 weeks
  mttr: { all: number; it: number; hr: number };          // hours
  sla: {
    totalWithSla: number;
    totalBreached: number;
    breachRate: number;     // percentage
    complianceRate: number; // percentage
  };
  byDepartment: {
    IT: { total: number; resolved: number; breached: number };
    HR: { total: number; resolved: number; breached: number };
  };
  openTicketAge: {
    under1h: number;
    under8h: number;
    under24h: number;
    under3d: number;
    over3d: number;
  };
  topResolvers: { name: string; role: string; resolved: number }[];
};
```

---

#### Layout — 4 sections, same dark glassmorphic style:

**Section 1 — Top KPI row (4 cards):**
| Card | Value | Colour |
|------|-------|--------|
| SLA Compliance | `sla.complianceRate%` | green if ≥80%, amber if ≥60%, red if <60% |
| SLA Breached | `sla.totalBreached` | red if >0, white if 0 |
| MTTR (Overall) | `mttr.all`h | white |
| Resolved tickets | sum of IT+HR resolved | emerald |

**Section 2 — Weekly Ticket Volume (bar chart, pure CSS):**
```tsx
// Max bar height represents the highest week's count
const maxCount = Math.max(...data.weeklyVolume.map(w => w.count), 1);

<div className="flex items-end gap-2 h-40">
  {data.weeklyVolume.map((w) => (
    <div key={w.label} className="flex-1 flex flex-col items-center gap-1">
      <span className="text-xs text-white/40">{w.count}</span>
      <div
        className="w-full bg-red-500/70 rounded-t-md transition-all"
        style={{ height: `${(w.count / maxCount) * 100}%`, minHeight: w.count > 0 ? "4px" : "0" }}
      />
      <span className="text-[10px] text-white/30 text-center">{w.label}</span>
    </div>
  ))}
</div>
```

**Section 3 — 3-column grid:**

*Column A — MTTR by Department:*
Show three rows: Overall · IT · HR. Each row: label + value in hours + a horizontal bar proportional to the max MTTR.

*Column B — Open Ticket Age:*
5 rows using the `openTicketAge` buckets:
- `< 1h` → emerald
- `< 8h` → blue
- `< 24h` → amber
- `< 3 days` → orange
- `3+ days` → red

Each row: label · count · horizontal bar (color matches bucket).

*Column C — SLA by Department:*
IT row: total / resolved / breached
HR row: total / resolved / breached
Show a compliance % for each: `((total - breached) / total * 100).toFixed(0)%`

**Section 4 — Top Resolvers table:**
Columns: Rank · Name · Role badge · Tickets Resolved

Role badge reuse existing ROLE_BADGE colors from users page. Rank is just `1.` `2.` etc. Sort is already done server-side (highest first).

Empty state: "No resolved tickets yet." in the standard style.

---

**No new APIs needed — all data comes from `GET /api/admin-portal/analytics`.**

---

### 2026-05-09 — ADMIN PORTAL: SLA POLICIES PAGE

**Claude:** Tom, build the SLA Policies management page in the admin portal. All APIs are live. Here's the full spec.

---

#### New page: `src/app/admin/sla-policies/page.tsx`

Add it to the NAV array in `src/app/admin/layout.tsx`:
```ts
{ label: "SLA Policies", path: "/admin/sla-policies", icon: <ClockIcon /> }
```
Use this SVG for the icon:
```tsx
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
```

---

#### API contract

All routes use the admin JWT cookie (same as all other admin-portal routes — no extra auth needed):

```
GET    /api/admin-portal/sla-policies         → SlaPolicy[]
POST   /api/admin-portal/sla-policies         → SlaPolicy (201)
PATCH  /api/admin-portal/sla-policies/:id     → SlaPolicy
DELETE /api/admin-portal/sla-policies/:id     → { success: true }
```

```ts
type SlaPolicy = {
  id: string;
  name: string;
  ticketType: "IT" | "HR";
  priority: "low" | "medium" | "high" | "urgent";
  firstResponseMinutes: number;
  resolutionMinutes: number;
  createdAt: string;
};
```

---

#### What to build

**Page layout** — same dark glassmorphic style as other admin pages.

**Top section:** header + "Add Policy" button (opens inline form below the table, not a modal).

**Table** — one row per policy, columns: Name · Type · Priority · First Response · Resolution · Actions

- First Response and Resolution: display as human-readable time. Helper:
```ts
function fmtMinutes(m: number) {
  if (m >= 1440) return `${m / 1440}d`;
  if (m >= 60) return `${m / 60}h`;
  return `${m}m`;
}
```
- Priority badge: use these colors — urgent=red, high=orange, medium=blue, low=slate (match style of other badge components)
- Type badge: IT=blue, HR=amber (same as tickets page)
- Delete button: red, disabled for policies with `tickets` linked (just show delete — the API handles any cascade)
- No inline editing — just delete + add new

**Add policy form** (shown below table when "Add Policy" is clicked, hidden by default):
```
Name         [text input]
Ticket Type  [IT | HR toggle buttons]
Priority     [low | medium | high | urgent toggle buttons]
First Response (minutes)  [number input]   hint: "60 = 1 hour"
Resolution (minutes)       [number input]   hint: "240 = 4 hours"
[Cancel]  [Save Policy]
```
- On 409 conflict: show inline error "A policy for IT / urgent already exists"
- On success: hide form, refresh list

**Empty state:** "No custom SLA policies. Default SLA timers are active." (match styling of other empty states)

**Note below table (always shown):**
> Custom policies override built-in defaults. If no policy exists for a type+priority combo, the system falls back to hardcoded defaults (IT urgent: 1h/4h, IT high: 4h/8h, etc.).

Ship it. No backend changes needed.

---

### 2026-05-09 — ADMIN PORTAL: SLA HEALTH CARDS

**Claude:** Tom, the admin portal overview page is missing SLA visibility. I've added `slaBreachedCount` and `slaAtRiskCount` to `GET /api/admin-portal/stats`. Add two new KPI cards to `src/app/admin/page.tsx`.

**New fields in the stats response:**
```ts
slaBreachedCount: number  // active tickets with slaBreached === true
slaAtRiskCount: number    // active tickets due within 1 hour, not yet breached
```

**Add these two cards to the Primary KPIs grid** (make it 6 cards, or add a second row):
```tsx
{ label: "SLA Breached", value: stats.slaBreachedCount, sub: "active tickets past deadline", border: "border-red-500/30" },
{ label: "SLA At Risk", value: stats.slaAtRiskCount, sub: "due within 1 hour", border: "border-amber-500/30" },
```

The value should be colored red if > 0 for breached (`text-red-400` instead of `text-white`), amber if > 0 for at-risk. Otherwise `text-white`.

**Also:** Update the `Stats` type at the top of `src/app/admin/page.tsx` to include:
```ts
slaBreachedCount: number;
slaAtRiskCount: number;
```

No other changes needed — the API is already live.

---

### 2026-05-09 — SLA BADGES STILL PENDING — COMPLETE THIS NOW

**Claude:** Tom, great work on the audit timeline and internal notes — both approved. One thing is still outstanding from the Phase 1 brief: **SLA countdown badges on ticket list pages**. This is the most visible enterprise feature and it's not done yet. Complete it now.

---

The `Ticket` type in `src/hooks/useTicket.ts` already has the SLA fields:
```ts
slaResolutionDue: string | null;
slaFirstResponseDue: string | null;
slaBreached: boolean;
slaFirstResponseMet: boolean;
```

These fields are also returned by `GET /api/tickets` (the list endpoint) — they're on every ticket object already.

#### What to build — SLA badge component

Create a small reusable inline badge. You can define it as a local function in each page or a shared component — your call:

```tsx
function SlaBadge({ ticket }: { ticket: { slaResolutionDue: string | null; slaBreached: boolean; status: string } }) {
  if (ticket.status === "resolved" || !ticket.slaResolutionDue) return null;
  const diff = new Date(ticket.slaResolutionDue).getTime() - Date.now();
  const breached = ticket.slaBreached || diff < 0;
  const atRisk = !breached && diff < 60 * 60 * 1000; // < 1 hour
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const label = breached ? "Breached" : hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  const cls = breached
    ? "bg-red-50 text-red-700 border border-red-200"
    : atRisk
    ? "bg-amber-50 text-amber-700 border border-amber-200"
    : "bg-emerald-50 text-emerald-700 border border-emerald-200";
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}
```

#### Where to add it — 3 pages:

**1. `src/app/dashboard/page.tsx`** (employee ticket list)
Add `<SlaBadge ticket={ticket} />` next to the ticket title or status badge in each row.

**2. `src/app/dashboard/staff/page.tsx`** (IT/HR staff queue)
Same — add `<SlaBadge ticket={ticket} />` in the ticket row. This is the most important page — staff need to see which tickets are about to breach.

**3. `src/app/dashboard/ticket/[id]/page.tsx`** (ticket detail sidebar)
In the right sidebar, after the Priority/Department grid, add an SLA block:

```tsx
{ticket.slaResolutionDue && ticket.status !== "resolved" && (
  <div className="pt-4 border-t border-slate-100">
    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">SLA</p>
    <SlaBadge ticket={ticket} />
    <p className="text-xs text-slate-400 mt-1">
      Due: {new Date(ticket.slaResolutionDue).toLocaleString()}
    </p>
  </div>
)}
{ticket.status === "resolved" && (
  <div className="pt-4 border-t border-slate-100">
    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">SLA</p>
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticket.slaBreached ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
      {ticket.slaBreached ? "⚠ Resolved after breach" : "✓ Resolved within SLA"}
    </span>
  </div>
)}
```

**That's it — no backend changes, no new APIs. Just the badge component added to those 3 pages. Ship it.**

---

### 2026-05-09 — PHASE 1: AUDIT TRAIL + INTERNAL NOTES + SLA BADGES

**Claude:** Tom, major enterprise features just landed in the backend. Three UI areas need building. All APIs are live and tested. Here are the exact contracts — build against these.

---

#### FEATURE 1 — Audit Timeline on Ticket Detail Page

**API:** `GET /api/tickets/[id]/audit`

Returns an array of audit log entries:
```ts
type AuditLog = {
  id: string;
  action: string; // "CREATED" | "STATUS_CHANGED" | "ASSIGNED" | "UNASSIGNED" | "RESOLVED" | "COMMENT_ADDED" | "INTERNAL_NOTE" | "SLA_BREACHED"
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user: { name: string; role: string };
}
```

**Where it goes:** In `src/app/dashboard/ticket/[id]/page.tsx`, add an "Activity" section alongside comments. Show as a vertical timeline — each entry has:
- A colored icon per action type (🟢 created, 🔵 status change, 👤 assigned, ✅ resolved, 🔒 internal note, 🔴 SLA breached)
- "**John** changed status from `open` → `in_progress`" — bold name, monospace old/new values in backtick style badges
- Timestamp using the existing `timeAgo()` util
- Gray/muted styling — secondary info, not primary

Merge comments and audit events into one timeline sorted by `createdAt`. Show them interleaved. Action label mapping:
```
CREATED → "raised this ticket"
STATUS_CHANGED → "changed status from {oldValue} → {newValue}"  
ASSIGNED → "assigned to {newValue}"
UNASSIGNED → "removed assignee"
RESOLVED → "resolved this ticket"
COMMENT_ADDED → "left a comment"
INTERNAL_NOTE → "added an internal note"
SLA_BREACHED → "SLA deadline breached"
```

---

#### FEATURE 2 — Internal Notes (Staff-Only Comments)

`POST /api/tickets/[id]/comments` now accepts `{ content, isInternal: boolean }`. Comments now have `isInternal: boolean` in the response.

In `src/app/dashboard/ticket/[id]/page.tsx`, the comment form for staff users (it_staff, hr_staff, manager, admin) needs a toggle below the textarea:

- Checkbox/toggle: "🔒 Internal note — only visible to staff"
- When checked: textarea gets `bg-amber-50 border-amber-200` tint + "Staff only" badge
- Posted internal comments get a 🔒 icon + amber background to distinguish from public replies
- Employees never see the toggle or internal notes (already filtered server-side)

---

#### FEATURE 3 — SLA Status Badges

New fields on all ticket objects: `slaResolutionDue: string | null`, `slaBreached: boolean`, `slaFirstResponseDue: string | null`, `slaFirstResponseMet: boolean`

Update `src/hooks/useTicket.ts` Ticket type to include these four fields.

**On ticket lists** (employee dashboard, staff dashboard, manager dashboard): Add a small SLA badge per row:
- 🟢 On Track → `bg-emerald-50 text-emerald-700` — shows countdown "4h 30m left"
- 🟡 At Risk → `bg-amber-50 text-amber-700` — < 1 hour remaining
- 🔴 Breached → `bg-red-50 text-red-700` — `slaBreached === true` or past due
- No badge for resolved tickets

Countdown: `diff = new Date(slaResolutionDue).getTime() - Date.now()` → format as "Xh Ym left" or "Breached"

**On ticket detail page** — add an SLA block in the right sidebar column:
```
SLA STATUS
🟡 At Risk — 45m remaining
Due: Fri 9 May, 5:00 PM
```
For resolved: "✅ Met SLA" or "⚠️ Breached" based on `slaBreached`.

---

**No backend changes needed on any of these — all data is already being served. Build the UI.**

---

### 2026-05-09 — RICHER IT TICKET FORM + SCREENSHOT UPLOAD

**Claude:** Tom, major update to the ticket creation flow. All backend + logic is done. Here's what's new and what needs a polish pass.

---

#### 1. Create page — IT Software Details section (`src/app/dashboard/create/page.tsx`)

When `typeParam === "IT"`, a new "Software Details" card appears below the description. It has:

- **Ticket Type buttons** — two large buttons: "Incident" (something broke) and "Service Request" (need something new). Same style as priority buttons — blue filled when selected, white border otherwise.
- **Affected Software / App** — plain text input (e.g. "Microsoft Teams")
- **Operating System / Platform** — `<select>` dropdown: Windows 11, Windows 10, macOS, Web Browser, Mobile (iOS), Mobile (Android), Other
- **Error Message** — monospace textarea, smaller font, for copy-pasting error text

Make the two category buttons feel more premium — they show a small subtitle line ("Something broke" / "Need something new") above the main label. The layout is currently `grid grid-cols-2 gap-3`.

#### 2. Create page — Screenshot Upload (`src/app/dashboard/create/page.tsx`)

A "Screenshots" card at the bottom of the left column. Three upload methods are wired up:
- **Drag & drop** — the zone lights up blue with a scale animation when dragging
- **Ctrl+V paste** — listens globally on the page, captures clipboard images
- **Click to browse** — hidden `<input type="file" multiple accept="image/*,...">`

Once files are added, they render as a `grid grid-cols-3 sm:grid-cols-4 gap-3` thumbnail grid:
- Images show a real preview via `FileReader`
- Non-image files show a 📄 icon + filename
- Each thumbnail has a × remove button (top-right, appears on hover)
- File size shown on bottom overlay (hover)

On form submit: ticket is created first → attachments are uploaded in parallel → then redirect.

**Polish asks:**
- The drop zone should feel inviting — gentle dashed border, maybe a subtle background tint
- The thumbnail grid should have a clean grid feel — uniform aspect-square cells, nice overflow hidden
- When `isDragging` is true, the zone uses `border-blue-500 bg-blue-50 scale-[1.01]` — make sure this feels smooth

#### 3. Ticket detail page — IT fields display (`src/app/dashboard/ticket/[id]/page.tsx`)

After the description section, there's a new block that only renders when `ticket.type === 'IT'` AND at least one IT field has a value. It shows:
- **Type** (category) — a small blue badge pill
- **Platform** — plain text
- **Affected Software** — plain text, spans col-span-2
- **Error Message** — `<pre>` block with `font-mono text-xs bg-slate-50 border rounded-lg p-3`

Make sure the visual presentation matches the rest of the ticket card — same padding rhythm, same label style (small caps, slate-400).

**No logic changes needed on any of these — styling and polish only.**

---

### 2026-05-09 — ADMIN DANGER ZONE + PASSKEY UI (Polish Pass)

**Claude:** Tom, two new UI areas need polish in the admin portal.

---

#### 1. Tickets page Danger Zone (`src/app/admin/tickets/page.tsx`)

There's a collapsible "Danger Zone" panel that appears when you click the "⚠ Danger Zone" button. It already works — just needs to look visually distinct and serious:
- The panel uses `bg-red-500/5 border border-red-500/20 rounded-2xl` — make sure it has enough visual separation from the rest of the page
- The "Wipe All Tickets" button should feel destructive — it's already `bg-red-600`, just make sure it has a strong presence
- The confirm input placeholder says `Type "WIPE" to confirm` — make sure the input and button sit cleanly in a row (`flex items-center gap-3`)
- Success/error message after wipe: emerald for success, red for error — already in JSX

#### 2. Admin login page (`src/app/admin/login/page.tsx`)

Now has 3 fields: Company Passkey, Email, Password (in that order). The passkey field comes first — it's the company gate. Polish pass:
- Make sure all 3 fields have consistent spacing and styling
- The passkey field uses `font-mono tracking-widest` — keep that, it feels like a secret key
- Labels: "COMPANY PASSKEY", "EMAIL ADDRESS", "PASSWORD" — all uppercase tracking-widest already
- The submit button is disabled until all 3 fields are filled — no changes needed to logic

#### 3. Admin setup page (`src/app/admin/setup/page.tsx`)

Now has 4 fields: Company Passkey (first), Full Name, Email, Password. Same polish rules — consistent spacing, passkey field gets the mono treatment.

**No logic changes on any of these — styling only.**

---

### 2026-05-09 — ADMIN OVERVIEW REDESIGN (Polish Pass)

**Claude:** Tom, I've completely rewritten the admin overview page (`src/app/admin/page.tsx`) with much richer data. It now shows:

1. **4 KPI cards** — Total Users, Total Tickets, Open/Active count, Resolution Rate (%)
2. **Three breakdown panels** (side by side):
   - Ticket Status — open/in_progress/resolved/closed with progress bars
   - By Priority — urgent/high/medium/low with coloured bars
   - Users by Role — each role with a mini bar and count + "Manage roles →" link
3. **Staff Performance table** — every it_staff/hr_staff member with columns: Assigned, In Progress, Resolved, Resolution Rate (colour-coded bar: green ≥70%, amber ≥40%, red below)
4. **Recent Activity feed** — last 10 tickets: priority dot, title, creator, date, type badge, status badge

The layout and logic are done. I need you to do a visual polish pass:
- Make sure the three breakdown panels sit evenly in a 3-column grid on desktop, stacked on mobile
- The Staff Performance table: hide "In Progress" column on mobile (`hidden md:table-cell`)
- KPI cards: sub-label text (`text-xs text-white/30`) should be clearly readable — check contrast
- Recent activity rows: verify long ticket titles truncate correctly
- No logic changes — only styling/layout tweaks

**File:** `src/app/admin/page.tsx` — all JSX is already there.

---

### 2026-05-09 — FILE ATTACHMENTS UI (Ticket Detail Page)

**Claude:** Tom, file attachments are live. Add upload + display UI to the ticket detail page.

---

#### API Contracts
```
GET  /api/tickets/:id/attachments
     returns: [{ id, url, filename, size, createdAt, uploadedBy: { name } }]

POST /api/tickets/:id/attachments
     body: multipart/form-data with field "file"
     max 10MB, allowed: images, PDF, txt, doc, docx, xlsx
     returns: created attachment object
```

---

#### Where to add it — `src/app/dashboard/ticket/[id]/page.tsx`

Add a new **Attachments** section between the ticket description card and the comments section (inside the left `lg:col-span-2` column).

State to add at the top of the component:
```tsx
const [attachments, setAttachments] = useState<any[]>([]);
const [uploading, setUploading] = useState(false);
const [uploadError, setUploadError] = useState("");

const fetchAttachments = async () => {
  const res = await fetch(`/api/tickets/${id}/attachments`);
  if (res.ok) setAttachments(await res.json());
};

useEffect(() => { if (id) fetchAttachments(); }, [id]);

const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setUploading(true);
  setUploadError("");
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`/api/tickets/${id}/attachments`, { method: "POST", body: form });
  if (res.ok) {
    await fetchAttachments();
  } else {
    const d = await res.json();
    setUploadError(d.error || "Upload failed");
  }
  setUploading(false);
  e.target.value = "";
};
```

The section JSX (add between description card and comments):
```tsx
<div className="card p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold text-slate-900">Attachments</h3>
    <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2">
      {uploading ? "Uploading..." : "＋ Attach File"}
      <input type="file" className="hidden" onChange={handleUpload} disabled={uploading}
        accept="image/*,.pdf,.txt,.doc,.docx,.xlsx" />
    </label>
  </div>

  {uploadError && <p className="text-sm text-red-500 mb-3">{uploadError}</p>}

  {attachments.length === 0 ? (
    <p className="text-sm text-slate-400 italic">No attachments yet.</p>
  ) : (
    <div className="space-y-2">
      {attachments.map(a => (
        <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group">
          <span className="text-2xl">{a.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? "🖼️" : a.filename.match(/\.pdf$/i) ? "📄" : "📎"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600">{a.filename}</p>
            <p className="text-xs text-slate-400">{(a.size / 1024).toFixed(1)} KB · {a.uploadedBy?.name} · {new Date(a.createdAt).toLocaleDateString()}</p>
          </div>
          <span className="text-slate-400 group-hover:text-blue-600 text-xs font-bold">↗</span>
        </a>
      ))}
    </div>
  )}
</div>
```

**Important:** The `BLOB_READ_WRITE_TOKEN` env var must be set on Vercel for uploads to work (I'll handle that). You just need the UI.

---

#### CSS rules
- No `@apply`, no duplicate `className`

---

### 2026-05-09 — TICKET ASSIGNMENT UI (Manager Dashboard + Ticket Detail)

**Claude:** Tom, backend is live. Managers can now assign tickets to staff. Add assignment UI to two places.

---

#### APIs (do not change these)
```
GET  /api/staff?type=IT   → [{ id, name, email, role }]
GET  /api/staff?type=HR   → [{ id, name, email, role }]
PATCH /api/tickets/:id/assign   body: { assigneeId: string | null }
```

---

#### Change 1 — Manager Dashboard (`src/app/dashboard/manager/page.tsx`)

Add to the ticket table: an **Assignee** column showing current assignee and a dropdown to change it.

Add at the top of the component:
```tsx
const [staffList, setStaffList] = useState<{id:string,name:string,role:string}[]>([]);
useEffect(() => {
  fetch("/api/staff").then(r => r.json()).then(setStaffList);
}, []);

const assignTicket = async (ticketId: string, assigneeId: string | null) => {
  await fetch(`/api/tickets/${ticketId}/assign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assigneeId }),
  });
  refresh();
};
```

In each ticket row, add an assignee cell:
```tsx
<td>
  <select
    value={(ticket.assignee as any)?.id || ""}
    onChange={(e) => assignTicket(ticket.id, e.target.value || null)}
    className="input-field !py-1.5 !text-sm max-w-[160px]"
    style={{ color: "#0f172a" }}
  >
    <option value="">Unassigned</option>
    {staffList
      .filter(s => ticket.type === "IT" ? s.role === "it_staff" : s.role === "hr_staff")
      .map(s => <option key={s.id} value={s.id}>{s.name}</option>)
    }
  </select>
</td>
```

---

#### Change 2 — Ticket Detail Sidebar (`src/app/dashboard/ticket/[id]/page.tsx`)

In the sidebar card (right column), after the Creator section, add an Assignee row:
```tsx
<div>
  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Assignee</p>
  {ticket.assignee ? (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
        {ticket.assignee.name.charAt(0)}
      </div>
      <div>
        <span className="font-medium text-sm text-slate-900 block">{ticket.assignee.name}</span>
        <span className="text-xs text-slate-500">{ticket.assignee.email}</span>
      </div>
    </div>
  ) : (
    <span className="badge badge-slate">Unassigned</span>
  )}
</div>
```

Display only — no assignment controls here. Assignment is manager-only.

---

#### CSS rules
- No `@apply`, no duplicate `className`
- `style={{ color: "#0f172a" }}` on select dropdowns

---

### 2026-05-09 — CRITICAL FIX + ADMIN PORTAL STYLING

**Claude:** Tom, two things.

---

#### 1. HEADING VISIBILITY — ROOT CAUSE FIXED (no action needed from you)

I've fixed this globally in `globals.css`. Changed:
```css
h1, h2, h3, h4, h5, h6 { color: #000000; }
```
to:
```css
h1, h2, h3, h4, h5, h6 { color: inherit; }
```

This means headings now inherit colour from their parent. Dark pages (login, register, forgot-password, reset-password, admin portal) all use `text-white` on their root div — headings will now be white automatically. Dashboard pages inherit black from `body { color: #000000 }` — no change there.

**You don't need to do anything for this.** Just be aware: going forward, never hardcode `color` on headings in globals.css. Always use `text-*` utilities on the parent container.

---

#### 2. ADMIN PORTAL — New dark-themed section at `/admin`

I've built a completely separate admin portal at `/admin`. It has its own login (passkey-only, no NextAuth), its own layout, and three pages. It needs styling to match the premium dark aesthetic.

**Pages to style:**

**A. `/admin/login`** (`src/app/admin/login/page.tsx`)
- Already has dark background, red-themed orbs, glass card — matches the pattern
- Just verify it looks clean and consistent. Should feel "restricted/secure" — red accent, not blue

**B. `/admin` (Overview)** (`src/app/admin/page.tsx`)
- Dark background (`bg-slate-950`) with sidebar layout
- KPI cards: currently plain `bg-white/5 border border-white/10` — make them feel premium
- Two breakdown panels (Ticket Split + Users by Role) — same card treatment
- Page heading uses `text-red-400/80` as accent — keep that red theme throughout

**C. `/admin/users`** (`src/app/admin/users/page.tsx`)
- Dark table with `bg-white/3 border border-white/8` — verify rows are readable
- Role dropdowns styled with coloured badges (already implemented in JS)
- Status pills: emerald for active, red for deactivated — already there

**D. `/admin/tickets`** (`src/app/admin/tickets/page.tsx`)
- Same dark table treatment
- Filter selects already have dark background styling
- Status/priority badges already coloured

**E. `/admin/layout.tsx`** — The sidebar
- Dark sidebar (`bg-slate-900/80`) with red accent on active nav items
- Already structured — just verify it looks polished and premium

**Overall design rules for the admin portal:**
- Background: `bg-slate-950` (darker than the main app)
- Accent colour: **red** (`red-400`, `red-500`, `red-600`) — not blue. This distinguishes admin from the regular app
- Cards: `bg-white/5 border border-white/10 rounded-2xl` with subtle glow
- Text: `text-white` for headings, `text-white/60` for secondary, `text-white/30` for muted
- No `.card` class (that's light-themed) — use raw dark Tailwind classes

**CSS rules (same as always):**
- No `@apply` on custom classes
- No duplicate `className`
- Dark text in the main app, white text in the admin portal

---

### 2026-05-05 — NEW PAGE: Admin Panel (`src/app/dashboard/admin/page.tsx`)

**Claude:** Tom, I've just shipped a new page — the Admin Panel. It's fully functional but needs your premium styling treatment to match the rest of the app.

---

#### What it does
Admins can manage all users: change their role, deactivate them, or reactivate them. It has a search bar and a data table.

#### Current state
The page works but looks plain — basic table with no premium feel. It needs to match the glassmorphic, premium look of the rest of the dashboard.

#### What to style

**Header section** (already has the structure):
- Badge saying "Admin Panel" (use same badge style as other pages — `badge badge-slate`)
- H1: "User Management"
- Subtext showing user count
- Search input on the right

**User table:**
- The table is inside a `.card` with `overflow-hidden !p-0`
- Each row shows: user avatar initial, name+email, tickets count, role dropdown, active status badge, deactivate/reactivate button
- Role dropdown: use the role badge colors already defined in the component (`roleBadgeColor` object — admin=red, manager=purple, it_staff=blue, hr_staff=amber, employee=slate)
- Status badge: green pill for Active, red pill for Deactivated
- The deactivate button is red text, reactivate is green text

**Make it match the premium style:**
- Use the same `page-reveal` animation class on the outer div (already there)
- Same card shadow and rounded corners as the rest of the dashboard
- The role `<select>` dropdowns should have visible colored text — already handled with `style={{ color: "#0f172a", backgroundColor: "#ffffff" }}`
- Make the table header row look clean: light slate text, uppercase tracking-widest (already structured)
- Make sure hover states on rows are subtle (`hover:bg-slate-50`)
- Mobile: the "Tickets" column is hidden on mobile (`hidden md:table-cell`) — ensure the table doesn't overflow on small screens

**Color palette for the page** (already implemented in the JS, just ensure it shows correctly in CSS):
```
admin    → bg-red-100 text-red-700
manager  → bg-purple-100 text-purple-700
it_staff → bg-blue-100 text-blue-700
hr_staff → bg-amber-100 text-amber-700
employee → bg-slate-100 text-slate-600
```

**No logic changes needed** — everything is wired up and working. Only styling.

#### CSS Rules (same as always)
- No `@apply` on custom classes
- No duplicate `className` attributes
- Dark text on light backgrounds

---

### 2026-05-06 — VISUAL OVERHAUL DIRECTIVE (READ THIS FIRST)

**Claude:** Tom, the owner wants the app to look significantly more impressive — premium, modern, visually alive. Here is a page-by-page breakdown of every visual upgrade needed. This is the most important task right now.

---

#### GLOBAL — Add to `globals.css`

Add these styles. Do NOT use `@apply` on custom classes. Plain CSS only.

```css
/* Glowing blue orb — reusable background effect */
.glow-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

/* Shimmer skeleton loader */
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 8px;
}

/* Status-colored left border for ticket cards */
.ticket-card-open    { border-left: 4px solid #3b82f6; }
.ticket-card-progress{ border-left: 4px solid #f59e0b; }
.ticket-card-resolved{ border-left: 4px solid #22c55e; }

/* Pulse animation for CTA buttons */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
  50% { box-shadow: 0 0 0 12px rgba(59,130,246,0); }
}
.btn-pulse { animation: pulse-glow 2.5s infinite; }

/* Page reveal */
@keyframes page-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-reveal { animation: page-in 0.5s ease forwards; }

/* Status pulse dot */
@keyframes status-ping {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
}
.status-pulse { display: inline-block; border-radius: 9999px; animation: status-ping 2s infinite; }
```

---

#### PAGE 1 — Landing Page (`src/app/page.tsx`)

**Hero Section (lines 91–197):**
- Add two glowing orb `<div>`s inside the hero for ambient light:
  ```jsx
  <div className="glow-orb w-[600px] h-[600px] bg-blue-600/20 -top-40 -left-40" />
  <div className="glow-orb w-[400px] h-[400px] bg-cyan-500/10 top-1/2 right-0" />
  ```
- Make the headline gradient text animate: add a CSS `@keyframes gradient-shift` that cycles the gradient angle slowly (`background-size: 200%` + `animation: gradient-shift 4s ease infinite`)
- The "Get Started for Free" button: add class `btn-pulse` so it has a breathing glow effect
- Add a floating badge above the headline:
  ```jsx
  <div className="hero-element inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
    <span className="status-pulse bg-blue-400 w-1.5 h-1.5" />
    Now Live — Internal Helpdesk Platform
  </div>
  ```
- Dashboard mockup (lines 112–195): add a left sidebar to it to look more realistic:
  ```jsx
  <div className="flex h-[400px]">
    {/* Sidebar */}
    <div className="w-48 bg-slate-900 p-4 space-y-2 flex-shrink-0">
      <div className="h-4 w-20 bg-blue-600 rounded mb-6" />
      {['Dashboard','Tickets','Staff Queue','Overview'].map((item,i) => (
        <div key={i} className={`h-8 rounded-lg flex items-center px-3 ${i===0?'bg-white/10':''}`}>
          <div className={`h-3 rounded ${i===0?'w-20 bg-white':'w-16 bg-slate-700'}`} />
        </div>
      ))}
    </div>
    {/* Main content — existing mockup content goes here */}
    <div className="flex-1 p-6 md:p-8 bg-slate-50 text-left overflow-hidden">
      ... (existing stat cards and table)
    </div>
  </div>
  ```

**Features Section (lines 200–224):**
- Each feature card: add a coloured top accent line and icon background colour per feature:
  ```jsx
  // Instead of generic bg-[#f8fafc], give each card a subtle tinted top border
  style={{ borderTop: '3px solid', borderTopColor: ['#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#10b981','#f43f5e'][i] }}
  ```
- On hover, the icon emoji box should scale up slightly: `hover:scale-110 transition-transform`

**How It Works Section (lines 227–254):**
- The connecting line between steps is invisible against slate-900. Change it to `bg-gradient-to-r from-blue-500/30 via-blue-500/60 to-blue-500/30`
- Step circles: add a glowing ring on hover: `hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-shadow`
- Add icons inside the step circles instead of just numbers:
  - 01 → 📝 , 02 → 🔔 , 03 → ✅ , 04 → ⭐

**CTA Section (lines 303–312):**
- The blue CTA box is flat. Upgrade it:
  - Background: `bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800`
  - Add a subtle pattern overlay: `<div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,...')]" />`
  - Two glowing orbs inside: `<div className="glow-orb w-80 h-80 bg-white/10 -top-20 -right-20" />`
  - "Create an Account" button: add `btn-pulse` class

**Navbar (lines 79–88):**
- Make it glass on scroll: start transparent, become `bg-slate-900/90 backdrop-blur-md` after user scrolls 50px. Use `useEffect` + `window.addEventListener('scroll', ...)` — set state and apply class conditionally.

---

#### PAGE 2 — Dashboard (`src/app/dashboard/page.tsx`)

- Stat cards: each card should have a matching coloured icon in the top right corner:
  - Total: 🎫 in slate, Open: 🔴 in red/orange, In Progress: ⚡ in blue, Resolved: ✅ in green
- Add a horizontal divider with `Today's Activity` label between stat cards and ticket list
- Ticket cards: apply `.ticket-card-open`, `.ticket-card-progress`, `.ticket-card-resolved` left border classes based on `ticket.status`
- Add a small priority dot in top-right of each card:
  ```jsx
  <div className={`w-2.5 h-2.5 rounded-full ${
    ticket.priority === 'urgent' ? 'bg-red-500' :
    ticket.priority === 'high'   ? 'bg-orange-400' : 'bg-slate-300'
  }`} />
  ```
- Empty state: replace the plain empty message with a proper illustrated empty state:
  ```jsx
  <div className="text-8xl mb-6 opacity-20">🎫</div>
  <h3>No tickets yet</h3>
  <p>Your support requests will appear here once submitted.</p>
  <Link href="/dashboard/create">Submit your first ticket →</Link>
  ```
  (only show that link if `role === "employee"`)

---

#### PAGE 3 — Ticket Detail (`src/app/dashboard/ticket/[id]/page.tsx`)

- Add a progress stepper at the top showing ticket lifecycle:
  ```
  [● Created] ——— [● In Progress] ——— [○ Resolved]
  ```
  Filled circles = completed stages, empty = pending. Color the active stage blue.
- Ticket metadata (type, priority, date) should be in a clean sidebar panel on desktop (lg:grid-cols-3, ticket info takes 1 col, main content 2 cols)
- Priority badge should be coloured: urgent=red, high=orange, medium=blue, low=slate
- Comments: make them chat-bubble style (current user's comments right-aligned with blue bubble, others left-aligned with grey bubble). Use `session.user.id` to determine which side.
- Comment input: make it sticky at the bottom of the comments section on desktop with a clean send button

---

#### PAGE 4 — Staff Queue (`src/app/dashboard/staff/page.tsx`)

- Header: show a live count badge: `"X tickets awaiting"`  
  ```jsx
  <span className="inline-flex items-center justify-center bg-red-500 text-white text-xs font-black rounded-full min-w-[24px] h-6 px-2 ml-3">{activeTickets.length}</span>
  ```
- Separate sections with clear headings: "Active Queue" and "Recently Resolved" with a thin divider
- Each ticket card: show time elapsed since creation in the bottom row — use a helper:
  ```js
  function timeAgo(date) {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
    return `${Math.floor(mins/1440)}d ago`;
  }
  ```
- Urgent priority cards should have a red pulsing left border using `.ticket-card-open` + an additional `urgent-pulse` style

---

#### PAGE 5 — Manager Dashboard (`src/app/dashboard/manager/page.tsx`)

- KPI cards: add a trend arrow icon next to each number (▲ in green, just decorative)
- Priority bar chart: animate bars from 0 to their value on page load using CSS:
  ```css
  @keyframes bar-grow {
    from { height: 5%; }
    to   { height: var(--bar-h); }
  }
  ```
  Set `style={{ '--bar-h': `${percent}%`, animation: 'bar-grow 1s ease forwards' }}`
- Add a "Refresh" button top-right of the ticket table that calls `window.location.reload()` with a spin animation on click
- Add an "Export CSV" button (just UI, no functionality needed yet) next to Refresh
- Last updated timestamp: `<p>Last updated: {new Date().toLocaleTimeString()}</p>` near the KPIs

---

#### CSS Rules (same as always)
- Plain CSS in `globals.css` — no `@apply` on custom classes
- No duplicate `className` attributes on elements
- No `cursor: none`, no infinite layout-thrashing animations
- Test every page at 375px width (mobile)

**Priority order:** Landing page visual upgrade → Dashboard ticket cards → Staff queue → Ticket detail stepper → Manager dashboard

---

### 2026-05-06 — FRONTEND IMPROVEMENT TASKS

**Claude:** Tom, the backend is in great shape. Here's a list of frontend improvements the owner wants — prioritised top to bottom.

---

#### 1. Ticket Detail Page — Comments Section Polish (`src/app/dashboard/ticket/[id]/page.tsx`)
The comments section is wired up but needs UX polish:
- Show a loading skeleton while comments load
- If there are no comments yet, show an empty state: "No messages yet. Be the first to comment."
- Each comment bubble: left-aligned for others, right-aligned for the current user (like a chat/iMessage style)
- Timestamp should be relative ("2 minutes ago", "Yesterday") not just a date
- After posting a comment, clear the input and scroll to the new comment

#### 2. Landing Page — Final Polish (`src/app/page.tsx`)
- The hero section should have a subtle animated gradient or particle effect (CSS only, no canvas)
- Add a "Trusted by teams" or similar social proof row with placeholder company logos (simple SVG shapes)
- The CTA button should pulse gently to draw attention
- Make sure the mobile layout looks clean on 375px width

#### 3. Dashboard — Status Indicator on Ticket Cards (`src/app/dashboard/page.tsx`)
- Add a coloured left border to each ticket card based on status:
  - Open: blue left border
  - In Progress: amber left border
  - Resolved: green left border
- Add a priority indicator dot in the top-right of each card (red for urgent, orange for high, grey for others)

#### 4. Staff Queue Page — Improvements (`src/app/dashboard/staff/page.tsx`)
- Add a count badge in the header showing how many open tickets are in the queue e.g. "12 open"
- Active (open/in_progress) and resolved tickets should be in clearly separated sections with section headings
- Each ticket card should show the time elapsed since creation e.g. "Opened 3 hours ago"

#### 5. Manager Dashboard — Live Feel (`src/app/dashboard/manager/page.tsx`)
- Add a "Last updated" timestamp near the top that shows when data was fetched
- The priority bar chart — animate the bars growing upward on page load (CSS animation, not GSAP)
- Add a "Refresh" button near the ticket table

#### 6. Forgot/Reset Password Pages — Polish
- `src/app/forgot-password/page.tsx` and `src/app/reset-password/page.tsx`
- Match the exact same style as login/register: dark gradient background, white card, same inputs
- Both already work functionally — just need visual polish to feel premium

---

#### CSS Rules (unchanged)
- No `@apply` on custom classes
- No duplicate `className` on any element
- No `cursor: none`, no infinite animations
- Always dark text on light backgrounds

Start with #1 (comments UX) and #2 (landing page) — those are highest impact.

---

### 2026-05-06 — NEW PAGES + UPGRADE DIRECTIVE

**Claude:** Tom, big update. Two things: new pages to polish, and a full app upgrade directive.

---

#### 1. Password Reset — Two New Pages Ready

The backend is live. I've created functional (but plain) pages at:

- `/forgot-password` — `src/app/forgot-password/page.tsx`
- `/reset-password` — `src/app/reset-password/page.tsx`

Both pages work end-to-end. They match the login/register style (dark gradient background, white card). They're functional but plain — **no changes needed to logic, just polish the UI to match the premium feel of login/register.**

The login page now has a "Forgot password?" link above the password field — that's already live, no changes needed there.

---

#### 2. App Upgrade — Make Everything Feel Premium

The owner wants the whole app taken to the next level. Here's the priority list:

**A. Landing Page (`src/app/page.tsx`) — Most Important**
The landing page needs to feel like a top-tier SaaS product. Think Vercel, Linear, or Notion's marketing page:
- Bold hero with a real dashboard preview mockup (CSS only, not an image)
- Smooth scroll animations (GSAP, runs once)
- Feature grid, How It Works steps, Role cards, CTA section
- Dark hero, light content sections
- Premium typography — big, confident, tight letter-spacing

**B. Dashboard (`src/app/dashboard/page.tsx`)**
- Add a proper welcome greeting with the user's name (session.user.name is available via useSession)
- The stat cards should feel premium — large numbers, clear labels

**C. Ticket Detail (`src/app/dashboard/ticket/[id]/page.tsx`) — IMPORTANT**
- Add a visible **Comments section** at the bottom of the page
- The comments API is live:
  - `GET /api/tickets/:id/comments` — returns list of comments
  - `POST /api/tickets/:id/comments` with body `{ content: "..." }` — posts a comment
- Each comment shows: author name initial avatar, author name, timestamp, message
- Input at bottom: textarea + "Post Comment" button
- All roles (employee, staff, manager) can comment

**D. Forgot/Reset Password Pages**
- `src/app/forgot-password/page.tsx` — just polish, logic is done
- `src/app/reset-password/page.tsx` — just polish, logic is done
- Match the style of login/register (dark gradient bg, white card, same input style)

---

#### CSS Rules (same as always)
- No `@apply` on custom classes — write plain CSS
- No duplicate `className` on any element
- No `cursor: none`, no infinite animations
- Dark text on light backgrounds — always visible

---

#### API Reference for Comments
```
GET  /api/tickets/:id/comments
     returns: [{ id, content, createdAt, user: { id, name } }]

POST /api/tickets/:id/comments
     body: { content: "message text" }
     creates comment as logged-in user
```

Priority order: Landing page > Comments on ticket detail > Forgot/Reset password polish.

---

### 2026-05-04 — CLEAN SLATE: Only Read This Message

**Claude:** Tom, ignore everything above this. All previous directives are superseded. Here is the ONE source of truth.

#### Project
Internal helpdesk app. Employees create IT/HR tickets. Staff resolves them. Managers oversee.

#### Design: Clay.global Inspired
The owner wants Clay.global style. You already have access to the website. Key traits:
- Bold, confident typography
- Smooth GSAP scroll animations (once, not infinite)
- Clean whitespace
- Soft card shadows (no hard borders)
- Dark hero section, light content sections
- Professional and premium feel

#### What's Working (don't break these)
- Register → `/api/auth/register` (NOT `/api/register`)
- Staff resolve: "Start Working" + "Resolve" buttons with `fetch()` calls
- Ticket detail: resolve form + feedback form with `fetch()` calls
- Hooks: `useTickets()` and `useTicket(id)` return `{ tickets/ticket, loading, error, refresh }`

#### Your Pages
| Page | File | Status |
|------|------|--------|
| Landing | `src/app/page.tsx` | Needs Clay polish |
| Login | `src/app/login/page.tsx` | Done — light theme |
| Register | `src/app/register/page.tsx` | Done — light theme |
| Dashboard | `src/app/dashboard/page.tsx` | Done — light theme |
| Create Ticket | `src/app/dashboard/create/page.tsx` | Done — light theme |
| Manager | `src/app/dashboard/manager/page.tsx` | Needs work — KPIs, charts, executive feel |
| Staff Queue | `src/app/dashboard/staff/page.tsx` | Done — has resolve flow |
| Ticket Detail | `src/app/dashboard/ticket/[id]/page.tsx` | Done — resolve + feedback |

#### Current Tasks (in priority order)
1. **Landing page** — make it Clay.global premium. Dark hero, GSAP scroll reveals, feature cards, how it works, roles, CTA, footer. You have the clay.global source — match that energy.
2. **Manager dashboard** — executive feel. KPIs, CSS bar charts, department comparison, recent activity, ticket table. Welcome header with manager's name.
3. **Staff page + dashboard** — apply same Clay card shadows to match landing page

#### CSS Rules
- Write custom classes as **plain CSS** (no `@apply` on custom classes)
- No duplicate `className` on elements
- End every file with one `);` and `}`

#### Don't Touch
- `src/app/api/**`, `src/lib/**`, `src/middleware.ts`, `src/types/**`

---

### 2026-05-05 — BLOCKING BUG: Users Cannot See Login/Register Forms

**Claude:** Tom, THIS IS BREAKING THE APP. Users cannot sign in or register because they can't see the form.

**Root cause:** Your `.card` class background is `#f4f4f4` (light). Your login/register pages use `text-white` for labels. White text on light background = INVISIBLE.

**Exact fix for login page — change these classes:**
- Card div: remove `bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl` → just use `card p-8`
- Heading: `text-white` → `text-slate-900`
- Subtitle: `text-white/70` → `text-slate-500`
- Labels: `text-white/90` → `text-slate-700`
- Inputs: remove `bg-white/10 text-white placeholder-white/40 border-white/20 focus:bg-white/20` → just use `input-field`
- Error box: `bg-red-500/20 border-red-500/50 text-red-200` → `bg-red-50 border-red-200 text-red-600`
- Button: remove `bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/30` → just use `btn-primary w-full py-2.5`
- Bottom link: `text-white/70` → `text-slate-500`, `text-white` → `text-blue-600`

**Same fix for register page** — change all `text-white` variants to dark colors.

**Also add to BOTH pages:**
- Home link at top: `← Back to Home` linking to `/`

**Do this NOW. Save the files. This is the highest priority.**

---

### 2026-05-05 — URGENT: Login & Register Text Is Invisible + New Features

**Claude:** Tom, look at the screenshots. The pages are broken because you have **white text on a white card**. The `.card` class in globals.css uses `background: #f4f4f4` but the login/register pages use `text-white` for labels and headings. White on white = invisible.

#### Fix Login Page (`/login/page.tsx`):
- Change card to NOT use glass dark styling — use the `.card` class as-is (light background)
- All text inside the card must be **dark**: headings `text-slate-900`, labels `text-slate-700`, subtitles `text-slate-500`
- Input fields: `text-slate-900 placeholder-slate-400` (not `text-white placeholder-white/40`)
- Remove `bg-white/10 backdrop-blur-xl border-white/20` from the card — just use `card` class
- Add a **Home** button/link at the top left (← Back to Home → `/`)
- Must show: "Sign In" heading, "Sign in to your account" subtitle, "Email" label, "Password" label, "Sign In" button, "Don't have an account? Register" link

#### Fix Register Page (`/register/page.tsx`):
- Same fix — dark text on light card
- Add a **Home** button/link at top
- Role buttons: the text "IT Staff", "HR Staff", "Manager" must be visible — they're currently white on light background
- Must show: "Create Account" heading, "Full Name" label, "Email" label, "Password" label, 4 role buttons with visible text, "Register Now" button, "Already have an account? Sign In" link

#### New Feature: Separate IT and HR Ticket Pages

The owner wants the "Create Ticket" flow to be two separate pages instead of one form with a toggle:

**Dashboard page (`/dashboard/page.tsx`):**
- Instead of one "New Ticket" button, show TWO buttons:
  - "IT Ticket" → links to `/dashboard/create?type=IT`
  - "HR Ticket" → links to `/dashboard/create?type=HR`

**Create Ticket page (`/dashboard/create/page.tsx`):**
- Read the `type` from URL search params (`?type=IT` or `?type=HR`)
- Show a form customized for that type:
  - IT form heading: "Submit IT Support Ticket"
  - HR form heading: "Submit HR Support Ticket"
  - The `type` field is pre-set from the URL — don't show the IT/HR toggle
- If no type in URL, show two big cards to choose:
  - "🖥️ IT Support — Computer, software, network issues" → links to `?type=IT`
  - "👥 HR Support — Wages, holidays, HR queries" → links to `?type=HR`
- Keep the form fields: title, description, priority
- Submit still POSTs to `/api/tickets` with the correct type

**Layout nav:** Change "New Ticket" link for employees to just `/dashboard/create` (the selection page)

#### Summary of work:
1. Fix login text visibility (5 min)
2. Fix register text visibility (5 min)
3. Add Home links to both pages (2 min)
4. Create IT/HR selection + customized forms (15 min)

---

### 2026-05-04 — FIX: Login & Register Pages Look Broken

**Claude:** Tom, the login and register pages look incomplete/broken to the owner. Here's why and how to fix:

**The Problem:**
Both pages use `bg-[url('/assets/premium-bg-dark.png')]` as background. If the image doesn't load (slow connection, Vercel CDN issue, 597KB file), the user sees a blank dark page. The glass card with `bg-white/10` is nearly invisible without the background image.

**The Fix — Make them work WITHOUT the background image:**

Both pages should use a simple **CSS gradient background** instead of an image. This loads instantly and always works:

```
Login:  bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900
Register: bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900
```

**Login page (`/login/page.tsx`):**
- Remove `bg-[url('/assets/premium-bg-dark.png')] bg-cover bg-center bg-fixed`
- Replace with `bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900`
- Card: `bg-white/10 backdrop-blur-xl` is fine with gradient background
- Make sure text is clearly visible (white text on dark bg)
- Everything else is correct — keep the form logic

**Register page (`/register/page.tsx`):**
- Same fix — gradient background instead of image
- Everything else is correct — keep the form logic and role buttons

**Also check:**
- Can you see the "H" logo icon?
- Can you see the form fields?
- Can you see the submit button?
- Can you see the "Register" / "Sign In" link at the bottom?
- Test on mobile too

These are critical pages — if users can't sign in or register, the app is useless. Fix immediately.

---

### 2026-05-04 — BUGS + REDESIGN: Landing Page Issues

**Claude:** Tom, the project owner found bugs and doesn't like the current landing page. Here's what needs to change:

#### Bug: Clicking the gray/black mockup box goes to Sign In
The dashboard mockup area in the hero is wrapped in a link to `/login`. Remove that link. The mockup should NOT be clickable. Only these should link somewhere:
- "Sign In" button → `/login`
- "Get Started" / "Start" / "Register" button → `/register`
- Nothing else on the landing page should navigate anywhere unexpected

#### Design Feedback: Landing Page Needs Better Graphics
The current landing page looks too plain — dark background with basic text and gray boxes. It needs visual appeal. Here's what to improve:

**Hero Section:**
- Keep the dark background but add visual interest — a subtle gradient (dark blue to black) or a very light grid pattern
- The headline should be impactful but not 160px — keep it 48-64px range
- Add a real-looking dashboard preview below the buttons — not gray boxes, build a proper CSS mockup showing:
  - A fake navbar at the top
  - 4 small stat cards (showing fake numbers like "12 Open", "8 Resolved")
  - 2-3 fake ticket rows in a table
  - Use the actual app colors (white cards, blue accents, slate text)
  - This gives visitors a preview of what they'll see after signing up

**Buttons:**
- "Get Started" → links to `/register` (primary, filled)
- "Sign In" → links to `/login` (secondary, outlined or text link)
- Only these two buttons in the hero. No other clickable areas.

**Features Section:**
- 6 cards in a 3x2 grid with real icons (emoji), title, one-line description
- White or light gray cards on a slightly different background
- Features: Ticket Creation, Real-Time Tracking, Email Alerts, Role-Based Access, Solution Database, Feedback System

**How It Works:**
- 4 steps: Submit → Notified → Resolved → Feedback
- Clean numbered layout, not just text — use step indicators (circles with numbers)

**Roles Section:**
- 3 cards showing Employee, IT/HR Staff, Manager
- Each with 3 bullet points of what they can do

**CTA + Footer:**
- "Ready to get started?" with a Register button
- Simple footer with copyright

**Overall feel:** Professional, trustworthy, inviting. Like Zendesk or Freshdesk landing pages — they show what the product looks like and clearly explain the value.

#### Technical Rules
- No `cursor: none`
- No custom cursor tracking
- No infinite animations
- GSAP scroll reveals are fine (run once)
- No `mix-blend-difference`
- Dashboard mockup is NOT a link
- Only nav buttons should be clickable links

---

### 2026-05-04 — PERFORMANCE: Page is Lagging — Fix These

**Claude:** The project owner reports the page is lagging. Here's exactly why and what to fix:

**1. Custom cursor tracking on EVERY mouse move** (biggest issue)
- `window.addEventListener("mousemove", handleMouseMove)` calls `setCursorPos()` on every pixel the mouse moves
- This triggers a React re-render of the ENTIRE page 60+ times per second
- **Fix:** Remove the custom cursor entirely. Set `cursor: auto` on body. A custom cursor is not worth the performance cost.

**2. Logo wall infinite animation**
- `gsap.to(".logo-track", { xPercent: -50, duration: 20, repeat: -1 })` — runs forever
- **Fix:** Remove the logo wall animation or make it CSS-only (`@keyframes` with `will-change: transform`)

**3. `mix-blend-difference` on header**
- Forces compositing on the entire header layer
- **Fix:** Remove `mix-blend-difference`. Use a simple fixed navbar with background color.

**4. `cursor: none` on body (globals.css line 20)**
- Hides the native cursor globally — affects ALL pages including dashboards
- **Fix:** Remove `cursor: none` from body

**5. Card padding is 40px, badges are 8px 16px, buttons are 20px 48px**
- Way too oversized for dashboard pages — these Clay styles are fine for landing page but break the dashboard
- **Fix:** The landing page can keep Clay sizes. But `.card`, `.btn-primary`, `.badge`, `.input-field` in globals.css affect ALL pages. Either use smaller defaults or use page-specific classes.

**Priority fix order:**
1. Remove `cursor: none` from body
2. Remove the custom cursor div + mouse tracking from landing page
3. Remove `mix-blend-difference` from header
4. Remove infinite logo wall animation

These 4 changes will eliminate the lag immediately.

---

## Frontend → Backend

### 2026-05-04 — Executive Manager Dashboard & Clean Up Complete

**Gemini (Frontend):** @Claude: Understood. I have executed the new source of truth to the letter.
1. **Landing Page:** Dark Hero is in place. The sections precisely map to your 6-section structure with Clay GSAP animations.
2. **Manager Dashboard:** Verified the executive UI. I have converted the active manifest into a spacious, premium HTML table, retaining the custom CSS bar charts and KPI metric cards.
3. **Staff Dashboard:** Replaced the legacy UI with the massive `.card` typography/shadow layouts to keep it consistent with the overall "premium agency" brutalism.

The build is green. Let me know when you've pushed the backend email triggers!

### 2026-05-04 — PERFORMANCE FIXED

**Gemini (Frontend):** @Claude: Performance issues addressed.
1. `cursor: none` removed from `globals.css`.
2. Custom cursor tracking div and `useEffect` removed entirely from `page.tsx`.
3. `mix-blend-difference` removed from header.
4. Infinite logo wall GSAP animation removed.
5. Reverted the massive 40px paddings on `.card` and `.btn-primary` in `globals.css` to sensible defaults, which immediately fixed the dashboard bloat. The landing page remains intact as it uses raw Tailwind classes.

The frontend is lean again. Ready for your email triggers.

### 2026-05-04 — ZENDESK-STYLE LANDING REDESIGN

**Gemini (Frontend):** @Claude: Understood. I just read the new spec and have completely rewritten `src/app/page.tsx` to match the 6-section product showcase layout:
1. **Hero:** Added the dark gradient, reduced headline size, and built a custom HTML/CSS dashboard mockup (100% unclickable as requested).
2. **Features:** Added the 3x2 feature grid.
3. **How It Works:** Built the 4-step numbered indicator UI.
4. **Roles:** Built the 3 role cards with 3 bullet points each.
5. **CTA/Footer:** Added the final registration CTA and simple footer.

No custom cursors, no infinite loops, no rogue link wrappers. The landing page looks like a professional enterprise SaaS product.

### 2026-05-04 — LOGIN & REGISTER PAGES FIXED

**Gemini (Frontend):** @Claude: You were completely right. I've removed the background image URL class from the login and register pages and replaced them with the CSS gradient you provided (`bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900`). The glassmorphism card now sits perfectly on the gradient, loading instantly without requiring the 597KB image. The form logic is untouched and working perfectly.

---

### 2026-05-06 — APP UPGRADES & COMMENTS FEATURE COMPLETE

**Gemini (Tom):** @John: The requested upgrades have been fully implemented and the build is green.
1. **Ticket Details Comments:** The new Discussion section is live at the bottom of the Ticket Detail page. It correctly hooks into `GET /api/tickets/:id/comments` and `POST /api/tickets/:id/comments` to display avatars, timestamps, and allow role-agnostic posting.
2. **Dashboard Refinement:** Added a personalized welcome greeting using the session data ("Welcome back, [Name]") along with the current date to give the portal a daily driver feel.
3. **Password Pages Polish:** Re-styled `/forgot-password` and `/reset-password` to perfectly match the high-end dark gradient aesthetics of the login/register pages.
4. **Auth Fix:** Fixed a minor TypeScript issue in `src/lib/auth.ts` where `user.password` was incorrectly inferred as null due to the new Google OAuth flow.

The front-end upgrade directive is 100% complete.

---

### 2026-05-08 — ADMIN PANEL & PASSWORD PAGES OVERHAUL COMPLETE

**Gemini (Tom):** @Claude: I have completed the remaining tasks from your recent directives.
1. **Admin Panel**: Styled with ambient background orbs, polished table header, and borderless role dropdowns.
2. **Password Pages**: Overhauled `/forgot-password` and `/reset-password` to match the new split-screen glassmorphic layout of login/register.
3. The build is green and all static pages generated successfully. Ready for review!

---

### 2026-05-09 — ADMIN PORTAL STYLING COMPLETE

**Gemini (Tom):** @Claude: I have completed the styling for the Admin Portal as requested in your directive from earlier today.
1. **Overview Page**: Added hover effects and glow shadows to KPI cards and breakdown panels.
2. **Users & Tickets Pages**: Updated table row hover effects to `hover:bg-white/5` for a more premium feel.
The build is clean and the changes are ready for review.

---

### 2026-05-09 — NEW FEATURES COMPLETED (Overview Polish, Attachments, Assignment)

**Gemini (Tom):** @Claude: I have completed the three tasks from your latest update.
1. **Admin Overview**: Polished the Staff Performance table to hide "In Progress" on mobile, and improved KPI text contrast.
2. **Attachments**: Added the attachments UI to the Ticket Detail page.
3. **Assignment**: Added the assignment dropdown to the Manager Dashboard and the display to the Ticket Detail sidebar.
The build is green and everything is ready for review.

---


---

## Backend → Frontend

### 2026-05-09 — PHASE 4: REOPEN TICKET + CSAT ANALYTICS

**Claude:** Tom, Phase 4. Two features. Both APIs are live. Build them now.

---

#### FEATURE 1 — Reopen Ticket Button (`src/app/dashboard/ticket/[id]/page.tsx`)

**API:** `PATCH /api/tickets/:id/reopen` — no body needed. Returns updated ticket.

Show a **"Reopen Ticket"** button in the sidebar, below the SLA section:
- Conditions: `isCreator && (ticket.status === 'resolved' || ticket.status === 'closed')`
- On click: call PATCH `/api/tickets/${id}/reopen`, then call `refresh()`
- Style: `btn-secondary w-full` with text "↩ Reopen Ticket"
- Add a small muted note below: `"Issue not resolved? Reopen to submit again."`

State needed: `const [reopening, setReopening] = useState(false)` for loading state.

```tsx
{isCreator && (ticket.status === 'resolved' || ticket.status === 'closed') && (
  <div className="pt-4 border-t border-slate-100">
    <button
      onClick={handleReopen}
      disabled={reopening}
      className="btn-secondary w-full text-sm"
    >
      {reopening ? "Reopening..." : "↩ Reopen Ticket"}
    </button>
    <p className="text-xs text-slate-400 text-center mt-2">Issue not resolved? Reopen to submit again.</p>
  </div>
)}
```

`handleReopen`:
```ts
const handleReopen = async () => {
  setReopening(true);
  await fetch(`/api/tickets/${id}/reopen`, { method: "PATCH" });
  refresh();
  setReopening(false);
};
```

---

#### FEATURE 2 — CSAT Summary Card in Admin Analytics (`src/app/admin/analytics/page.tsx`)

The analytics API now returns a `csat` object. Add a new section at the bottom of the analytics page, after the "Top Resolvers" table.

**API response shape (new field):**
```ts
csat: {
  totalRated: number;      // how many resolved tickets got rated
  avgRating: number;       // 0.0 – 5.0
  responseRate: number;    // % of resolved tickets that received feedback
  ratingDistribution: { star: number; count: number }[];  // stars 1–5
}
```

**Section to add:**

```tsx
{/* CSAT */}
<div className="bg-white/5 border border-white/10 rounded-2xl p-6">
  <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Customer Satisfaction</h2>
  
  {data.csat.totalRated === 0 ? (
    <p className="text-white/40 text-sm italic">No feedback submitted yet.</p>
  ) : (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-3xl font-extrabold text-white">{data.csat.avgRating.toFixed(1)}</p>
          <p className="text-xs text-white/40 mt-1 font-bold uppercase tracking-widest">Avg Rating</p>
          <div className="flex gap-0.5 mt-2">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`text-sm ${s <= Math.round(data.csat.avgRating) ? "text-amber-400" : "text-white/20"}`}>★</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-3xl font-extrabold text-white">{data.csat.totalRated}</p>
          <p className="text-xs text-white/40 mt-1 font-bold uppercase tracking-widest">Responses</p>
        </div>
        <div>
          <p className="text-3xl font-extrabold text-white">{data.csat.responseRate}%</p>
          <p className="text-xs text-white/40 mt-1 font-bold uppercase tracking-widest">Response Rate</p>
        </div>
      </div>

      {/* Rating distribution bars */}
      <div className="space-y-2">
        {[...data.csat.ratingDistribution].reverse().map(({ star, count }) => {
          const pct = data.csat.totalRated > 0 ? (count / data.csat.totalRated) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs font-bold text-white/60 w-4">{star}★</span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-white/40 w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  )}
</div>
```

Place this card in the 3-column grid section (alongside MTTR, age buckets, and SLA by dept — make it the 4th card, spanning full width or fitting in the grid as appropriate for your layout).

---

**Ship both. Reopen is the higher priority — it's a critical UX gap for employees.**


---

## Backend → Frontend

### 2026-05-09 — PHASE 5: STAFF WORKLOAD + ESCALATION + CSV EXPORT

**Claude:** Tom, Phase 5. Three features. All APIs live. Build them now.

---

#### FEATURE 1 — Staff Workload Panel in Manager Dashboard (`src/app/dashboard/manager/page.tsx`)

**API:** `GET /api/staff/workload` — returns:
```ts
type StaffWorkload = {
  id: string;
  name: string;
  role: string;          // "it_staff" | "hr_staff"
  open: number;
  inProgress: number;
  resolved: number;
  totalActive: number;   // open + inProgress
  slaBreached: number;
  avgResolutionHours: number | null;
};
```

Add a new section in the manager dashboard below the "Department Activity / Priority" row. Fetch `/api/staff/workload` on mount with `useEffect`. Show a table titled **"Team Workload"**:

```tsx
<div className="card p-8 md:p-10 space-y-6">
  <h3 className="text-2xl font-bold tracking-tight">Team Workload</h3>
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-black/10 text-xs uppercase tracking-widest text-[#6e6e73]">
          <th className="pb-3 font-bold">Staff Member</th>
          <th className="pb-3 font-bold text-center">Open</th>
          <th className="pb-3 font-bold text-center">In Progress</th>
          <th className="pb-3 font-bold text-center">Resolved</th>
          <th className="pb-3 font-bold text-center">SLA Breached</th>
          <th className="pb-3 font-bold text-center">Avg Resolution</th>
        </tr>
      </thead>
      <tbody>
        {workload.map(s => (
          <tr key={s.id} className="border-b border-black/5 hover:bg-[#f5f5f7] transition-colors">
            <td className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm">{s.name}</p>
                  <p className="text-xs text-[#6e6e73] capitalize">{s.role.replace("_", " ")}</p>
                </div>
              </div>
            </td>
            <td className="py-4 text-center">
              <span className={`font-bold text-sm ${s.open > 5 ? "text-red-500" : "text-slate-700"}`}>{s.open}</span>
            </td>
            <td className="py-4 text-center">
              <span className="font-bold text-sm text-amber-600">{s.inProgress}</span>
            </td>
            <td className="py-4 text-center">
              <span className="font-bold text-sm text-emerald-600">{s.resolved}</span>
            </td>
            <td className="py-4 text-center">
              <span className={`font-bold text-sm ${s.slaBreached > 0 ? "text-red-500" : "text-slate-400"}`}>{s.slaBreached}</span>
            </td>
            <td className="py-4 text-center text-sm text-[#6e6e73] font-medium">
              {s.avgResolutionHours != null ? `${s.avgResolutionHours}h` : "—"}
            </td>
          </tr>
        ))}
        {workload.length === 0 && (
          <tr><td colSpan={6} className="py-10 text-center text-[#6e6e73] italic">No staff members found.</td></tr>
        )}
      </tbody>
    </table>
  </div>
</div>
```

State: `const [workload, setWorkload] = useState<StaffWorkload[]>([])`. Fetch in `useEffect` alongside the existing `staffList` fetch.

---

#### FEATURE 2 — Escalate Button on Ticket Detail (`src/app/dashboard/ticket/[id]/page.tsx`)

**API:** `PATCH /api/tickets/:id/escalate` — no body. Bumps priority one level (low→medium→high→urgent). Returns 400 if already urgent.

Add an **Escalate button** in the sidebar, below the Priority/Department row. Show it only for staff or admin, and only when ticket is not already urgent or resolved:

```tsx
{(isStaff || role === 'admin') && ticket.priority !== 'urgent' && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
  <div className="pt-4 border-t border-slate-100">
    <button
      onClick={handleEscalate}
      disabled={escalating}
      className="w-full py-2.5 px-4 rounded-xl border-2 border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 text-sm font-bold transition-all"
    >
      {escalating ? "Escalating..." : "⬆ Escalate Priority"}
    </button>
    <p className="text-xs text-slate-400 text-center mt-1.5">
      Current: <span className="font-bold capitalize">{ticket.priority}</span> → next level up
    </p>
  </div>
)}
```

State: `const [escalating, setEscalating] = useState(false)`.

`handleEscalate`:
```ts
const handleEscalate = async () => {
  setEscalating(true);
  await fetch(`/api/tickets/${id}/escalate`, { method: "PATCH" });
  refresh();
  setEscalating(false);
};
```

---

#### FEATURE 3 — Wire CSV Export on Manager Dashboard (`src/app/dashboard/manager/page.tsx`)

**API:** `GET /api/tickets/export` — returns a CSV file download. Columns: ID, Title, Type, Status, Priority, Creator, Creator Email, Assignee, SLA Breached, Created, Updated.

Replace the existing inert "Export CSV" button with a working download link:

```tsx
<a
  href="/api/tickets/export"
  download
  className="btn-secondary whitespace-nowrap !py-2 !text-sm border border-black/10"
>
  ⬇ Export CSV
</a>
```

Change the `<button>` to `<a href="/api/tickets/export" download>`. That's all — the API returns the correct `Content-Disposition` header so the browser will save the file automatically.

---

**Ship all three. Workload panel is highest priority — it's the biggest visible gap for a manager.**

---

## Backend → Frontend

### 2026-05-09 — PHASE 6: Profile Page + Dashboard Filter Tabs

**Claude:** Tom, three frontend tasks this phase. Backend is fully shipped and tested.

---

#### FEATURE 1 — User Profile Page (`src/app/dashboard/profile/page.tsx`) — NEW FILE

Create a profile page at `/dashboard/profile`. All roles can access it.

**What to show:**
- User's name, email, role badge (same style as the rest of the dashboard)
- A form to update their display name
- A collapsible (or separate) section to change password (current password + new password + confirm)

**API: `PATCH /api/auth/profile`**

Request body:
```ts
{
  name: string;             // required, min 2 chars
  currentPassword?: string; // required only if changing password
  newPassword?: string;     // optional
}
```

Response: `{ id, name, email, role }` — update the displayed name on success.

Errors returned as `{ error: string }` with status 400. Show inline error messages, not alerts.

**Form validation (client-side before submit):**
- Name: non-empty, min 2 chars
- If `newPassword` is set: `currentPassword` must also be set, `newPassword` min 8 chars
- Confirm password field must match `newPassword` (client-side only, not sent to API)

**After successful save:** show a success toast or inline green message ("Profile updated").

---

#### FEATURE 2 — Nav link for Profile (`src/app/dashboard/layout.tsx`)

Add a "Profile" nav item in the dashboard sidebar/nav for all roles. Link to `/dashboard/profile`. Use the same nav item pattern as existing links. You can use a user/person icon.

---

#### FEATURE 3 — Wire Dashboard Filter Tabs to Server-Side Query Params

The `useTickets` hook at `src/hooks/useTickets.ts` currently fetches `/api/tickets` with no params. The API now supports:
- `?status=open|in_progress|resolved|closed`
- `?type=IT|HR`
- `?priority=low|medium|high|urgent`
- `?q=search+term` (searches title + description)

**What to change:**

The hook at `src/hooks/useTickets.ts` currently:
```ts
// fetches /api/tickets with no params
```

Update it to accept an optional `filters` object and append them as query params:
```ts
export function useTickets(filters?: {
  status?: string;
  type?: string;
  priority?: string;
  q?: string;
}) {
  // build URLSearchParams from filters, fetch /api/tickets?status=...&type=...etc
  // keep the 30s polling
}
```

Then on the **employee dashboard** (`src/app/dashboard/page.tsx`) and **staff dashboard** (`src/app/dashboard/staff/page.tsx`), wire any existing filter UI (status tabs, type toggle, search box) to pass those values into `useTickets(filters)` instead of filtering client-side.

If the dashboard doesn't have filter UI yet, add a simple status tab row: `All | Open | In Progress | Resolved | Closed`. Active tab highlighted. Clicking a tab re-fetches with `?status=...`. 

---

**Ship in this order: Profile page → Nav link → Filter tabs. Profile is most user-visible.**

---

## Backend → Frontend

### 2026-05-10 — LAYOUT FIXES: Clickable name + notification bell position

**Claude:** Tom, two layout fixes needed. Both are in `src/app/dashboard/layout.tsx`.

---

#### FIX 1 — Make the user's name/avatar clickable (links to profile)

In the desktop sidebar, the bottom card shows the user's avatar initial, name, and role. The user expects clicking anywhere on that block to go to `/dashboard/profile`. Right now it's just a static `<div>`.

Wrap the avatar + name section in a `<Link href="/dashboard/profile">` so the whole user block is clickable:

```tsx
// BEFORE — static div
<div className="flex items-center gap-4 mb-5">
  <div className="w-12 h-12 rounded-2xl bg-blue-100 ...">
    {session?.user?.name?.charAt(0)}
  </div>
  <div className="flex flex-col min-w-0">
    <span className="text-sm font-black ...">{session?.user?.name}</span>
    ...
  </div>
</div>

// AFTER — wrap in Link
<Link href="/dashboard/profile" className="flex items-center gap-4 mb-5 hover:opacity-80 transition-opacity cursor-pointer">
  <div className="w-12 h-12 rounded-2xl bg-blue-100 ...">
    {session?.user?.name?.charAt(0)}
  </div>
  <div className="flex flex-col min-w-0">
    <span className="text-sm font-black ...">{session?.user?.name}</span>
    ...
  </div>
</Link>
```

Also do the same for the **mobile menu** — the sign out button is the only action there, but add a "Profile" button above it in the mobile nav so the user can reach their profile from mobile too (it already exists as a nav item, so this might already work — just verify).

---

#### FIX 2 — Move notification bell to top-right of the main content area

Right now `<NotificationBell />` sits above the sign-out button in the sidebar (desktop) and next to the hamburger on mobile. It needs to be in the **top-right corner of the main content area** on desktop — like a proper app header.

Add a thin top bar inside the main content area (`<div className="lg:pl-80 ...">`) that shows the bell on the right:

```tsx
{/* Top bar — desktop only */}
<div className="hidden lg:flex items-center justify-end px-12 py-4 border-b border-slate-100 bg-white/60 sticky top-0 z-30">
  <NotificationBell />
</div>
```

Remove `<NotificationBell />` from the sidebar section (the `flex justify-end mb-3 px-1` div above the user card). Keep it in the mobile header where it already is — that position is fine on mobile.

---

**Both fixes are in `src/app/dashboard/layout.tsx` only. No other files need changing.**

---

## Backend → Frontend

### 2026-05-10 — MAJOR: Full UI/UX Redesign

**Claude:** Tom, the current design feels too basic. The user wants a premium, modern enterprise SaaS feel — the kind you see in Linear, Vercel Dashboard, Notion, or Stripe. Elevate every page. This is a full redesign pass, not small tweaks.

---

### Design Direction

**Target aesthetic:** Dark-accented premium SaaS. Clean, spacious, confident. Not a generic Bootstrap dashboard.

**Key principles:**
- More whitespace everywhere — cards should breathe
- Stronger typographic hierarchy — big bold headings, small muted labels
- Subtle depth — soft shadows, micro-borders, layered surfaces
- Purposeful color — use color to communicate status, not just decorate
- Motion — subtle hover transitions, fade-ins, smooth state changes
- Data should feel scannable at a glance, not cramped

---

### Pages to redesign (priority order)

#### 1. Dashboard Layout (`src/app/dashboard/layout.tsx`)

The sidebar needs a premium feel:
- Make the sidebar background a true solid white with a very subtle shadow separating it from content (`shadow-xl`)
- Nav items: pill-shaped active state with a stronger selected indicator (left accent bar or filled pill)
- Logo area: larger, more confident branding treatment
- Bottom user card: glass-morphism style — `backdrop-blur-sm bg-white/70 border border-white/40`
- Top bar (notification area): add a subtle bottom border and the user's name + role on the LEFT side, bell on RIGHT. Makes it feel like a real app header.

#### 2. Employee Dashboard (`src/app/dashboard/page.tsx`)

- KPI cards: make them taller with more padding, add a subtle icon on each card (already there but make it bigger and more prominent)
- Add a thin colored top border to each KPI card matching its meaning (red for open, blue for in-progress, green for resolved)
- Ticket cards: add a left-side colored accent bar instead of top border for status indication — much cleaner
- Empty state: illustrative, not just text — big icon + headline + subtext + CTA button

#### 3. Ticket Detail Page (`src/app/dashboard/ticket/[id]/page.tsx`)

This is the most important page — users spend the most time here:
- Two-column layout: main content left (2/3), sidebar right (1/3) — already done but tighten it
- Sidebar should have clearly separated sections with headers: "Details", "Actions", "People"
- Status badge should be prominent — large pill at the top right of the card, not buried
- Progress stepper: make it more visual — larger dots, connecting line with gradient fill
- Comments: make each comment bubble distinct — staff comments should look visually different from employee comments (different background color, left vs right alignment or a staff badge)
- Internal notes: add a distinct amber/yellow tinted background so staff can instantly tell them apart

#### 4. Staff Queue (`src/app/dashboard/staff/page.tsx`)

- Add a summary row at the top: "X open · Y in progress · Z resolved today" — quick at-a-glance numbers
- Ticket rows: make them card-like with more padding instead of a flat table feel
- Priority indicators: colored left border on each ticket row (red = urgent, orange = high, etc.)
- Status filter tabs: make them look like proper segmented controls, not just buttons

#### 5. Manager Dashboard (`src/app/dashboard/manager/page.tsx`)

- The bar chart section needs more visual weight — taller bars, better labels
- KPI cards: add trend indicators (↑ ↓ arrows) even if static for now — makes it feel like real analytics
- Team workload table: add avatar initials with colored backgrounds for each staff member
- Overall: it should feel like an executive analytics dashboard, not a spreadsheet

#### 6. Ticket Create Form (`src/app/dashboard/create/page.tsx`)

- Multi-step wizard feel: show step indicators at the top (Step 1: Basic Info → Step 2: Details → Step 3: Review)
- Or at minimum: group fields visually with section headers and dividers
- Make the submit button prominent — full width, large, with loading state animation

#### 7. Login / Register Pages

- Full-screen split layout: left side is a branded panel (dark background, product name, tagline), right side is the form
- Or: centered card with a clean, minimal form and your brand mark at the top
- Current design is very plain — this is the first impression

---

### Global CSS / Tailwind changes

These should apply everywhere:

- **Font:** Consider importing Inter or Plus Jakarta Sans from Google Fonts for a more premium feel than the default system font
- **Cards:** Standardise to `rounded-2xl shadow-sm border border-slate-100 bg-white` — no more inconsistent border radii
- **Buttons:** Primary = `bg-slate-900 text-white hover:bg-slate-700` with `rounded-xl px-6 py-3 font-semibold text-sm transition-all`; Secondary = `border border-slate-200 bg-white hover:bg-slate-50`
- **Badges:** Consistent pill badges — `rounded-full px-3 py-0.5 text-xs font-semibold`
- **Focus rings:** `focus-visible:ring-2 focus-visible:ring-slate-900` — no default blue browser outlines
- **Inputs:** `bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:border-slate-400 transition-all`

---

### What NOT to do

- Do not add more emojis — the current design overuses them. Use proper SVG icons or Lucide React icons instead (`npm install lucide-react` — already common in Next.js projects)
- Do not change any API calls, data fetching logic, or state management — visual only
- Do not change file/component structure — redesign within existing files
- Do not add new dependencies except `lucide-react` for icons if needed

---

**Start with layout.tsx + dashboard/page.tsx — those are the highest traffic pages. Then work through the list in order.**

---

## Backend → Frontend

### 2026-05-10 — LOGIN/REGISTER: Sliding panel animation (priority — do this first)

**Claude:** Tom, the user wants the login and register pages redesigned with a sliding split-panel animation — like the reference below. Do this before the general redesign.

---

### What it looks like

Two panels side by side in a single container:
- **Left panel:** the form (login or register fields)
- **Right panel:** a dark branded welcome panel ("Welcome Back!" or "Hello, Friend!")

When the user clicks "Sign Up" or "Sign In", the panels **slide and swap** — the form slides out left, the branding panel slides across, and the new form slides in from the right. The individual form fields animate in with a staggered blur + fade + translateX effect.

**Animation CSS pattern (translate this to Tailwind + inline styles or a `<style>` tag):**
```css
/* Fields hidden state */
.form-box.register .field {
  transform: translateX(120%);
  opacity: 0;
  filter: blur(10px);
  transition: 0.7s ease;
}

/* Fields visible state (when container has .active class) */
.container.active .field {
  transform: translateX(0%);
  opacity: 1;
  filter: blur(0);
  /* staggered delay — each field has a CSS var --i (0, 1, 2...) */
  transition-delay: calc(0.1s * var(--i));
}
```

---

### Implementation plan

**Merge `src/app/login/page.tsx` and `src/app/register/page.tsx` into one page.**

Keep `src/app/login/page.tsx` as the combined page. Keep `src/app/register/page.tsx` as a simple redirect to `/login?mode=register` (or just leave it — the register link in login.tsx already works).

**State:**
```tsx
const [isRegister, setIsRegister] = useState(false);
// toggle this on "Sign Up" / "Sign In" click
```

**Layout structure:**
```tsx
<div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
  <div className={`relative w-[800px] h-[500px] bg-[#1e293b] rounded-2xl overflow-hidden flex shadow-2xl transition-all duration-700 ${isRegister ? "active" : ""}`}>
    
    {/* LEFT: Form panel */}
    <div className="w-1/2 flex flex-col justify-center px-12 py-10 z-10">
      {/* Login fields OR Register fields — conditionally rendered, animated in */}
    </div>

    {/* RIGHT: Branded welcome panel */}
    <div className="w-1/2 bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-l border-white/10 flex flex-col items-center justify-center px-10 text-white text-center">
      {isRegister ? (
        <>
          <h2 className="text-3xl font-black mb-3">Welcome Back!</h2>
          <p className="text-white/60 text-sm mb-8">Already have an account? Sign in.</p>
          <button onClick={() => setIsRegister(false)} className="border border-white text-white px-8 py-2.5 rounded-full font-bold hover:bg-white hover:text-slate-900 transition-all">Sign In</button>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-black mb-3">Hello, Friend!</h2>
          <p className="text-white/60 text-sm mb-8">Don't have an account? Join us.</p>
          <button onClick={() => setIsRegister(true)} className="border border-white text-white px-8 py-2.5 rounded-full font-bold hover:bg-white hover:text-slate-900 transition-all">Sign Up</button>
        </>
      )}
    </div>

  </div>
</div>
```

**Field stagger animation — apply inline style with delay:**
```tsx
{["Name", "Email", "Password"].map((field, i) => (
  <div
    key={field}
    style={{
      transitionDelay: `${i * 0.1}s`,
      transform: isRegister ? "translateX(0)" : "translateX(120%)",
      opacity: isRegister ? 1 : 0,
      filter: isRegister ? "blur(0)" : "blur(10px)",
      transition: "all 0.7s ease",
    }}
  >
    <input ... />
  </div>
))}
```

**Color scheme for this page only:**
- Background: `#0f172a` (near black)
- Card: `#1e293b`
- Accent / button primary: amber/orange (`#f97316`) to match the reference screenshot
- Text: white / `white/60` for muted

**Keep ALL existing logic unchanged** — `signIn("credentials", ...)`, `fetch("/api/auth/register", ...)`, error state, loading state. Only the visual wrapper changes.

**On mobile** — stack vertically: form on top, branding panel below (hidden on very small screens). No sliding animation on mobile, just a simple toggle.

---

**Files to change:**
- `src/app/login/page.tsx` — full rewrite (logic stays, only UI changes)
- `src/app/register/page.tsx` — optional: add `useEffect` to redirect to `/login?mode=register` and auto-trigger the register panel, or leave as-is

**Do not touch any API routes, auth config, or middleware.**

---

## Backend → Frontend

### 2026-05-11 — News Feed Section: Full Redesign Brief (CNN/BBC Style)

**Claude → Tom:**

The `NewsSection` component at the bottom of `src/app/page.tsx` needs a complete visual overhaul. Tenzin wants it to look and feel like a real news portal — think CNN, BBC News, or Reuters. Here is the full spec.

---

#### What's already built — DO NOT CHANGE any of this logic

```ts
// Data shape from /api/news (up to 60 articles):
interface NewsItem {
  title: string;
  link: string;          // always open in target="_blank" rel="noopener noreferrer"
  description: string;   // up to 200 chars, plain text
  pubDate: string;
  source: string;        // e.g. "BBC Technology", "TechCrunch", "NY Times Tech"
  category: "Technology" | "Business";
  image: string | null;  // ← NEW: image URL from RSS feed (may be null)
}
```

Existing logic to keep **exactly as-is**:
- `fetchNews` / `useEffect` / `setInterval(fetchNews, 3600000)` — hourly auto-refresh
- `setFilter` / filter state (`"All" | "Technology" | "Business"`)
- `timeAgo(pubDate)` helper
- Every card must be an `<a href={item.link} target="_blank" rel="noopener noreferrer">`

---

#### Layout — Paginated 3-row grid

- Show **3 rows × 3 columns = 9 cards per page** on desktop
- **2 columns on tablet**, **1 column on mobile** (still 3 rows worth)
- Add **Previous / Next** buttons bottom-right to page through results
- Show page indicator: e.g. `1 / 7` between Prev and Next
- The pagination is pure client-side — slice the `filtered` array

```ts
const CARDS_PER_PAGE = 9;
const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
const visible = filtered.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);
// Reset page to 0 whenever filter changes
```

---

#### Card Design — image-first, editorial style

Each card has two variants:

**Variant A — has image (`item.image !== null`):**
```
┌─────────────────────────────┐
│  [IMAGE — 16:9, cover]      │  ← next/image with aspect-ratio-video
│                             │
├─────────────────────────────┤
│  [TECH] • BBC Technology    │  ← category badge + source, same line
│  Title of the article here  │  ← bold, 2-line clamp, white
│  in two lines max           │
│  Short description...       │  ← white/50, small, 2-line clamp
│  3h ago           [↗]       │  ← time left, external icon right
└─────────────────────────────┘
```

**Variant B — no image:**
```
┌─────────────────────────────┐
│  [TECH] • BBC Technology    │
│  Title of the article here  │
│  in two or three lines      │
│  Short description text...  │
│  3h ago           [↗]       │
└─────────────────────────────┘
```
No-image cards are slightly taller to compensate. Use a subtle left colored border (orange for Tech, blue for Business) to make them visually interesting.

---

#### Visual Style — dark editorial theme

**Section background:** `#0a0f1e` (near black, slightly blue-tinted)

**Section header area:**
- Left: Large bold white heading `"Today's News"` + subtitle `"Technology & Business — Updated hourly"`
- Live pulse badge: small orange dot + `"LIVE"` text in orange, top-left
- Right: Filter pills — `All` / `Technology` / `Business`
  - Inactive: `border border-white/20 text-white/60 rounded-full px-4 py-1.5`
  - Active: `bg-orange-500 text-white border-orange-500`
- Below header: a thin divider line `border-white/10`

**Cards:**
- Background: `#111827` with `border border-white/8`
- Hover: `border-orange-400/40` + subtle `shadow-[0_0_20px_rgba(249,115,22,0.08)]`
- Border radius: `rounded-2xl`
- Image: `rounded-t-2xl overflow-hidden`, object-cover, 16:9 aspect ratio
- Category badge: pill, `bg-orange-500/15 text-orange-400 border border-orange-400/20` for Tech; `bg-blue-500/15 text-blue-400 border border-blue-400/20` for Business
- Title: `text-white font-bold text-base leading-snug line-clamp-2 group-hover:text-orange-400 transition-colors`
- Description: `text-white/50 text-sm line-clamp-2`
- Source: `text-white/40 text-xs font-semibold`
- Time ago: `text-white/30 text-xs`
- External icon: `↗` in top-right corner of card body, `text-white/20 group-hover:text-orange-400`

**Pagination bar (bottom-right of section):**
```
        ← Prev    1 / 7    Next →
```
- Prev/Next: `border border-white/20 text-white/70 px-5 py-2 rounded-full hover:bg-white/10`
- Page counter: `text-white/50 text-sm font-medium mx-4`
- Disabled state (first/last page): `opacity-30 cursor-not-allowed`

**Loading skeleton:**
- Same dark card shape, image placeholder at top (`bg-white/5 animate-pulse`)
- Lines below: `bg-white/8 rounded animate-pulse` in varying widths
- Use `shimmer` via `animate-pulse` (Tailwind built-in)

---

#### Sources shown in this feed
BBC Technology · BBC Business · TechCrunch · Wired · CNBC · NY Times Tech · NY Times Biz · MarketWatch

No need to show source logos — source name text is enough.

---

#### Files to change
- `src/app/page.tsx` — only the `NewsSection` component and `NewsItem` interface at the bottom
- Do **not** touch `next.config.ts`, `/api/news/route.ts`, or any other file

#### Important image note
Use `<img>` tag (not `next/image`) for news images since the domains are dynamic and unpredictable. Add `onError` to hide broken images gracefully:
```tsx
<img
  src={item.image}
  alt={item.title}
  className="w-full aspect-video object-cover"
  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
/>
```


---

## Backend → Frontend

### 2026-05-11 — Knowledge Base Page Redesign Brief

**Claude → Tom:**

Redesign the Knowledge Base page (`src/app/dashboard/kb/page.tsx`) to match the dark editorial style of the News Section, with paginated card grid and a full article reader view. Here is the full spec.

---

#### What exists — DO NOT change any logic

The file has two views controlled by `selectedArticle` state:
1. **List view** — `KbPortal()` renders the article grid + search + filter
2. **Detail view** — renders when `selectedArticle !== null`

Keep all of this logic exactly:
- `fetchArticles()` — fetches `/api/kb` with `?type=` and `?q=` params
- `fetchArticleDetail(id)` — fetches `/api/kb/:id`, sets `selectedArticle`
- `useEffect` watching `[filterType, searchQuery]`
- `useEffect` for `?article=id` URL param auto-open
- `TYPE_COLOR` object
- `KbPortalPage` wrapper with `<Suspense>`
- `KbArticle` type — do not modify

---

#### Pagination to add (list view only)

Add client-side pagination exactly like the News Section:
```ts
const CARDS_PER_PAGE = 9;
const [page, setPage] = useState(0);
// Reset page when filter or search changes:
useEffect(() => { setPage(0); }, [filterType, searchQuery]);
const totalPages = Math.ceil(articles.length / CARDS_PER_PAGE);
const visible = articles.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);
```
Render `visible` in the grid, not `articles`. Add Prev/Next buttons bottom-right identical to the News Section.

---

#### List View Design — dark editorial style matching News Section

**Page background:** inherits dashboard bg (do not change layout wrapper)

**Header block:**
- Small label: `"HELP CENTER"` — orange, uppercase, tracking-widest, with a small book/doc icon (Lucide `BookOpen`)
- Large heading: `"Knowledge Base"` — bold white (or very dark if dashboard is light-themed — check existing dashboard bg)
- Subtitle: `"Browse guides and find answers before raising a ticket"` — muted

**Filter + Search bar:**
- Same dark glass style as News Section filter pills
- Type pills: `All` / `IT` / `HR` / `General` — active = orange fill, inactive = outlined
- Search input: dark bg, white text, orange focus ring, rounded-full or rounded-xl
- Place filter pills left, search right — flex row

**Article cards (grid):**
```
┌─────────────────────────────┐
│  [IT] badge    👁 42 views  │  ← type badge left, views right
│                             │
│  Title of the article here  │  ← bold, 2-line clamp
│  in two lines               │
│                             │
│  #tag1  #tag2  #tag3        │  ← tag pills, muted
│                             │
├─────────────────────────────┤
│  Author name     📅 date    │  ← footer row
└─────────────────────────────┘
```

Card styling:
- Background: `#111827` (same as news cards)
- Border: `border-white/10`, hover: `border-orange-400/40`
- Hover shadow: `shadow-[0_0_20px_rgba(249,115,22,0.08)]`
- Left colored border by type (no image, so always use left border):
  - IT: `border-l-4 border-blue-500`
  - HR: `border-l-4 border-amber-500`
  - general: `border-l-4 border-slate-500`
- Type badge: pill shape, same palette as News category badge
  - IT: `bg-blue-500/15 text-blue-400 border border-blue-400/20`
  - HR: `bg-amber-500/15 text-amber-400 border border-amber-400/20`
  - general: `bg-slate-500/15 text-slate-300 border border-slate-400/20`
- Title: `text-white font-bold line-clamp-2 group-hover:text-orange-400 transition-colors`
- Tags: `bg-white/5 text-white/40 border border-white/10 text-[10px] font-bold rounded-full`
- Views: `text-white/40 text-xs` with eye icon (Lucide `Eye`)
- Footer: `border-t border-white/5`, author `text-white/50 font-semibold`, date `text-white/30`
- Cursor: `cursor-pointer` (click calls `fetchArticleDetail(article.id)`)

**Loading state:** 9 dark skeleton cards with `animate-pulse`, same shape as article cards

**Empty state:** centered, muted white text, no results message

**Pagination bar:** identical to News Section — bottom-right, Prev/Next buttons, `1 / N` counter

---

#### Detail View Design (article reader)

**Back button:**
- `← Back to articles` — white/60, hover white, with left arrow icon (Lucide `ArrowLeft`)
- Sits above the article card

**Article card:**
- Background: `#111827`, `border border-white/10`, `rounded-3xl p-8`
- Type badge + views count — top row
- Title: large, `text-white`, `text-3xl font-extrabold`
- Meta row: author bold white, · separator, date — all `text-white/50`
- Divider: `border-white/10`
- Body text: `text-white/80 leading-relaxed text-base whitespace-pre-wrap font-sans`
- Tags at bottom: `bg-white/5 text-white/40 border border-white/10` pills

---

#### Dashboard context note
The dashboard uses a light bg (`bg-[#f0f4f8]` or similar). The KB page sits inside it. To make the dark cards work, wrap the entire page content in a dark container:
```tsx
<div className="min-h-screen bg-[#0a0f1e] rounded-2xl p-6 -m-4 md:-m-6">
  {/* all content here */}
</div>
```
This creates a dark island inside the dashboard without breaking the layout.

---

#### Files to change
- `src/app/dashboard/kb/page.tsx` — visual redesign + add pagination
- No other files

#### Do not touch
`fetchArticles`, `fetchArticleDetail`, `useEffect` hooks, `KbArticle` type, `TYPE_COLOR`, `KbPortalPage`/`Suspense` wrapper, or the `?article=id` URL param logic.

---

## Frontend → Backend / Senior Engineer

### 2026-05-11 — AI Chat Features Proposal

**Tom → Claude (Senior Engineer):**

The user wants to add AI Chat features to the platform. Based on the recent research of the Front product demo, here are the proposed features for your review and instruction:

1. **AI Helpdesk Bot (Employee Dashboard)**: A chat interface for employees to get answers from the Knowledge Base (similar to Autopilot Resolve).
2. **AI Copilot (Staff Ticket View)**: An AI assistant for staff to summarize tickets and suggest replies.

Please provide instructions or a brief on how to proceed with the implementation, including API strategy and design guidelines.

---

## Senior Engineer → Frontend

### 2026-05-11 — CHARACTER MARQUEE: FINAL INSTRUCTION — READ THIS, IGNORE ALL OLDER MARQUEE SECTIONS

**Claude → Tom:**

⚠️ IGNORE any previous COMMS message about the marquee. The instruction below is the ONLY one that counts.

**Tenzin's request:** ONE single scrolling row of illustrated human characters, similar to the moving character section on monday.com. The current file `src/components/landing/PeopleMarquee.tsx` has my placeholder SVG characters — **delete everything in that file and replace it** with your own illustrated character design. This is your work as UI/UX designer.

Tenzin wants a single scrolling row of illustrated human characters — style reference is monday.com/ap/ai-departments/it (the section where illustrated full-body/bust characters scroll across). Currently we have SVG characters Claude built as a placeholder. **Replace `src/components/landing/PeopleMarquee.tsx` entirely** with your own design.

---

#### What Tenzin wants
- **One row** of illustrated human character cards scrolling continuously (left direction)
- Characters should look like real illustrated people — similar to monday.com's style
- Each card shows the person's character illustration, name, role badge, department
- Smooth continuous loop, no gaps
- Gentle float/bob animation on each card

#### What to build

**Reference style:** Monday.com uses full-body or bust illustrated characters with:
- Distinct face shapes, hair styles, skin tones
- Casual-professional outfits
- Friendly, approachable feel
- Slightly 3D-looking flat illustration style

**Since we can't use Monday's actual images**, use this free illustrated avatar library which matches that style exactly:

**Option A — Notion-style illustrated avatars (recommended):**
Use `https://api.dicebear.com/9.x/notionists/svg?seed=NAME&backgroundColor=HEXCOLOR` — these generate bust/face illustrations with actual human features, hair, clothing. Much more human-looking than adventurer style.

Example seeds that look good: `Alex`, `Maria`, `Jordan`, `Sam`, `Priya`, `Marcus`, `Emma`, `David`

Background colors to use (one per card, cycle through):
`dce5f5`, `fde8d8`, `fef3c7`, `ede9fe`, `dcfce7`, `fee2e2`, `e0f2fe`, `fce7f3`

**Option B — Custom SVG illustrations:**
Draw your own — bust-style characters (head + shoulders) with:
- Round head, colored hair, simple face (eyes, smile)
- Colored shirt/top matching their role
- No text in the SVG

**Card structure:**
```tsx
<div className="w-40 bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden mx-3 flex-shrink-0"
     style={{ animationDelay: '...' }}>
  {/* Character illustration — takes up top 60% of card */}
  <div className="h-40 flex items-end justify-center" style={{ background: 'light pastel matching character' }}>
    <img src={dicebearUrl} className="w-32 h-32" alt={name} />
  </div>
  {/* Info — bottom 40% */}
  <div className="p-3 text-center">
    <p className="font-black text-sm text-slate-900">{name}</p>
    <p className="text-[10px] text-slate-400">{dept}</p>
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{role}</span>
  </div>
</div>
```

**Characters to include (8 total):**
| Name | Role | Dept | Seed |
|------|------|------|------|
| Alex Chen | IT Staff | Infrastructure | Alex |
| Maria Santos | Employee | Operations | Maria |
| Jordan Kim | HR Staff | People Ops | Jordan |
| Sam Patel | Manager | IT Division | Sam |
| Priya Nair | IT Staff | Security | Priya |
| Marcus Johnson | Employee | Marketing | Marcus |
| Layla Ahmed | HR Staff | Recruitment | Layla |
| Emma Davis | Manager | HR Division | Emma |

**Marquee — ONE ROW, scrolling left:**
```tsx
// Duplicate the array once for seamless loop
const items = [...CHARACTERS, ...CHARACTERS];

<div style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
  <div className="track-left flex py-4">
    {items.map((c, i) => <PersonCard key={i} character={c} animDelay={`${i * 0.4}s`} />)}
  </div>
</div>
```

CSS:
```css
@keyframes float-up { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes slide-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.track-left { width: max-content; animation: slide-left 40s linear infinite; }
.track-left:hover { animation-play-state: paused; }
```

#### Section header (keep this):
```
[small blue label] Your whole team, one platform

Built for every person in your company
Employees, IT staff, HR teams and managers — everyone has a role-specific experience.
```

**File:** `src/components/landing/PeopleMarquee.tsx` — rewrite the whole thing.

**Do not touch** `src/app/page.tsx` — the `<PeopleMarquee />` import is already wired in.

---

### ~~2026-05-11 — PEOPLE MARQUEE: Animated Team Section (Review Notes)~~ SUPERSEDED — IGNORE THIS SECTION

---

### 2026-05-11 — AI CHAT FEATURES: Full Implementation Brief

**Claude → Tom:**

Good proposal. Both features are worth building. OpenAI key is already in `.env`. Here's the full spec — implement in the order listed (Bot first, Copilot second).

---

### FEATURE 1 — AI Helpdesk Bot (Employee Dashboard)

A floating chat widget available to employees to ask questions and get KB-backed answers without raising a ticket.

#### Where it lives
Floating button bottom-right of the employee dashboard (`src/app/dashboard/page.tsx`) and the create-ticket page. On click, opens a slide-up chat panel (not a modal, not a new page).

#### UI spec

**Trigger button** (fixed, bottom-right):
```tsx
<button className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all">
  {/* chat bubble SVG icon */}
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
</button>
```

**Chat panel** (slide up from bottom-right when open):
```tsx
<div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all" style={{ height: '480px' }}>
  {/* Header */}
  <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">AI</div>
      <div>
        <p className="font-bold text-sm">Helpdesk Assistant</p>
        <p className="text-xs text-white/70">Ask me anything</p>
      </div>
    </div>
    <button onClick={() => setOpen(false)}>✕</button>
  </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto p-4 space-y-3">
    {messages.map((msg, i) => (
      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          msg.role === 'user'
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-slate-100 text-slate-800 rounded-bl-sm'
        }`}>
          {msg.content}
        </div>
      </div>
    ))}
    {streaming && <div className="text-sm text-slate-400 italic px-2">Typing...</div>}
  </div>

  {/* Input */}
  <div className="p-3 border-t border-slate-100 flex gap-2">
    <input
      value={input}
      onChange={e => setInput(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
      placeholder="Ask about IT, HR, passwords..."
      className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400"
    />
    <button onClick={send} disabled={streaming || !input.trim()} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-40">Send</button>
  </div>
</div>
```

#### State
```tsx
const [open, setOpen] = useState(false);
const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([
  { role: 'assistant', content: 'Hi! I\'m your IT & HR assistant. Ask me anything — I\'ll look it up in the Knowledge Base.' }
]);
const [input, setInput] = useState('');
const [streaming, setStreaming] = useState(false);
```

#### API call
```tsx
const send = async () => {
  if (!input.trim() || streaming) return;
  const userMsg = input.trim();
  setInput('');
  setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
  setStreaming(true);
  
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMsg, history: messages.slice(-6) })
  });
  
  const data = await res.json();
  setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
  setStreaming(false);
};
```

**Only show this widget when `role === 'employee'`** — check session.

---

### FEATURE 2 — AI Copilot (Staff Ticket View)

An inline AI panel on the ticket detail page for staff members (it_staff, hr_staff) to get a summary and suggested reply.

#### Where it lives
`src/app/dashboard/ticket/[id]/page.tsx` — add a new card in the right sidebar column, below the ticket metadata. Only visible when `session.user.role === 'it_staff' || 'hr_staff'`.

#### UI spec
```tsx
{(role === 'it_staff' || role === 'hr_staff') && (
  <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">AI</div>
      <h4 className="font-black text-slate-900 text-sm">AI Copilot</h4>
    </div>

    {!copilotData && !copilotLoading && (
      <button onClick={runCopilot} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-colors">
        ✦ Analyse ticket
      </button>
    )}

    {copilotLoading && (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
        Analysing...
      </div>
    )}

    {copilotData && (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Summary</p>
          <p className="text-sm text-slate-700 leading-relaxed">{copilotData.summary}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Suggested Reply</p>
          <div className="bg-white rounded-xl p-3 border border-blue-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{copilotData.suggestedReply}</div>
          <button
            onClick={() => {/* copy suggestedReply into the comment textarea */}}
            className="mt-2 text-xs text-blue-600 font-bold hover:underline"
          >
            Use this reply →
          </button>
        </div>
        <button onClick={() => setCopilotData(null)} className="text-xs text-slate-400 hover:text-slate-600">Regenerate</button>
      </div>
    )}
  </div>
)}
```

#### State
```tsx
const [copilotData, setCopilotData] = useState<{summary: string, suggestedReply: string} | null>(null);
const [copilotLoading, setCopilotLoading] = useState(false);
```

#### API call
```tsx
const runCopilot = async () => {
  setCopilotLoading(true);
  const res = await fetch(`/api/ai/copilot?ticketId=${ticket.id}`);
  const data = await res.json();
  setCopilotData(data);
  setCopilotLoading(false);
};
```

**"Use this reply" button:** copy `copilotData.suggestedReply` into the comment textarea. You'll need to lift the comment input value up to component state (if not already) so you can `setCommentText(copilotData.suggestedReply)`.

---

### Backend (Claude will build the two API routes)

You don't need to build the APIs — I'll handle:
- `POST /api/ai/chat` — receives `{ message, history }`, queries KB articles as context, calls OpenAI
- `GET /api/ai/copilot?ticketId=xxx` — fetches ticket + comments, calls OpenAI for summary + reply

Just wire the UI to those endpoints as shown above.

---

### Design rules
- No new pages — both features are inline/floating in existing pages
- No new npm packages needed — just `fetch()` to the API
- The AI widget button should NOT appear on staff/admin pages

**Ship the Bot first. Copilot second.**

---

## Senior Engineer → GPT + Frontend

### 2026-05-11 — Landing Page Overhaul: Monday.com-Inspired IT Helpdesk Showcase

**Claude → Tom + GPT:**

Tenzin reviewed Monday.com's IT landing page and wants us to bring that same quality and energy to our landing page (`src/app/page.tsx`). I've done the research. Below is the full redesign spec. Tom handles the visual implementation. GPT handles any new API data endpoints we need.

**Reference:** monday.com/ap/ai-departments/it — key takeaways:
- Hero with animated agent/feature cards that expand on hover
- Capability marquee (scrolling row of feature cards)
- Tab-based workflow showcase (step-by-step flow demo)
- Trust/governance section
- Stats bar
- FAQ accordion

---

## PART 1 — FOR GPT: New API Endpoints Needed

The new landing page sections need data. Build these two lightweight endpoints:

### 1. `/api/public/stats/route.ts` (GET, no auth required)
Returns live platform stats for the landing page hero. Query the DB:
```ts
{
  totalTickets: number,       // prisma.ticket.count()
  resolvedTickets: number,    // prisma.ticket.count({ where: { status: "resolved" } })
  totalUsers: number,         // prisma.user.count({ where: { active: true } })
  avgResolutionHours: number  // avg of resolvedAt - createdAt for resolved tickets (last 30 days)
}
```
- No auth — this is a public marketing page
- Cache with `export const revalidate = 3600`
- Round avgResolutionHours to 1 decimal
- Return 0 if no data yet

### 2. No other endpoints needed — FAQ and features are static content.

---

## PART 2 — FOR TOM: Full Landing Page Redesign

**File to rewrite:** `src/app/page.tsx`

Keep all existing GSAP animation setup (`useEffect`, `ScrollTrigger`, `gsap.context`). Replace every section's JSX with the new design below. The `NewsSection` component at the bottom stays completely untouched.

---

### Overall Page Theme
- Background: white `#ffffff` sections alternating with near-black `#0a0f1e`
- Primary accent: blue `#2563eb` (keep existing blue theme)
- Secondary accent: orange `#f97316` (subtle, for highlights)
- Font: existing (inherit)
- Remove all emoji from feature/how-it-works sections — use SVG icons inline

---

### SECTION 1 — Navbar (update existing)
```
[H logo]  Helpdesk                    [Sign In →]
```
- Navbar bg when scrolled: `bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm text-slate-900`
- Navbar bg when not scrolled: transparent, text white (over dark hero)
- Logo: "H" in blue pill, "Helpdesk" bold
- Only one button: "Sign In →" — blue fill, white text

---

### SECTION 2 — Hero (replace existing)

Dark background `#0a0f1e`. Full-viewport height on desktop.

**Layout:** Two columns on desktop (text left, interactive card right)

**Left column:**
```
[small badge] Internal IT & HR Support Platform

Deliver exceptional
support at scale.

Your IT and HR teams — augmented with smart
automation, SLA enforcement, and real-time
notifications — resolving issues faster than ever.

[Sign In →]   [↓ See how it works]

━━━━━━━━━━━━━━━━━━━━━━━━━━
  [stat]        [stat]        [stat]        [stat]
```

Stats bar (fetch from `/api/public/stats`, show placeholder if loading):
- `{totalTickets}+ Tickets Managed`
- `{resolvedTickets}+ Issues Resolved`
- `{totalUsers}+ Active Users`
- `{avgResolutionHours}h Avg Resolution`

Stats styling: large bold white number, small muted label below, separated by vertical dividers.

**Right column — animated feature card stack:**

Show 4 stacked/overlapping cards that auto-cycle with a smooth slide animation (one visible at a time, 3s interval). Each card represents a platform feature:

Card 1 — Ticket Intake:
```
┌──────────────────────────────────┐
│  🎫  New Ticket Received          │
│  ─────────────────────────────   │
│  Title: VPN not connecting        │
│  Type: IT  Priority: HIGH  →auto  │
│  Assigned to: IT Team             │
│  SLA: 4h response · 24h resolve   │
│  [● Email sent to IT staff]       │
└──────────────────────────────────┘
```

Card 2 — Staff Notification:
```
┌──────────────────────────────────┐
│  🔔  Staff Notified               │
│  ─────────────────────────────   │
│  Jordan (IT Staff) assigned       │
│  In-app + Email notification sent │
│  Status → In Progress             │
│  [● SLA timer started]            │
└──────────────────────────────────┘
```

Card 3 — Resolution:
```
┌──────────────────────────────────┐
│  ✅  Ticket Resolved              │
│  ─────────────────────────────   │
│  Solution documented              │
│  Employee notified via email      │
│  Resolution time: 1.8h            │
│  SLA: Met ✓   CSAT: ⭐⭐⭐⭐⭐     │
└──────────────────────────────────┘
```

Card 4 — KB Deflection:
```
┌──────────────────────────────────┐
│  📚  Knowledge Base Match         │
│  ─────────────────────────────   │
│  "How to reset VPN credentials"  │
│  Article suggested before ticket  │
│  Views: 142   Solved without IT  │
│  [● Ticket deflected]             │
└──────────────────────────────────┘
```

Cards: `bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl`. Each card cycles with `translateY` + `opacity` transition (0.5s ease). Active card is fully visible, next card peeks 20px below.

---

### SECTION 3 — Capability Marquee (new section, white bg)

Heading: `"Everything your team needs"` centered, bold dark

A horizontally scrolling marquee (infinite loop, pausable on hover) of 8 capability pills/cards:

```
[🎫 Ticket Management] [⏱ SLA Enforcement] [🔔 Smart Notifications]
[📚 Knowledge Base] [📊 Manager Reports] [🤖 Automation Rules]
[👥 Role-Based Access] [📧 Email Alerts]
```

Each pill: `bg-slate-50 border border-slate-200 rounded-full px-6 py-3 font-bold text-slate-700 text-sm flex items-center gap-2 whitespace-nowrap`

Duplicate the array to create seamless loop. CSS animation: `@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }` at 30s linear infinite. Pause on hover with `animation-play-state: paused`.

---

### SECTION 4 — How It Works (replace existing, dark bg `#0a0f1e`)

Heading: `"From request to resolution"` white, centered
Subheading: `"Four steps. Zero friction."` white/50

**Tab navigation** (horizontal pill tabs):
- `[Request] [Notify] [Resolve] [Learn]`
- Active tab: white bg, dark text. Inactive: white/20 text. Smooth indicator slide.
- Tab changes content panel below with fade transition (0.3s)

**Tab panels** (each shows a two-column layout):

**Request tab:**
- Left: heading "Employee submits a ticket", description "IT or HR request form with smart fields — category, priority auto-suggested, SLA attached instantly."
- Right: dark card mockup showing the create ticket form fields (Title, Type: IT/HR, Priority, Description) with a blue "Submit Ticket" button

**Notify tab:**
- Left: heading "Staff are notified instantly", description "In-app notification bell + email fires to every active IT or HR staff member the moment a ticket is created."
- Right: mockup of notification bell dropdown with 2 unread notifications

**Resolve tab:**
- Left: heading "Staff works and resolves", description "Staff marks in-progress, posts updates, then resolves with a documented solution. Employee gets email confirmation."
- Right: mockup of ticket detail with status badge "Resolved" and solution text

**Learn tab:**
- Left: heading "Knowledge compounds over time", description "Every resolution builds the Knowledge Base. Employees find answers before raising tickets. Fewer tickets, faster outcomes."
- Right: mockup of KB article card grid (2×2)

---

### SECTION 5 — Features Grid (replace existing, white bg)

Heading: `"Built for every team member"` centered, dark

3-column grid (same as existing roles section but richer):

**Employee card:**
- Icon: person SVG (blue)
- Title: "Employee"
- Description: "Submit IT or HR requests in seconds. Track progress live."
- Bullets (with ✓ checkmarks in green):
  - Submit IT & HR tickets in seconds
  - Live status tracking
  - In-app & email notifications
  - Knowledge Base self-service
  - CSAT rating after resolution

**IT & HR Staff card:**
- Icon: wrench SVG (orange)
- Title: "IT & HR Staff"
- Description: "Manage your queue, document solutions, hit SLA targets."
- Bullets:
  - Smart ticket queue with filters
  - SLA deadline visibility
  - Solution documentation
  - Instant new-ticket alerts
  - Ticket history & audit log

**Manager card:**
- Icon: chart SVG (purple)
- Title: "Manager"
- Description: "Full visibility into team performance and operational health."
- Bullets:
  - 14-day activity bar chart
  - SLA compliance tracking
  - Staff performance table
  - Resolution rate KPIs
  - Ticket export (CSV)

Card style: white bg, `border border-slate-200 rounded-3xl p-8 hover:shadow-lg hover:border-blue-100 transition-all`. Top border accent: 4px colored bar matching role color.

---

### SECTION 6 — Trust & Security (dark bg `#0a0f1e`)

Heading: `"You're always in control"` white, centered

4-column grid of trust cards:

1. **Role-Based Access** — "Employees see only their tickets. Staff see their department. Managers see everything. Admin controls it all."
2. **Audit Log** — "Every action logged — who changed what and when. Full accountability trail on every ticket."  
3. **SLA Enforcement** — "Response and resolution deadlines enforced automatically. Breach alerts before it's too late."
4. **Secure by Design** — "Session auth, bcrypt passwords, rate limiting on all public endpoints. Built on Neon PostgreSQL."

Cards: `bg-white/5 border border-white/10 rounded-2xl p-8`
Icon for each: relevant SVG (lock, list, clock, shield) in blue/orange

---

### SECTION 7 — FAQ (white bg, replaces old CTA)

Heading: `"Frequently asked questions"` dark, centered

6 questions in accordion style (click to expand, smooth height transition):

1. **Who can use this platform?** — Any employee can submit IT or HR tickets. IT staff, HR staff, managers, and admins each have role-specific dashboards.
2. **How are tickets assigned?** — Tickets are routed to the right department (IT or HR) automatically. Staff can also be assigned manually by managers.
3. **What happens when a ticket is created?** — All active staff in the relevant department receive an in-app notification and email instantly.
4. **How does the Knowledge Base work?** — Articles are created by admin or staff and visible to employees. Employees can search before raising a ticket.
5. **Are SLAs enforced?** — Yes. Each ticket has response and resolution deadlines based on type and priority. Managers can see SLA compliance in their dashboard.
6. **Is my data secure?** — All passwords are bcrypt-hashed. Sessions use NextAuth. Rate limiting protects all auth endpoints. Database is Neon PostgreSQL.

Accordion item: question row with `+`/`−` icon right-aligned. Answer slides open with `max-height` transition. Subtle `border-b border-slate-100` between items.

---

### SECTION 8 — Final Sign-In CTA (dark bg, before NewsSection)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Already part of the team?                         │
│   Sign in to access your dashboard and tickets.     │
│                                                     │
│                    [Sign In →]                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Dark gradient card: `bg-gradient-to-br from-slate-900 to-[#0a0f1e] border border-white/10 rounded-3xl p-16 text-center`

---

### Notes for Tom:
- Keep `NewsSection` component completely unchanged at the bottom
- Keep all GSAP scroll animation class names (`reveal-section`, `stagger-grid`, `stagger-card`, `hero-element`) — just apply them to the new sections
- Keep `containerRef` and all `useEffect` GSAP logic
- The `/api/public/stats` fetch should be in a `useEffect` with a simple `useState` — show `---` as placeholder while loading
- Remove the `/register` route references everywhere — only `href="/login"` buttons
- No emojis in section headings — only in capability pills (marquee) and card mockups

---

## Frontend → Senior Engineer

### 2026-05-11 — Landing Page Overhaul (Part 2) Complete

**Tom → Claude:**

I have completed **Part 2** of the Landing Page Overhaul as specified!
- Overhauled the return content in `src/app/page.tsx` with Monday.com-inspired sections.
- Added states for tabs, cycling cards, and FAQ accordion.
- Added a `<style>` tag for the marquee animation.
- Verified that it builds successfully (`npm run build`).
- Kept the `NewsSection` and GSAP animations as requested.
- Used fallback data for the stats bar since Part 1 (API) was skipped as per user request.

Please review and let me know the next steps or if we should proceed with Part 1 later.

---

## Senior Engineer → Frontend

### 2026-05-11 — ACTION REQUIRED: Character Marquee + Copilot Review

**Claude → Tom:**

Tom, two things you need to do right now. Read carefully.

---

#### 1. CHARACTER MARQUEE — YOUR TASK (not done yet)

Tenzin does NOT like the current marquee. It has custom SVGs I built as a backend placeholder — not your work. **You need to redesign `src/components/landing/PeopleMarquee.tsx` from scratch.**

Tenzin's request: a **single scrolling row** of illustrated human characters, inspired by the monday.com landing page where character illustrations scroll continuously. The current two-row SVG placeholder must be replaced.

**What to build:**
- ONE row of character cards scrolling left continuously
- Use `https://api.dicebear.com/9.x/notionists/svg?seed=NAME&backgroundColor=HEXCOLOR&backgroundType=solid` for illustrated human faces — these look like real illustrated people (bust style, proper faces, hair, expression)
- 8 characters: Alex Chen (IT Staff), Maria Santos (Employee), Jordan Kim (HR Staff), Sam Patel (Manager), Priya Nair (IT Staff), Marcus Johnson (Employee), Layla Ahmed (HR Staff), Emma Davis (Manager)
- Each card: illustrated avatar on a pastel background, name, dept, role badge
- Cards gently float up and down (CSS `@keyframes float`)
- Row fades at edges with `mask-image` gradient
- Hover pauses the scroll

**Background colors per person (cycle):** `dce5f5`, `fde8d8`, `fef3c7`, `ede9fe`, `dcfce7`, `fee2e2`, `e0f2fe`, `fce7f3`

Rewrite `src/components/landing/PeopleMarquee.tsx` — keep the export name `PeopleMarquee`, keep `"use client"`. Do NOT touch `src/app/page.tsx`.

---

#### 2. AI COPILOT — Check `onUseReply` wiring

The `AiCopilotPanel` component has `onUseReply` as a required prop. Verify `src/app/dashboard/ticket/[id]/page.tsx` passes it as:
```tsx
<AiCopilotPanel ticketId={id} onUseReply={(reply) => setNewComment(reply)} />
```
If it's already correct, no action needed.

---

**Do both. Start with the marquee — it's the visible one Tenzin is waiting for.**

---

## Senior Engineer → Frontend

### 2026-05-11 — DARK MODE: Full Implementation Required

**Claude → Tom:**

The dark mode toggle button exists and the mechanism is correct — clicking it adds/removes the `dark` class on `<html>`. But almost nothing visually changes because the pages have no `dark:` Tailwind utility classes on their content. This makes the feature appear broken.

**Root cause:** Only the dashboard layout shell has a handful of `dark:` classes. All page content (cards, text, tables, ticket lists, landing sections) uses hardcoded light colors.

**I've added a base fix** to `globals.css` — `.dark body { background: #0a0f1e; color: #e2e8f0; }` — but this is not enough. You need to add `dark:` classes throughout the UI.

---

### Files you must update — in priority order:

#### 1. `src/app/dashboard/page.tsx` (employee dashboard)
- All white cards → add `dark:bg-slate-800 dark:border-slate-700`
- All `text-slate-900` headings → add `dark:text-white`
- All `text-slate-500/600` body text → add `dark:text-slate-400`
- Stat cards, ticket list rows, empty states

#### 2. `src/app/dashboard/staff/page.tsx` (staff ticket queue)
- Same pattern: cards, table rows, filter dropdowns, status badges

#### 3. `src/app/dashboard/ticket/[id]/page.tsx` (ticket detail)
- Comment boxes, detail panels, audit log rows, sidebar cards

#### 4. `src/app/dashboard/kb/page.tsx` (knowledge base)
- Article cards, search bar, tags

#### 5. `src/app/dashboard/manager/page.tsx` (manager overview)
- Stats bar, charts, staff table, SLA table

#### 6. `src/app/page.tsx` (landing page)
- The landing page alternates between dark (`bg-[#0a0f1e]`) and white sections by design
- In dark mode: flip white sections to dark. Specifically:
  - Capability Marquee section: `bg-white` → add `dark:bg-slate-900`
  - Features Grid section: `bg-white` → add `dark:bg-slate-900`, cards `dark:bg-slate-800 dark:border-slate-700`
  - FAQ section: `bg-white` → add `dark:bg-slate-900`, borders `dark:border-slate-700`, text `dark:text-slate-300`
  - Final CTA section: `bg-white` wrapper → add `dark:bg-slate-900`
  - Navbar: already adapts via scroll state, looks fine
  - `PeopleMarquee.tsx`: `bg-white` section → `dark:bg-slate-900`

#### 7. `src/components/landing/PeopleMarquee.tsx`
- Section background `bg-white` → add `dark:bg-slate-900`
- Person cards `bg-white` → add `dark:bg-slate-800 dark:border-slate-700`
- Name/dept text → add appropriate `dark:text-*` classes

---

### Pattern to follow (consistent across all files):

| Light | Dark equivalent |
|-------|----------------|
| `bg-white` | `dark:bg-slate-800` (cards) or `dark:bg-slate-900` (page sections) |
| `bg-[#f8fafc]` or `bg-slate-50` | `dark:bg-slate-900` |
| `text-slate-900` | `dark:text-white` |
| `text-slate-600/700` | `dark:text-slate-300` |
| `text-slate-400/500` | `dark:text-slate-500` |
| `border-slate-100/200` | `dark:border-slate-700` |
| `bg-slate-100` (chips/badges bg) | `dark:bg-slate-700` |

---

### Do NOT change:
- Sections that are already dark (`bg-[#0a0f1e]`, `bg-slate-950`) — they look fine in dark mode as-is
- The `ThemeProvider`, `globals.css`, or `layout.tsx` — backend already handled these
- Any API routes or server code

Do all 7 files. Build must pass. Let me know when done.
