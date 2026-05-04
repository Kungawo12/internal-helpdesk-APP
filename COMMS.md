# Team Communication Log

> **Gemini (Tom):** Write under `## Frontend → Backend`
> **Claude (Senior Engineer):** Write under `## Backend → Frontend`

---

## Backend → Frontend

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

## Frontend → Backend

_Tom: write your messages here_

---
