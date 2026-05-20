# Internal Helpdesk

An internal ticket management system for IT, HR, and Software support. Built with Next.js 16 App Router, Prisma, NextAuth, and PostgreSQL. Deployed on Vercel.

---

## Quick start

### Prerequisites

- Node.js 20+
- A PostgreSQL database (Supabase, Neon, or local)
- An Upstash Redis database (optional — enables distributed rate limiting)

### 1. Clone and install

```bash
git clone https://github.com/Karma-Staff/Help_Desk.git
cd Help_Desk
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in every variable. See [Environment variables](#environment-variables) below for what each one does.

### 3. Set up the database

```bash
# Run all pending migrations and generate the Prisma client
npx prisma migrate dev

# Optional: seed the database with sample SLA policies and KB articles
npm run seed
npm run seed-kb
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first account you register becomes an employee. Promote it to `admin` directly in the database or via Prisma Studio (`npx prisma studio`) to access the admin panel.

---

## Environment variables

All variables are documented in [`.env.example`](.env.example).

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Pooled Postgres connection string (used at runtime) |
| `DIRECT_URL` | Yes | Direct Postgres connection (used for migrations) |
| `NEXTAUTH_SECRET` | Yes | Random 32+ char secret for JWT signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Full public URL of the app (e.g. `https://helpdesk.example.com`) |
| `BREVO_API_KEY` | Yes | Brevo transactional email API key |
| `SMTP_HOST` | Yes | SMTP relay host (default: `smtp-relay.brevo.com`) |
| `SMTP_PORT` | Yes | SMTP port (default: `587`) |
| `SMTP_USER` | Yes | SMTP username |
| `SMTP_PASS` | Yes | SMTP password |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID — enables SSO sign-in |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `OPENAI_API_KEY` | Yes | OpenAI key for the KB chat assistant |
| `CRON_SECRET` | Yes | Shared secret for securing cron endpoints |
| `ADMIN_PASSKEY` | Yes | Passkey for the `/admin` portal |
| `UPSTASH_REDIS_REST_URL` | No | Upstash REST URL — enables distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash REST token |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm test` | Run the unit test suite (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed SLA policies and default users |
| `npm run seed-kb` | Seed the knowledge base with sample articles |
| `npm run bug-finder` | Run the LLM-powered bug scanner (requires OpenAI key) |
| `npm run ux-test` | Run the LLM-powered UX test suite |

---

## Architecture

```
src/
├── app/
│   ├── api/          # Route handlers (HTTP layer only — call lib/services)
│   │   ├── auth/     # Register, login, password reset
│   │   ├── tickets/  # CRUD + comments, attachments, resolve, escalate
│   │   ├── kb/       # Knowledge base articles
│   │   ├── ai/       # Chat assistant
│   │   └── cron/     # SLA checker, KB refresh (called by Vercel Cron)
│   └── dashboard/    # Next.js pages (App Router)
├── lib/
│   ├── ticketService.ts   # Business logic for ticket creation and listing
│   ├── ticketAccess.ts    # All authorization logic (canAccessTicket, ticketWhereForRole)
│   ├── schemas.ts         # Zod validation schemas — single source of truth for inputs
│   ├── prismaIncludes.ts  # Shared Prisma include/select objects
│   ├── audit.ts           # Audit log writer
│   ├── notify.ts          # In-app notification sender
│   ├── email.ts           # Nodemailer/Brevo email templates
│   ├── sla.ts             # SLA policy attachment and tracking
│   ├── rateLimit.ts       # Distributed rate limiter (Upstash Redis with in-memory fallback)
│   └── automationEngine.ts # Automation rule evaluator
├── middleware.ts      # Auth gating, role-based route access, per-request CSP nonce
└── __tests__/         # Vitest unit tests
```

### Roles

| Role | Access |
|---|---|
| `employee` | Create tickets, view own tickets, read KB, submit feedback |
| `it_staff` | View and manage IT tickets, internal comments |
| `hr_staff` | View and manage HR tickets, internal comments |
| `ai_staff` | View and manage Software tickets, internal comments |
| `manager` | View all tickets, access manager dashboard |
| `admin` | Full access including user management, automation rules, admin portal |

### Ticket types

| Type | Handled by |
|---|---|
| `IT` | `it_staff` |
| `HR` | `hr_staff` |
| `Software` | `ai_staff` |

---

## Database migrations

After pulling changes that modify `prisma/schema.prisma`, run:

```bash
npx prisma migrate dev
```

To apply all pending migrations in production:

```bash
npx prisma migrate deploy
```

---

## CI

GitHub Actions runs lint and tests on every push and pull request to `main`. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## Docs

Additional documentation lives in [`/docs`](docs/):

| File | Contents |
|---|---|
| [`FRONTEND_SPEC.md`](docs/FRONTEND_SPEC.md) | API endpoint shapes for frontend integration |
| [`BUGS.md`](docs/BUGS.md) | LLM-generated bug scan report |
| [`UX_REPORT.md`](docs/UX_REPORT.md) | UX test results |
| [`UX_DESIGN_REPORT.md`](docs/UX_DESIGN_REPORT.md) | UX design review |
| [`COMMS.md`](docs/COMMS.md) | AI agent team communication log |
