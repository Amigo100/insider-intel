# CLAUDE.md - InsiderIntel Development Context

This document provides comprehensive context for AI-assisted development on the InsiderIntel codebase.

---

## 1. Project Overview

### What the App Does

InsiderIntel is a web application that tracks and analyzes SEC insider trading filings (Form 4) and institutional holdings (13F filings). It aggregates data from SEC EDGAR, enriches it with AI-generated context, and presents it in a user-friendly dashboard.

### Target Users

- **Retail investors** wanting to track insider buying/selling activity
- **Financial analysts** researching institutional ownership changes
- **Day traders** looking for trading signals from insider activity
- **Research professionals** needing comprehensive SEC filing data

### Key Features

1. **Insider Trade Tracking** - Real-time Form 4 filing data with filtering by ticker, transaction type, and date range
2. **Institutional Holdings** - 13F filing data showing which institutions hold what stocks
3. **AI-Powered Context** - Claude-generated explanations of why trades might be significant
4. **Watchlist** - Personal watchlist to track specific companies
5. **Email Notifications** - Daily digests, weekly summaries, and instant alerts
6. **Subscription Tiers** - Free, Retail ($9.99/mo), and Pro ($29.99/mo) plans

---

## 2. Tech Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.2 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |

### Backend & Data

| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL database + authentication |
| Supabase SSR | Server-side auth with cookies |

### External Services

| Service | Purpose | Env Variable |
|---------|---------|--------------|
| Anthropic Claude | AI context generation | `ANTHROPIC_API_KEY` |
| Stripe | Payment processing | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Resend | Transactional email | `RESEND_API_KEY` |
| OpenFIGI | CUSIP to ticker mapping | `OPENFIGI_API_KEY` (optional) |
| Sentry | Error tracking & APM | `NEXT_PUBLIC_SENTRY_DSN` |

### Key Libraries

| Library | Purpose |
|---------|---------|
| `@radix-ui/*` | Accessible UI primitives (dropdown, tabs, etc.) |
| `lucide-react` | Icon library |
| `recharts` | Data visualization charts |
| `date-fns` | Date formatting |
| `zod` | Schema validation |
| `pino` | Structured logging |
| `class-variance-authority` | Component variant styling |

### Hosting Setup

- **Platform**: Vercel
- **Cron Jobs**: Vercel Cron (defined in `vercel.json`)
  - `/api/cron/generate-context` - Every 6 hours (AI context generation)
  - `/api/cron/send-daily-digest` - Daily at 1 PM UTC
  - `/api/cron/send-weekly-summary` - Mondays at 2 PM UTC

---

## 3. File Structure

### Route Map

```
src/app/
├── (auth)/                    # Auth route group (no layout nesting)
│   ├── login/page.tsx         # /login - Email + Google OAuth
│   ├── signup/page.tsx        # /signup - Registration
│   ├── forgot-password/page.tsx # /forgot-password
│   └── reset-password/page.tsx  # /reset-password
│
├── (dashboard)/               # Dashboard route group (shared layout)
│   ├── layout.tsx             # Dashboard shell wrapper
│   ├── dashboard/page.tsx     # /dashboard - Main overview
│   ├── insider-trades/page.tsx # /dashboard/insider-trades
│   ├── institutions/page.tsx  # /dashboard/institutions
│   ├── watchlist/page.tsx     # /dashboard/watchlist
│   ├── company/[ticker]/page.tsx # /dashboard/company/AAPL
│   └── settings/
│       ├── page.tsx           # /dashboard/settings
│       ├── layout.tsx         # Settings sub-navigation
│       ├── profile/page.tsx   # /dashboard/settings/profile
│       ├── billing/page.tsx   # /dashboard/settings/billing
│       └── notifications/page.tsx # /dashboard/settings/notifications
│
├── auth/
│   └── callback/route.ts      # OAuth callback handler
│
├── api/
│   ├── insider/
│   │   ├── recent/route.ts    # GET /api/insider/recent
│   │   ├── clusters/route.ts  # GET /api/insider/clusters
│   │   └── company/[ticker]/route.ts # GET /api/insider/company/:ticker
│   │
│   ├── institutional/
│   │   ├── new-positions/route.ts # GET /api/institutional/new-positions
│   │   ├── holders/[ticker]/route.ts # GET /api/institutional/holders/:ticker
│   │   ├── activity/[ticker]/route.ts # GET /api/institutional/activity/:ticker
│   │   └── institution/[cik]/route.ts # GET /api/institutional/institution/:cik
│   │
│   ├── search/route.ts        # GET /api/search?q=
│   ├── watchlist/route.ts     # GET/POST/DELETE /api/watchlist
│   │
│   ├── stripe/
│   │   ├── checkout/route.ts  # POST - Create checkout session
│   │   ├── portal/route.ts    # POST - Customer portal redirect
│   │   └── webhook/route.ts   # POST - Stripe webhooks
│   │
│   ├── notifications/
│   │   └── instant-alert/route.ts # POST - Trigger instant alert
│   │
│   └── cron/
│       ├── generate-context/route.ts # AI context generation
│       ├── send-daily-digest/route.ts # Daily email digest
│       └── send-weekly-summary/route.ts # Weekly summary
│
├── page.tsx                   # / - Landing page (redirects to /dashboard)
├── error.tsx                  # Global error boundary
├── not-found.tsx              # 404 page
└── global-error.tsx           # Root error boundary (Sentry)
```

### Key Components

```
src/components/
├── ui/                        # Radix-based primitives (shadcn/ui style)
│   ├── button.tsx             # Button with variants
│   ├── card.tsx               # Card container
│   ├── input.tsx              # Form input
│   ├── select.tsx             # Dropdown select
│   ├── table.tsx              # Data table
│   ├── tabs.tsx               # Tab navigation
│   ├── badge.tsx              # Status badges
│   ├── skeleton.tsx           # Loading skeletons
│   ├── avatar.tsx             # User avatar
│   ├── dropdown-menu.tsx      # Dropdown menus
│   ├── switch.tsx             # Toggle switch
│   ├── label.tsx              # Form labels
│   └── checkbox.tsx           # Checkbox input
│
├── dashboard/
│   ├── sidebar.tsx            # Main navigation sidebar
│   ├── header.tsx             # Page headers
│   ├── dashboard-shell.tsx    # Layout wrapper with sidebar state
│   ├── user-menu.tsx          # User dropdown (avatar + logout)
│   ├── stat-card.tsx          # Statistics display cards
│   ├── transaction-card.tsx   # Individual transaction display
│   ├── transaction-table.tsx  # Transaction list table
│   ├── transaction-filters.tsx # Filter controls
│   ├── significance-badge.tsx # AI significance indicator
│   ├── cluster-alert.tsx      # Cluster trading alerts
│   ├── company-tabs.tsx       # Company detail tabs
│   └── institutions-tabs.tsx  # Institutional data tabs
│
└── charts/
    ├── trend-sparkline.tsx    # Inline trend charts
    ├── insider-activity-chart.tsx # Activity over time
    └── holdings-pie-chart.tsx # Holdings distribution
```

### Library Modules

```
lib/
├── supabase/
│   ├── client.ts              # Browser Supabase client
│   ├── server.ts              # Server Supabase client
│   └── middleware.ts          # Middleware helper
│
├── db/
│   ├── insider-transactions.ts # Transaction CRUD operations
│   └── institutional-holdings.ts # Holdings CRUD operations
│
├── ai/
│   └── claude-client.ts       # Anthropic API wrapper
│
├── edgar/
│   ├── client.ts              # SEC EDGAR API client
│   └── 13f-client.ts          # 13F filing parser
│
├── email/
│   ├── resend-client.ts       # Resend client
│   ├── send-email.ts          # Email sending functions
│   └── templates/
│       ├── index.ts           # Template exports
│       ├── daily-digest.ts    # Daily digest HTML/text
│       ├── instant-alert.ts   # Alert HTML/text
│       └── weekly-summary.ts  # Weekly summary HTML/text
│
├── openfigi/
│   └── client.ts              # CUSIP lookup with caching
│
├── auth/
│   └── cron.ts                # Cron job authentication
│
├── logger.ts                  # Pino structured logging
└── sentry.ts                  # Sentry initialization
```

---

## 4. Current UI/UX Patterns

### Color Scheme (HSL values from globals.css)

#### Light Mode
| Token | HSL | Description |
|-------|-----|-------------|
| `--background` | 0 0% 100% | White background |
| `--foreground` | 222.2 84% 4.9% | Near-black text |
| `--primary` | 222.2 47.4% 11.2% | Dark blue |
| `--secondary` | 210 40% 96.1% | Light gray |
| `--muted` | 210 40% 96.1% | Muted backgrounds |
| `--accent` | 210 40% 96.1% | Accent color |
| `--destructive` | 0 84.2% 60.2% | Red for errors |
| `--border` | 214.3 31.8% 91.4% | Light gray borders |

#### Dark Mode
| Token | HSL | Description |
|-------|-----|-------------|
| `--background` | 222.2 84% 4.9% | Near-black |
| `--foreground` | 210 40% 98% | Near-white text |
| `--primary` | 210 40% 98% | Light primary |
| `--secondary` | 217.2 32.6% 17.5% | Dark gray |

#### Sidebar (Always Dark)
| Token | HSL |
|-------|-----|
| `--sidebar-background` | 222.2 84% 4.9% |
| `--sidebar-foreground` | 210 40% 98% |
| `--sidebar-accent` | 217.2 32.6% 17.5% |

### Typography

- **Font Family**: Geist Sans (`--font-geist-sans`) with system-ui fallback
- **Monospace**: Geist Mono (`--font-geist-mono`)
- **Border Radius**: 0.5rem base (`--radius`)

### Component Library

Uses **shadcn/ui patterns** built on Radix UI primitives:
- Components are in `src/components/ui/`
- Styled with Tailwind + `class-variance-authority` for variants
- `cn()` utility for conditional class merging (clsx + tailwind-merge)

### Layout Patterns

1. **Dashboard Layout**: Fixed sidebar (64px width) + main content area
   - Sidebar collapses to overlay on mobile (<1024px)
   - Main content has `lg:ml-64` offset

2. **Settings Layout**: Nested tabs with vertical navigation on left

3. **Cards**: Used extensively for data display
   - `Card`, `CardHeader`, `CardTitle`, `CardContent` components

4. **Tables**: For transaction lists with sortable columns

5. **Loading States**: Skeleton components for async data

---

## 5. Data Flow

### Database Schema (Key Tables)

```
companies
├── id (uuid, PK)
├── ticker (text, unique)
├── name (text)
├── cik (text)
├── sector (text)
├── industry (text)
└── market_cap (bigint)

insiders
├── id (uuid, PK)
├── cik (text)
└── name (text)

insider_transactions
├── id (uuid, PK)
├── company_id (uuid, FK)
├── insider_id (uuid, FK)
├── accession_number (text, unique)
├── filed_at (timestamp)
├── transaction_date (date)
├── transaction_type (text) -- P, S, A, D, G, M
├── shares (bigint)
├── price_per_share (numeric)
├── total_value (numeric)
├── insider_title (text)
├── is_director (boolean)
├── is_officer (boolean)
├── ai_context (text)
├── ai_significance_score (numeric)
└── ai_generated_at (timestamp)

institutions
├── id (uuid, PK)
├── cik (text)
├── name (text)
└── institution_type (text)

institutional_holdings
├── id (uuid, PK)
├── filing_id (uuid)
├── institution_id (uuid, FK)
├── company_id (uuid, FK)
├── report_date (date)
├── shares (bigint)
├── value (bigint)
├── shares_change (bigint)
├── is_new_position (boolean)
└── is_closed_position (boolean)

profiles
├── id (uuid, PK) -- matches auth.users.id
├── email (text)
├── full_name (text)
├── subscription_tier (text) -- free, retail, pro
├── stripe_customer_id (text)
├── notification_daily_digest (boolean)
├── notification_instant_alerts (boolean)
└── notification_weekly_summary (boolean)

watchlist
├── id (uuid, PK)
├── user_id (uuid, FK)
└── company_id (uuid, FK)
```

### Database Views

- `v_recent_insider_transactions` - Joins transactions with company and insider names

### Data Flow: DB → API → Frontend

```
1. SEC EDGAR → lib/edgar/client.ts → lib/db/insider-transactions.ts → Supabase
                                                                        ↓
2. Supabase → src/app/api/insider/recent/route.ts → JSON Response
                                                        ↓
3. JSON → src/app/(dashboard)/insider-trades/page.tsx → React Components
```

### Authentication Flow

```
1. User visits /login
   ├── Email/Password → Supabase Auth → Session Cookie
   └── Google OAuth → /auth/callback → Session Cookie

2. Middleware (middleware.ts) runs on every request:
   ├── Checks session via supabase.auth.getUser()
   ├── Public routes (/, /login, /signup) → Allow
   ├── Auth routes + logged in → Redirect to /dashboard
   └── Dashboard routes + not logged in → Redirect to /login?redirectTo=...

3. Dashboard layout checks auth again server-side
   └── Fetches user profile for name/avatar

4. Logout: signOut() clears session cookies
```

### Key User Journeys

1. **View Recent Trades**
   ```
   /dashboard → API: /api/insider/recent → Display in TransactionTable
   ```

2. **Add to Watchlist**
   ```
   Click star icon → POST /api/watchlist → Optimistic UI update
   ```

3. **Upgrade Subscription**
   ```
   /dashboard/settings/billing → POST /api/stripe/checkout → Stripe Checkout
   → Webhook updates profiles.subscription_tier
   ```

4. **Company Deep Dive**
   ```
   Click ticker → /dashboard/company/AAPL → Parallel API calls:
   ├── /api/insider/company/AAPL
   └── /api/institutional/holders/AAPL
   ```

---

## 6. Known Issues / TODO

### Remaining Tasks (from TODO.md)

| Task | Priority | Status |
|------|----------|--------|
| Subscription tier enforcement | HIGH | Not implemented |
| Rate limiting on API routes | MEDIUM | Not implemented |
| Health check endpoint | MEDIUM | Not implemented |
| API key authentication for external access | LOW | Not implemented |

### Incomplete Features

1. **Subscription Tier Enforcement**
   - Currently all features accessible regardless of tier
   - Need to restrict instant alerts to Retail+, advanced features to Pro

2. **Post-Login Redirect**
   - `redirectTo` param is set in middleware
   - Login form now reads it (recently fixed)
   - OAuth callback now supports it (recently fixed)

### Performance Concerns

1. **No rate limiting** - API routes could be abused
2. **Bulk transaction inserts** - Currently one-by-one (see `bulkInsertTransactions`)
3. **No pagination** - Large result sets limited by `limit` param only

### Known Technical Debt

1. **Console logging** - Mostly migrated to Pino, some edge cases may remain
2. **Error handling** - Some API routes return generic 500 errors
3. **Type safety** - Some `as` type assertions in database code

---

## 7. Design Decisions

### Why Supabase?

- **PostgreSQL** - Reliable, full-featured relational DB
- **Built-in Auth** - Email, OAuth, magic links out of the box
- **Row Level Security** - Database-level access control
- **Real-time** - Future capability for live updates
- **Trade-off**: Vendor lock-in, limited to PostgreSQL features

### Why Next.js App Router?

- **Server Components** - Reduce client JS bundle
- **Route Groups** - Clean separation of auth vs dashboard layouts
- **Server Actions** - Future use for form submissions
- **Trade-off**: Newer, some patterns still evolving

### Why Radix UI / shadcn Patterns?

- **Accessibility** - ARIA compliant out of the box
- **Unstyled** - Full control over appearance
- **Copy-paste** - Own the code, no npm dependency for components
- **Trade-off**: More initial setup than pre-built libraries

### Why Pino for Logging?

- **Performance** - Fastest Node.js logger
- **Structured** - JSON output for log aggregation
- **Module loggers** - Easy to filter by source
- **Trade-off**: JSON logs harder to read in development (use pino-pretty)

### Why Claude for AI Context?

- **Quality** - Strong reasoning for financial context
- **API simplicity** - Straightforward completion API
- **Trade-off**: Cost per API call, rate limits

### Why Vercel Cron vs External Scheduler?

- **Simplicity** - Defined in vercel.json
- **No extra service** - Part of Vercel deployment
- **Trade-off**: Limited to hourly granularity, no complex scheduling

### Data Architecture Decisions

1. **Separate insider vs institutional data** - Different SEC filings, different update frequencies
2. **AI context stored on transaction** - Avoid re-generating, searchable
3. **Denormalized views** - `v_recent_insider_transactions` for query performance
4. **Watchlist per user** - Simple join table, no complex permissions

### Security Decisions

1. **Cron routes use Bearer token** - `CRON_SECRET` required in production
2. **Stripe webhooks bypass auth** - Verified via webhook signature
3. **RLS on profiles/watchlist** - Users can only access own data
4. **No API keys for frontend** - All API routes are session-authenticated

---

## 8. Environment Variables Reference

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_RETAIL_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
RESEND_API_KEY=re_...
CRON_SECRET=<random-string>

# Optional
OPENFIGI_API_KEY=<api-key>
EMAIL_FROM=InsiderIntel <notifications@insiderintel.com>
LOG_LEVEL=info
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=insider-intel
NEXT_PUBLIC_APP_URL=https://insiderintel.com
```

---

## 9. Common Development Tasks

### Adding a New API Route

1. Create `src/app/api/[name]/route.ts`
2. Import `logger` from `@/lib/logger`
3. Use `try/catch` with `log.error()` for errors
4. Return `NextResponse.json()` with appropriate status
5. Add cache headers if data is cacheable

### Adding a New Dashboard Page

1. Create `src/app/(dashboard)/[name]/page.tsx`
2. Page is automatically protected by middleware
3. Use server component for initial data fetch
4. Create client components for interactivity

### Modifying the Database

1. Update schema in Supabase dashboard
2. Regenerate types: copy from Supabase → `types/supabase.ts`
3. Update `types/database.ts` with new types
4. Update relevant `lib/db/*.ts` functions

### Adding Email Templates

1. Create template in `lib/email/templates/[name].ts`
2. Export `html` and `text` versions
3. Add send function to `lib/email/send-email.ts`
4. Create trigger route if needed

---

*Last updated: January 2026*
