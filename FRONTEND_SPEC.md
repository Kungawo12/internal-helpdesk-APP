# Frontend Specification — Internal Helpdesk

> **Maintained by:** Claude (Backend/Database Engineer)
> **For:** Gemini (Frontend/UX Designer)
> **Last updated:** 2026-05-02

---

## Golden Rules

1. **Never remove fields from component types** — the backend returns them and features depend on them
2. **Every `.tsx` file must end with exactly one `);` and one `}`** — no duplicates
3. **Use static Tailwind classes only** — dynamic classes like `bg-${color}-500` get purged at build time
4. **All CSS custom classes must be defined in `globals.css`** before being used in components
5. **Don't rename API endpoints or change fetch URLs** — coordinate with backend first

---

## API Endpoints & Response Shapes

### `POST /api/auth/register`
**Request:**
```json
{ "name": "string", "email": "string", "password": "string", "role": "string" }
```
**Response:** `201` `{ "message": "string", "userId": "string" }`

### `POST /api/auth/[...nextauth]`
Handled by NextAuth. Use `signIn("credentials", { email, password, redirect: false })`.

### `GET /api/tickets`
Returns tickets based on user role. **Full response shape:**
```typescript
type Ticket = {
  id: string;
  title: string;
  description: string;       // DO NOT REMOVE — used in detail views
  type: string;               // "IT" | "HR" — used for filtering
  status: string;             // "open" | "in_progress" | "resolved" | "closed"
  priority: string;           // "low" | "medium" | "high" | "urgent"
  solution: string | null;    // DO NOT REMOVE — shown when ticket is resolved
  createdAt: string;
  updatedAt: string;
  creator?: {                 // included for manager/staff views
    name: string;
    email: string;
  };
  assignee?: {                // who resolved it
    name: string;
    email: string;
  } | null;
  feedback?: {                // DO NOT REMOVE — feedback system depends on this
    id: string;
    rating: number;           // 1-5
    comment: string | null;
  } | null;
};
```

### `GET /api/tickets/[id]`
Returns a single ticket with full details. Access controlled by role.
**Response:** Same shape as tickets from `GET /api/tickets`, always includes `creator`, `assignee`, and `feedback`.

### `POST /api/tickets`
**Request:**
```json
{ "title": "string", "description": "string", "type": "IT|HR", "priority": "low|medium|high|urgent" }
```
**Response:** `201` — the created ticket object

### `PATCH /api/tickets/[id]/resolve`
**Request:**
```json
{ "solution": "string", "status": "in_progress|resolved" }
```
**Response:** updated ticket object

### `POST /api/tickets/[id]/feedback`
**Request:**
```json
{ "rating": 1-5, "comment": "string|null" }
```
**Response:** `201` — the created feedback object

---

## User Session Shape

Available via `useSession()` from `next-auth/react`:

```typescript
session.user = {
  id: string;
  name: string;
  email: string;
  role: "employee" | "manager" | "it_staff" | "hr_staff";
};
```

---

## Page Requirements (Minimum Functionality)

### `/login`
- Email + password form
- Calls `signIn("credentials", { email, password, redirect: false })`
- On success: `router.push("/dashboard")`
- Link to `/register`

### `/register`
- Name, email, password, department dropdown
- Department → role mapping:
  - "IT Department" → `it_staff`
  - "HR Department" → `hr_staff`
  - "Management" → `manager`
  - Everything else → `employee`
- `POST /api/auth/register`
- On success: redirect to `/login`

### `/dashboard` (Employee view)
**Must include:**
- List of user's tickets with: title, description, type, status, priority, solution, feedback
- Feedback form for resolved tickets (star rating 1-5 + optional comment)
- Link/button to create new ticket

### `/dashboard/create`
**Must include:**
- Ticket type selector (IT / HR) — both must be clickable buttons
- Title input
- Description textarea
- Priority selector (low / medium / high / urgent) — all must be clickable
- Submit button → `POST /api/tickets`
- Cancel link → back to `/dashboard`

### `/dashboard/ticket/[id]` (Ticket Detail)
**Must include:**
- Fetch ticket via `GET /api/tickets/[id]`
- Full ticket info: title, description, type, status, priority, dates
- Creator name/email, assignee name if assigned
- Solution display if resolved
- Feedback display if given
- Feedback form if employee viewing their own resolved ticket without feedback
- Staff action buttons (Start Working / Resolve) if applicable
- Back link to `/dashboard`

### `/dashboard/manager`
**Must include:**
- Stats summary (total, open, in_progress, resolved, IT count, HR count)
- Status + type filter dropdowns
- Ticket table with: title, creator name, type, status, priority, date

### `/dashboard/staff`
**Must include:**
- Split view: open/in_progress tickets vs resolved tickets
- Each open ticket shows: title, description, creator name/email, priority, status, date
- "Start Working" button (changes status to `in_progress`)
- "Resolve" button → opens solution textarea → `PATCH /api/tickets/[id]/resolve`
- Resolved tickets show feedback rating if available

### `/dashboard/layout.tsx`
- Navigation bar with role-based menu items
- Sign out button → `signOut({ callbackUrl: "/" })`
- User name and role display

---

## Database Schema (Reference Only)

```
User: id, name, email, password, role, createdAt, updatedAt
Ticket: id, title, description, type, status, priority, solution, createdAt, updatedAt, creatorId, assigneeId
Feedback: id, rating, comment, createdAt, ticketId, userId
```

---

## Current Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | GSAP |
| Auth | NextAuth (credentials, JWT) |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 5 |
| Deployment | Vercel |

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts    ← DO NOT MODIFY
│   │   ├── auth/register/route.ts         ← DO NOT MODIFY
│   │   ├── tickets/route.ts               ← DO NOT MODIFY
│   │   ├── tickets/[id]/resolve/route.ts  ← DO NOT MODIFY
│   │   └── tickets/[id]/feedback/route.ts ← DO NOT MODIFY
│   ├── dashboard/
│   │   ├── layout.tsx        ← design freely, keep nav items + signOut
│   │   ├── page.tsx          ← design freely, keep Ticket type + feedback form
│   │   ├── create/page.tsx   ← design freely, keep form fields + submit logic
│   │   ├── ticket/[id]/page.tsx ← design freely, keep data fetching + feedback form
│   │   ├── manager/page.tsx  ← design freely, keep stats + filters + table
│   │   └── staff/page.tsx    ← design freely, keep resolve flow + status buttons
│   ├── login/page.tsx        ← design freely, keep signIn logic
│   ├── register/page.tsx     ← design freely, keep department→role mapping
│   ├── globals.css           ← define all custom CSS classes here
│   ├── layout.tsx            ← DO NOT MODIFY (SessionProvider wrapper)
│   └── page.tsx              ← landing page, design freely
├── components/
│   ├── landing/              ← design freely
│   └── providers/            ← DO NOT MODIFY
├── lib/
│   ├── auth.ts               ← DO NOT MODIFY
│   ├── email.ts              ← DO NOT MODIFY
│   └── prisma.ts             ← DO NOT MODIFY
├── middleware.ts              ← DO NOT MODIFY
└── types/                     ← DO NOT MODIFY
```

**"Design freely"** = change styling, layout, animations, copy — but preserve the functional logic (API calls, state management, form submissions).

**"DO NOT MODIFY"** = backend/infrastructure files. Request changes through the backend engineer.

---

## Changelog

| Date | Change | By |
|------|--------|----|
| 2026-05-02 | Initial spec created | Claude (Backend) |
| 2026-05-02 | Added GET /api/tickets/[id], ticket detail page, validation rules | Claude (Backend) |
