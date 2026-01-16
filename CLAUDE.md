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
4. **Cluster Detection** - Identifies when multiple insiders buy/sell the same stock within a time window
5. **Watchlist** - Personal watchlist to track specific companies with activity alerts
6. **Email Notifications** - Daily digests, weekly summaries, and instant alerts for watched stocks
7. **Subscription Tiers** - Free, Retail ($29/mo), and Pro ($79/mo) plans with Stripe integration

---

## 2. Tech Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.2 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling with HSL color variables |

### Backend & Data

| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL database + authentication + RLS |
| Supabase SSR | Server-side auth with cookies (`@supabase/ssr`) |

### External Services

| Service | Purpose | Env Variable |
|---------|---------|--------------|
| Anthropic Claude | AI context generation | `ANTHROPIC_API_KEY` |
| Stripe | Payment processing | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Resend | Transactional email | `RESEND_API_KEY` |
| OpenFIGI | CUSIP to ticker mapping | `OPENFIGI_API_KEY` (optional) |
| Sentry | Error tracking & APM | `NEXT_PUBLIC_SENTRY_DSN` |

### Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `@anthropic-ai/sdk` | ^0.71.2 | Anthropic Claude API client |
| `@radix-ui/*` | Various | Accessible UI primitives (dropdown, tabs, switch, etc.) |
| `@sentry/nextjs` | ^8.47.0 | Error tracking and performance monitoring |
| `lucide-react` | ^0.562.0 | Icon library |
| `recharts` | ^3.6.0 | Data visualization charts |
| `date-fns` | ^4.1.0 | Date formatting and manipulation |
| `zod` | ^4.3.5 | Schema validation |
| `pino` | ^9.14.0 | Structured logging |
| `stripe` | ^17.5.0 | Stripe SDK for payments |
| `resend` | ^4.1.2 | Email service client |
| `class-variance-authority` | ^0.7.1 | Component variant styling |
| `clsx` + `tailwind-merge` | - | Conditional class merging |

### Hosting Setup

- **Platform**: Vercel
- **Cron Jobs**: Vercel Cron (defined in `vercel.json`)
  - `/api/cron/generate-context` - Every 6 hours (`0 */6 * * *`) - AI context generation
  - `/api/cron/send-daily-digest` - Daily at 1 PM UTC (`0 13 * * *`)
  - `/api/cron/send-weekly-summary` - Mondays at 2 PM UTC (`0 14 * * 1`)

---

## 3. File Structure

### Route Map

```
src/app/
├── (auth)/                    # Auth route group (shared layout)
│   ├── layout.tsx             # Auth pages layout
│   ├── login/
│   │   ├── page.tsx           # /login
│   │   └── login-form.tsx     # Client component
│   ├── signup/
│   │   ├── page.tsx           # /signup
│   │   └── signup-form.tsx
│   ├── forgot-password/
│   │   ├── page.tsx           # /forgot-password
│   │   └── forgot-password-form.tsx
│   └── reset-password/
│       ├── page.tsx           # /reset-password
│       └── reset-password-form.tsx
│
├── (dashboard)/               # Dashboard route group (protected, shared layout)
│   ├── layout.tsx             # Dashboard shell with sidebar
│   ├── loading.tsx            # Dashboard loading skeleton
│   ├── error.tsx              # Dashboard error boundary
│   ├── dashboard/
│   │   ├── page.tsx           # /dashboard - Main overview
│   │   └── loading.tsx
│   ├── insider-trades/
│   │   ├── page.tsx           # /insider-trades - Transaction list
│   │   └── loading.tsx
│   ├── institutions/
│   │   ├── page.tsx           # /institutions - Institutional holdings
│   │   └── loading.tsx
│   ├── watchlist/
│   │   ├── page.tsx           # /watchlist - User's watched stocks
│   │   ├── watchlist-client.tsx
│   │   └── loading.tsx
│   ├── company/[ticker]/
│   │   ├── page.tsx           # /company/:ticker - Company details
│   │   ├── watchlist-button.tsx
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   └── settings/
│       ├── layout.tsx         # Settings sub-navigation
│       ├── page.tsx           # /settings (redirects to profile)
│       ├── loading.tsx
│       ├── profile/
│       │   ├── page.tsx       # /settings/profile
│       │   └── profile-form.tsx
│       ├── billing/
│       │   ├── page.tsx       # /settings/billing
│       │   └── billing-content.tsx
│       └── notifications/
│           ├── page.tsx       # /settings/notifications
│           └── notifications-form.tsx
│
├── (marketing)/               # Marketing route group (public)
│   ├── layout.tsx             # Marketing layout (no sidebar)
│   ├── about/page.tsx         # /about
│   ├── contact/page.tsx       # /contact
│   ├── terms/page.tsx         # /terms
│   ├── privacy/page.tsx       # /privacy
│   └── disclaimer/page.tsx    # /disclaimer
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
│   │   ├── new-positions/route.ts     # GET /api/institutional/new-positions
│   │   ├── holders/[ticker]/route.ts  # GET /api/institutional/holders/:ticker
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
│       ├── generate-context/route.ts    # AI context generation
│       ├── send-daily-digest/route.ts   # Daily email digest
│       └── send-weekly-summary/route.ts # Weekly summary
│
├── page.tsx                   # / - Landing page
├── layout.tsx                 # Root layout
├── error.tsx                  # Global error boundary
├── not-found.tsx              # 404 page
├── global-error.tsx           # Root error boundary (Sentry)
└── globals.css                # Global styles and CSS variables
```

### Components

```
src/components/
├── ui/                        # Radix-based primitives (shadcn/ui style)
│   ├── button.tsx             # Button with variants (default, outline, ghost, etc.)
│   ├── card.tsx               # Card, CardHeader, CardTitle, CardContent
│   ├── input.tsx              # Form input
│   ├── select.tsx             # Dropdown select
│   ├── table.tsx              # Data table components
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
│   ├── header.tsx             # Page headers with breadcrumbs
│   ├── dashboard-shell.tsx    # Layout wrapper with sidebar state
│   ├── user-menu.tsx          # User dropdown (avatar + logout)
│   ├── stat-card.tsx          # Statistics display cards with icons
│   ├── transaction-card.tsx   # Individual transaction display (+ Compact variant)
│   ├── transaction-table.tsx  # Transaction list table
│   ├── transaction-filters.tsx # Filter controls (type, date range)
│   ├── significance-badge.tsx # AI significance indicator (high/medium/low)
│   ├── cluster-alert.tsx      # Cluster trading alert cards
│   ├── company-tabs.tsx       # Company detail tabs (Overview, Insiders, etc.)
│   └── institutions-tabs.tsx  # Institutional data tabs
│
├── landing/
│   ├── dashboard-preview.tsx  # Hero section mock dashboard
│   ├── feature-cards.tsx      # Feature highlight cards
│   ├── pricing-section.tsx    # Pricing tier comparison
│   ├── faq-section.tsx        # FAQ accordion
│   ├── testimonials.tsx       # User testimonials
│   ├── live-activity-feed.tsx # Animated activity feed
│   └── trust-badges.tsx       # Trust indicators
│
├── charts/
│   ├── trend-sparkline.tsx    # Inline trend charts
│   ├── insider-activity-chart.tsx # Activity over time (recharts)
│   └── holdings-pie-chart.tsx # Holdings distribution pie chart
│
└── auth/
    └── password-strength.tsx  # Password strength indicator
```

### Library Modules

```
lib/
├── supabase/
│   ├── client.ts              # Browser Supabase client (createBrowserClient)
│   ├── server.ts              # Server Supabase client (createServerClient)
│   └── middleware.ts          # Middleware helper (updateSession)
│
├── db/
│   ├── insider-transactions.ts # Transaction queries (getRecentTransactions, etc.)
│   └── institutional-holdings.ts # Holdings queries
│
├── ai/
│   └── claude-client.ts       # Anthropic API wrapper for context generation
│
├── edgar/
│   ├── client.ts              # SEC EDGAR API client
│   └── 13f-client.ts          # 13F filing parser
│
├── email/
│   ├── resend-client.ts       # Resend client singleton
│   ├── send-email.ts          # Email sending functions (sendDailyDigest, etc.)
│   └── templates/
│       ├── index.ts           # Template exports
│       ├── daily-digest.ts    # Daily digest HTML/text
│       ├── instant-alert.ts   # Alert HTML/text
│       └── weekly-summary.ts  # Weekly summary HTML/text
│
├── openfigi/
│   └── client.ts              # CUSIP lookup with caching (7-day TTL)
│
├── auth/
│   └── cron.ts                # Cron job authentication (verifyCronSecret)
│
├── logger.ts                  # Pino structured logging with module loggers
├── client-logger.ts           # Browser-safe logger for client components
└── sentry.ts                  # Sentry initialization
```

### Other Important Files

```
/
├── middleware.ts              # Auth middleware (protects dashboard routes)
├── instrumentation.ts         # Sentry instrumentation
├── vercel.json                # Vercel config with cron schedules
├── sentry.client.config.ts    # Sentry browser config
├── sentry.server.config.ts    # Sentry server config
├── sentry.edge.config.ts      # Sentry edge config
├── types/
│   ├── supabase.ts            # Generated Supabase types (Database interface)
│   └── database.ts            # Custom type aliases
├── TODO.md                    # Development task tracking
└── SETUP.md                   # Setup instructions and SQL scripts
```

---

## 4. Current UI/UX Patterns

### Color Scheme (HSL values from globals.css)

#### Light Mode
| Token | HSL | Description |
|-------|-----|-------------|
| `--background` | 0 0% 100% | White background |
| `--foreground` | 222.2 84% 4.9% | Near-black text |
| `--primary` | 222.2 47.4% 11.2% | Dark blue (buttons, links) |
| `--primary-foreground` | 210 40% 98% | White text on primary |
| `--secondary` | 210 40% 96.1% | Light gray |
| `--muted` | 210 40% 96.1% | Muted backgrounds |
| `--muted-foreground` | 215.4 16.3% 46.9% | Gray text |
| `--accent` | 210 40% 96.1% | Accent backgrounds |
| `--destructive` | 0 84.2% 60.2% | Red for errors/danger |
| `--border` | 214.3 31.8% 91.4% | Light gray borders |
| `--ring` | 222.2 84% 4.9% | Focus ring color |

#### Dark Mode
| Token | HSL | Description |
|-------|-----|-------------|
| `--background` | 222.2 84% 4.9% | Near-black |
| `--foreground` | 210 40% 98% | Near-white text |
| `--primary` | 210 40% 98% | Light primary |
| `--secondary` | 217.2 32.6% 17.5% | Dark gray |
| `--muted` | 217.2 32.6% 17.5% | Muted dark |
| `--border` | 217.2 32.6% 17.5% | Dark borders |

#### Sidebar (Always Dark - slate-900 base)
| Token | HSL |
|-------|-----|
| `--sidebar-background` | 222.2 84% 4.9% |
| `--sidebar-foreground` | 210 40% 98% |
| `--sidebar-muted` | 217.2 32.6% 17.5% |
| `--sidebar-accent` | 217.2 32.6% 17.5% |

#### Semantic Colors (Used in components)
| Color | Tailwind | Usage |
|-------|----------|-------|
| Emerald | `emerald-500/600` | Buy transactions, positive changes, success states |
| Red | `red-500/600` | Sell transactions, negative changes, errors |
| Orange | `orange-500` | High significance indicator |
| Yellow | `yellow-500` | Medium significance, watchlist stars |
| Blue | `blue-500` | Informational, links |

### Typography

- **Font Family**: Geist Sans (`--font-geist-sans`) with system-ui fallback
- **Monospace**: Geist Mono (`--font-geist-mono`)
- **Border Radius**: 0.5rem base (`--radius`), with sm/md/lg/xl variants

### Component Library

Uses **shadcn/ui patterns** built on Radix UI primitives:
- Components are in `src/components/ui/`
- Styled with Tailwind + `class-variance-authority` (cva) for variants
- `cn()` utility function for conditional class merging (clsx + tailwind-merge)
- Example: `<Button variant="outline" size="sm">`

### Layout Patterns

1. **Dashboard Layout**: Fixed sidebar (w-64) + scrollable main content
   - Sidebar: Always dark theme (slate-900), collapsible on mobile
   - Main content: `lg:pl-64` offset, responsive padding
   - Header: Sticky with user menu dropdown
   - **Important**: Dashboard shell applies `dark` CSS class for theme scoping

2. **Auth Layout**: Split-panel design
   - Left panel: Dark gradient with testimonial and stats (hidden on mobile)
   - Right panel: Light background with centered form card
   - Responsive: single column on mobile

3. **Marketing/Landing Layout**: Full-width sections
   - Light theme with gradient accents
   - Public pages (about, terms, privacy, etc.)
   - Shared header/footer

4. **Settings Layout**: Nested tabs with vertical navigation
   - Profile, Billing, Notifications sections
   - Left sidebar navigation within settings

5. **Card-Based UI**: Used extensively for data display
   - `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardDescription`
   - Consistent padding (p-4 or p-6)
   - Hover states with subtle lift effect
   - **Uses CSS variables for theme-aware styling**

6. **Tables**: For transaction lists with sortable columns
   - Responsive: hide columns on mobile
   - Row hover states
   - Significance badges inline

7. **Loading States**: Skeleton components for async data
   - Matching dimensions to content
   - Pulse animation

### Theming Architecture

The app uses a **CSS variable-based theming system** with scoped dark mode:

#### How It Works

1. **CSS Variables** in `globals.css`:
   - `:root` defines light theme values
   - `.dark` class overrides with dark theme values
   - Variables: `--background`, `--foreground`, `--card`, `--primary`, `--muted`, etc.

2. **Theme Scoping by Route**:
   | Route Group | Theme | Implementation |
   |-------------|-------|----------------|
   | Landing (`/`) | Light | No `dark` class |
   | Auth (`/login`, `/signup`) | Light | No `dark` class |
   | Dashboard (`/dashboard/*`) | Dark | `dark` class on shell |
   | Marketing (`/about`, etc.) | Light | No `dark` class |

3. **Dashboard Dark Theme**:
   ```tsx
   // src/components/dashboard/dashboard-shell.tsx
   <div className="dark min-h-screen bg-slate-900">
     {/* All children inherit dark CSS variables */}
   </div>
   ```

#### Critical Rules for UI Components

1. **Always use CSS variables** in `src/components/ui/*`:
   ```tsx
   // ✅ Correct - theme-aware
   className="bg-card text-card-foreground border"

   // ❌ Wrong - breaks theming
   className="bg-slate-800 text-white border-slate-700"
   ```

2. **Never hardcode dark colors** in base UI components
   - Components should work in both light and dark contexts
   - The `dark` class on ancestors handles theme switching

3. **Semantic color exceptions**:
   - Buy/Sell indicators use explicit colors (`emerald-500`, `red-500`)
   - Significance badges use explicit colors (`orange-500`, `yellow-500`)
   - These are intentionally theme-independent

### Animation Classes (defined in globals.css)

| Class | Effect |
|-------|--------|
| `.animate-float` | Vertical floating animation (4s loop) |
| `.animate-fade-in-up` | Fade in with upward motion |
| `.animate-fade-in` | Simple fade in |
| `.animate-scale-in` | Scale from 0.95 to 1 |
| `.animate-pulse-glow` | Pulsing glow effect |
| `.hover-lift` | Lift on hover with shadow |
| `.scroll-animate` | Scroll-triggered animation |

---

## 5. Data Flow

### Database Schema (Key Tables)

```sql
companies
├── id (uuid, PK)
├── ticker (text, unique)
├── name (text)
├── cik (text)              -- SEC CIK number
├── sector (text)
├── industry (text)
└── market_cap (bigint)

insiders
├── id (uuid, PK)
├── cik (text)
└── name (text)

insider_transactions
├── id (uuid, PK)
├── company_id (uuid, FK → companies)
├── insider_id (uuid, FK → insiders)
├── accession_number (text, unique)  -- SEC filing ID
├── filed_at (timestamptz)
├── transaction_date (date)
├── transaction_type (text)  -- P (Purchase), S (Sale), A, D, G, M
├── shares (bigint)
├── price_per_share (numeric)
├── total_value (numeric)
├── insider_title (text)
├── is_director (boolean)
├── is_officer (boolean)
├── is_ten_percent_owner (boolean)
├── ai_context (text)               -- Claude-generated context
├── ai_significance_score (numeric) -- 0.0 to 1.0
└── ai_generated_at (timestamptz)

institutions
├── id (uuid, PK)
├── cik (text)
├── name (text)
└── institution_type (text)

institutional_filings
├── id (uuid, PK)
├── institution_id (uuid, FK)
├── accession_number (text, unique)
├── report_date (date)
├── filed_at (timestamptz)
└── total_value (bigint)

institutional_holdings
├── id (uuid, PK)
├── filing_id (uuid, FK → institutional_filings)
├── institution_id (uuid, FK)
├── company_id (uuid, FK)
├── report_date (date)
├── shares (bigint)
├── value (bigint)
├── shares_change (bigint)
├── is_new_position (boolean)
└── is_closed_position (boolean)

profiles (RLS enabled)
├── id (uuid, PK)              -- matches auth.users.id
├── email (text)
├── full_name (text)
├── subscription_tier (text)   -- 'free', 'retail', 'pro'
├── stripe_customer_id (text)
├── notification_daily_digest (boolean, default true)
├── notification_instant_alerts (boolean, default false)
└── notification_weekly_summary (boolean, default true)

watchlist_items (RLS enabled)
├── id (uuid, PK)
├── user_id (uuid, FK → auth.users)
├── company_id (uuid, FK → companies)
└── created_at (timestamptz)
```

### Database Views

```sql
-- v_recent_insider_transactions
-- Joins transactions with company and insider names for efficient queries
SELECT
  it.*,
  c.ticker,
  c.name as company_name,
  i.name as insider_name
FROM insider_transactions it
JOIN companies c ON it.company_id = c.id
JOIN insiders i ON it.insider_id = i.id
ORDER BY it.filed_at DESC;

-- v_institutional_holdings (similar join pattern)
```

### Data Flow: SEC EDGAR → Database → API → Frontend

```
1. Data Ingestion (Cron jobs or manual)
   SEC EDGAR API → lib/edgar/client.ts → lib/db/*.ts → Supabase

2. AI Enrichment (Cron: /api/cron/generate-context)
   Supabase → lib/ai/claude-client.ts → Update ai_context column

3. API Layer
   Request → src/app/api/*/route.ts → lib/db/*.ts → Supabase → JSON Response

4. Frontend Rendering
   Page (Server Component) → API fetch → Data → React Components
```

### Authentication Flow

```
1. User visits /login or /signup
   ├── Email/Password → supabase.auth.signInWithPassword() → Session Cookie
   └── Google OAuth → supabase.auth.signInWithOAuth() → /auth/callback → Session Cookie

2. Middleware (middleware.ts) runs on every request:
   ├── Creates Supabase client with request cookies
   ├── Calls supabase.auth.getUser() to validate session
   ├── Public routes (/, /about, /login, /signup, etc.) → Allow
   ├── Auth routes + logged in → Redirect to /dashboard
   └── Protected routes (/dashboard/*) + not logged in → Redirect to /login

3. Dashboard layout checks auth server-side:
   └── Fetches user profile for personalization

4. Logout: supabase.auth.signOut() → Clears session cookies → Redirect to /
```

### Key User Journeys

1. **View Recent Trades** (Dashboard)
   ```
   /dashboard → Server Component fetches from v_recent_insider_transactions
   → Renders StatCards + TransactionTable + ClusterAlerts
   ```

2. **Add to Watchlist**
   ```
   /company/:ticker → Click star → POST /api/watchlist → Optimistic UI update
   → Supabase insert to watchlist_items
   ```

3. **Upgrade Subscription**
   ```
   /settings/billing → Click "Upgrade to Pro"
   → POST /api/stripe/checkout → Redirect to Stripe Checkout
   → Payment success → Stripe webhook → Update profiles.subscription_tier
   → Redirect back with success message
   ```

4. **Company Deep Dive**
   ```
   Click ticker → /company/:ticker → Server Component makes parallel fetches:
   ├── GET /api/insider/company/:ticker (insider transactions)
   └── GET /api/institutional/holders/:ticker (institutional holders)
   → Renders CompanyTabs with Overview, Insiders, Institutions tabs
   ```

5. **Daily Email Digest**
   ```
   Vercel Cron (1 PM UTC) → /api/cron/send-daily-digest
   → Query users with notification_daily_digest = true
   → Query their watchlist activity
   → Generate email via lib/email/templates/daily-digest.ts
   → Send via Resend
   ```

---

## 6. Known Issues / TODO

### Remaining Tasks

| Task | Priority | Status |
|------|----------|--------|
| Subscription tier enforcement (feature gating) | HIGH | Not implemented |
| Rate limiting on API routes | MEDIUM | Not implemented |
| Health check endpoint | MEDIUM | Not implemented |
| Post-login redirect (`redirectTo` param) | LOW | Partially implemented |

### Incomplete Features

1. **Subscription Tier Enforcement**
   - Currently all features accessible regardless of tier
   - Need to restrict: instant alerts to Retail+, advanced analytics to Pro
   - Check `profiles.subscription_tier` in API routes and UI

2. **Data Ingestion Pipeline**
   - SEC EDGAR client exists but no automated data fetching cron
   - Manual data seeding via `npm run seed`
   - Consider adding scheduled ingestion

### Performance Concerns

1. **No rate limiting** - API routes vulnerable to abuse
2. **No cursor-based pagination** - Large result sets limited by `limit` param only
3. **View queries** - May need indexing for large datasets
4. **Client bundle** - Monitor with `@next/bundle-analyzer`

### Known Technical Debt

1. **Type assertions** - Some `as` type casts in database code where Supabase types are incomplete
2. **Error handling** - Some API routes return generic 500 errors; could be more specific
3. **Missing tests** - No unit or integration tests currently
4. **Hardcoded CUSIP mappings** - Fallback in `lib/openfigi/client.ts` for ~60 common securities

---

## 7. Design Decisions

### Why Supabase?

- **PostgreSQL** - Reliable, full-featured relational DB with JSON support
- **Built-in Auth** - Email, OAuth, magic links with secure session handling
- **Row Level Security (RLS)** - Database-level access control for multi-tenant data
- **Real-time** - Future capability for live updates (websocket subscriptions)
- **Generated Types** - TypeScript types from database schema
- **Trade-off**: Vendor lock-in, PostgreSQL-specific features

### Why Next.js App Router?

- **Server Components** - Reduce client JS bundle, fetch data server-side
- **Route Groups** - Clean separation: `(auth)`, `(dashboard)`, `(marketing)`
- **Layouts** - Nested layouts for consistent UI shells
- **Server Actions** - Future use for form mutations
- **Trade-off**: Newer patterns, some hydration complexity

### Why Radix UI / shadcn Patterns?

- **Accessibility** - ARIA compliant, keyboard navigation out of the box
- **Unstyled primitives** - Full control over appearance with Tailwind
- **Copy-paste ownership** - Components in repo, not npm dependency
- **Trade-off**: More initial setup, manual updates

### Why Pino for Logging?

- **Performance** - Fastest Node.js logger (important for serverless)
- **Structured JSON** - Easy integration with log aggregators (Datadog, etc.)
- **Module loggers** - `logger.api`, `logger.db`, `logger.ai` for filtering
- **Trade-off**: JSON logs less readable in dev (use `pino-pretty`)

### Why Claude for AI Context?

- **Quality** - Strong reasoning for financial context generation
- **API simplicity** - Straightforward Messages API
- **Consistency** - Same model family as this development context
- **Trade-off**: Cost per API call, rate limits, latency

### Why Vercel Cron vs External Scheduler?

- **Simplicity** - Defined in `vercel.json`, deployed automatically
- **No extra service** - No separate scheduler to manage
- **Trade-off**: Limited to predefined schedules, max 1-hour granularity on free tier

### Why Stripe for Payments?

- **Industry standard** - Well-documented, reliable
- **Hosted checkout** - PCI compliance handled by Stripe
- **Customer portal** - Self-service subscription management
- **Trade-off**: Transaction fees, Stripe-specific integration

### Data Architecture Decisions

1. **Separate insider vs institutional data** - Different SEC filings (Form 4 vs 13F), different update frequencies
2. **AI context stored on transaction** - Avoid re-generating, searchable, cached
3. **Denormalized views** - `v_recent_insider_transactions` for query performance
4. **Watchlist per user (RLS)** - Simple join table, user can only see their own
5. **CUSIP lookup with caching** - 7-day TTL to minimize OpenFIGI API calls

### Security Decisions

1. **Cron routes use Bearer token** - `CRON_SECRET` required in Authorization header
2. **Stripe webhooks verified** - Signature verification via `constructEventAsync`
3. **RLS on user data** - `profiles`, `watchlist_items` restricted to owner
4. **No API keys for frontend** - All routes are session-authenticated
5. **Service role key server-only** - Never exposed to client

---

## 8. Environment Variables Reference

```bash
# === Required ===
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Server-only, never expose

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Payments
STRIPE_SECRET_KEY=sk_live_...             # or sk_test_... for testing
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_RETAIL_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=InsiderIntel <notifications@insiderintel.com>

# Security
CRON_SECRET=<random-32-char-string>

# === Optional ===
OPENFIGI_API_KEY=<api-key>                # Higher rate limits for CUSIP lookup
LOG_LEVEL=info                            # trace, debug, info, warn, error

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=insider-intel
SENTRY_AUTH_TOKEN=sntrys_...              # For source maps upload

# App
NEXT_PUBLIC_APP_URL=https://insiderintel.com  # Used in emails, OAuth callbacks
```

---

## 9. Common Development Tasks

### Adding a New API Route

1. Create `src/app/api/[name]/route.ts`
2. Import logger: `import { logger } from '@/lib/logger'`
3. Create module logger: `const log = logger.api` (or appropriate module)
4. Wrap handler in try/catch with `log.error()` for errors
5. Return `NextResponse.json()` with appropriate status codes
6. Add cache headers if data is cacheable: `'Cache-Control': 's-maxage=300'`

### Adding a New Dashboard Page

1. Create `src/app/(dashboard)/[name]/page.tsx`
2. Page is automatically protected by middleware
3. Use server component for initial data fetch
4. Add `loading.tsx` for loading skeleton
5. Create client components in same folder for interactivity
6. Update sidebar navigation in `src/components/dashboard/sidebar.tsx`

### Modifying the Database Schema

1. Make changes in Supabase Dashboard (SQL Editor)
2. Regenerate types: Database → API Docs → Copy TypeScript types
3. Paste into `types/supabase.ts`
4. Update helper types in `types/database.ts` if needed
5. Update relevant `lib/db/*.ts` functions
6. If adding views, document in `SETUP.md`

### Adding Email Templates

1. Create template in `lib/email/templates/[name].ts`
2. Export `html()` and `text()` functions with typed parameters
3. Add to `lib/email/templates/index.ts` exports
4. Create send function in `lib/email/send-email.ts`
5. Create cron route if scheduled, or API route if triggered

### Modifying UI Components

When editing components in `src/components/ui/`:

1. **Use CSS variables**, not hardcoded colors:
   ```tsx
   // ✅ Correct
   className="bg-card text-card-foreground border"

   // ❌ Wrong - breaks landing page
   className="bg-slate-800 text-white border-slate-700"
   ```

2. **Test in both contexts**:
   - Landing page (light theme): `/`
   - Dashboard (dark theme): `/dashboard`

3. **CSS variable reference** (from `globals.css`):
   - `bg-background`, `text-foreground` - Page backgrounds
   - `bg-card`, `text-card-foreground` - Card surfaces
   - `bg-muted`, `text-muted-foreground` - Subdued elements
   - `bg-primary`, `text-primary-foreground` - Primary actions
   - `border` - Default border color

### Running Locally

```bash
npm install
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run seed         # Seed database with sample data
```

### Testing Cron Jobs Locally

```bash
# Call cron endpoint with Authorization header
curl -X GET http://localhost:3000/api/cron/generate-context \
  -H "Authorization: Bearer your-cron-secret"
```

### Testing Stripe Webhooks Locally

```bash
# Install Stripe CLI, then:
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Use the webhook signing secret from the CLI output
```

---

*Last updated: January 16, 2026*
