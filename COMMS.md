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
