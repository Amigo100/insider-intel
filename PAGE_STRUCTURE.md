# PAGE_STRUCTURE.md - InsiderIntel UI Component Reference

This document provides a complete map of every page, its components, and interactive elements. Use this as a reference when making UI changes to ensure consistency.

---

## Table of Contents

1. [Route Groups & Layouts](#route-groups--layouts)
2. [Landing Page](#landing-page)
3. [Authentication Pages](#authentication-pages)
4. [Dashboard Pages](#dashboard-pages)
5. [Settings Pages](#settings-pages)
6. [Marketing Pages](#marketing-pages)
7. [Shared Components](#shared-components)
8. [Component Hierarchy Diagrams](#component-hierarchy-diagrams)

---

## Route Groups & Layouts

The app uses Next.js route groups to organize pages with different layouts:

| Route Group | Theme | Layout File | Protected |
|-------------|-------|-------------|-----------|
| Root `/` | Light | `src/app/layout.tsx` | No |
| `(auth)` | Light (split) | `src/app/(auth)/layout.tsx` | No (redirects if logged in) |
| `(dashboard)` | Dark | `src/app/(dashboard)/layout.tsx` | Yes (requires auth) |
| `(marketing)` | Light | `src/app/(marketing)/layout.tsx` | No |

### Root Layout (`src/app/layout.tsx`)

| Element | Details |
|---------|---------|
| Fonts | Geist Sans (primary), Geist Mono (code) |
| Metadata | SEO title, description, Open Graph, Twitter cards |
| Theme | Light by default, no dark class |

---

## Landing Page

**Route:** `/`
**File:** `src/app/page.tsx`
**Type:** Server Component
**Theme:** Light with gradient decorations

### Page Sections

| Section | Components Used | Features |
|---------|-----------------|----------|
| **Navigation Header** | Custom (inline) | Sticky, Logo (dark), nav links, auth buttons |
| **Hero** | `DashboardPreview` | Animated badge, gradient heading, dual CTAs |
| **Live Activity** | `LiveActivityFeed`, `LiveActivityHeader` | Auto-updating feed, SEC attribution |
| **Trust Badges** | `TrustBadges`, `StatsBanner` | SEC EDGAR, OpenFIGI, AI-Powered, SSL badges |
| **Features** | `FeatureCards` | 4 interactive feature cards with previews |
| **How It Works** | Custom (inline) | 3-step numbered cards with connector lines |
| **Use Cases** | `Testimonials` | Honest use case descriptions (no fake testimonials) |
| **Pricing** | `PricingSection` | 3-tier comparison table |
| **FAQ** | `FAQSection` | Expandable accordion |
| **Final CTA** | Custom (inline) | "Ready to track smart money?" with buttons |
| **Footer** | Custom (inline) | 4-column grid, legal links, disclaimer |

### Interactive Elements

| Element | Location | Behavior |
|---------|----------|----------|
| Sign In link | Header | → `/login` |
| Get Started button | Header, Hero, CTA | → `/signup` |
| See How It Works | Hero | Scroll to #how-it-works |
| Feature card links | Features | Scroll to #pricing or #faq |
| Pricing tier buttons | Pricing | → `/signup` with tier param |
| FAQ accordion | FAQ | Expand/collapse on click |

### Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Mobile (<640px) | Nav links hidden, single-column layout, stacked CTAs |
| Tablet (640-1024px) | 2-column feature grid |
| Desktop (1024px+) | Full nav visible, 2-column grids |

---

## Authentication Pages

**Route Group:** `(auth)`
**Layout:** `src/app/(auth)/layout.tsx`
**Theme:** Split-panel (dark left, light right)

### Auth Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Auth Layout                               │
├────────────────────────┬────────────────────────────────────┤
│   Left Panel (50%)     │      Right Panel (50%)             │
│   (lg:only, dark)      │      (light, always visible)       │
│                        │                                     │
│   • Logo (light)       │      • Mobile logo (lg:hidden)     │
│   • 4 stat cards       │      • Form card (centered)        │
│   • Value proposition  │      • Footer with copyright       │
│   • SEC attribution    │                                     │
│                        │                                     │
│   Gradient background  │      Grid pattern background       │
│   with animated orbs   │                                     │
└────────────────────────┴────────────────────────────────────┘
```

### Individual Auth Pages

#### Login (`/login`)

**File:** `src/app/(auth)/login/page.tsx`
**Component:** `LoginForm` (client)

| Element | Component | Features |
|---------|-----------|----------|
| **Card Header** | `Card`, `CardHeader` | "Welcome back" title |
| **Error Alert** | Custom div | Red background, icon, actionable message |
| **Email Input** | `Input` with icon | Validation, remember me prefill |
| **Password Input** | `Input` with icon | Validation, show/hide toggle |
| **Forgot Password** | `Link` | → `/forgot-password` |
| **Remember Me** | `Checkbox` | Saves email to localStorage |
| **Submit Button** | `Button` | Loading spinner state |
| **Divider** | Custom | "Or continue with" |
| **Google OAuth** | `Button` variant="outline-light" | Google icon, loading state |
| **Sign Up Link** | `Link` | → `/signup` |

**Validation:**
- Email: Required, valid format
- Password: Required, min 6 characters

**Error Messages:** Contextual with actionable suggestions

---

#### Sign Up (`/signup`)

**File:** `src/app/(auth)/signup/page.tsx`
**Component:** `SignupForm` (client)

| Element | Component | Features |
|---------|-----------|----------|
| **Card Header** | `Card`, `CardHeader` | "Create your account" title |
| **Full Name Input** | `Input` with icon | Optional but encouraged |
| **Email Input** | `Input` with icon | Required, validation |
| **Password Input** | `Input` with icon | Strength indicator |
| **Password Strength** | `PasswordStrength` | Visual bar + requirements checklist |
| **Terms Checkbox** | `Checkbox` | Required, links to /terms & /privacy |
| **Submit Button** | `Button` | Loading state |
| **Google OAuth** | `Button` | Alternative signup |
| **Login Link** | `Link` | → `/login` |

**Password Requirements:**
- Min 8 characters
- Uppercase letter
- Lowercase letter
- Number
- Special character

---

#### Forgot Password (`/forgot-password`)

**File:** `src/app/(auth)/forgot-password/page.tsx`
**Component:** `ForgotPasswordForm` (client)

| Element | Features |
|---------|----------|
| Email input | Validation |
| Submit button | Loading state |
| Success message | Green alert with instructions |
| Back to login | Link to `/login` |

---

#### Reset Password (`/reset-password`)

**File:** `src/app/(auth)/reset-password/page.tsx`
**Component:** `ResetPasswordForm` (client)

| Element | Features |
|---------|----------|
| New password input | Strength indicator |
| Confirm password input | Match validation |
| Submit button | Loading state |
| Success redirect | → `/login` with message |

---

## Dashboard Pages

**Route Group:** `(dashboard)`
**Layout:** `src/app/(dashboard)/layout.tsx`
**Theme:** Dark (slate-900)
**Protection:** Server-side auth check

### Dashboard Shell Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Shell                           │
├──────────────┬──────────────────────────────────────────────┤
│   Sidebar    │              Main Content Area               │
│   (w-64)     │                                              │
│   Fixed      │   ┌────────────────────────────────────────┐ │
│              │   │  Header (user menu, mobile toggle)    │ │
│   • Logo     │   ├────────────────────────────────────────┤ │
│   • Nav (5)  │   │                                        │ │
│   • Active   │   │         Page Content                   │ │
│     state    │   │         (children)                     │ │
│              │   │                                        │ │
│   Mobile:    │   │                                        │ │
│   Overlay    │   │                                        │ │
│   hamburger  │   └────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────┘
```

### Sidebar Navigation

| Item | Icon | Route | Active Indicator |
|------|------|-------|------------------|
| Dashboard | `LayoutDashboard` | `/dashboard` | Cyan bar + bg |
| Insider Trades | `UserCheck` | `/insider-trades` | Cyan bar + bg |
| Institutions | `Building2` | `/institutions` | Cyan bar + bg |
| Watchlist | `Star` | `/watchlist` | Cyan bar + bg |
| Settings | `Settings` | `/settings` | Cyan bar + bg |

---

### Main Dashboard (`/dashboard`)

**File:** `src/app/(dashboard)/dashboard/page.tsx`
**Type:** Server Component with Suspense

#### Page Elements

| Section | Component | Data |
|---------|-----------|------|
| **Header** | Custom | Time-based greeting, user name, live badge |
| **Stats Row** | `StatCard` x4 | Today's trades, clusters, watchlist activity, net volume |
| **Cluster Alert** | `ClusterAlert` | Top 2 clusters (if any) |
| **Transaction Table** | `TransactionTable` | Recent 8 transactions |
| **Empty State** | `EmptyState` | When no transactions |

#### Stats Cards

| Card | Icon | Value | Change Indicator |
|------|------|-------|------------------|
| Today's Trades | `Activity` | Count | vs yesterday |
| Cluster Alerts | `Users` | Count | — |
| Watchlist Activity | `Star` | Count | 30-day period |
| Net Buy Volume | `TrendingUp` | Currency | Bullish/Bearish badge |

#### Loading State

- `TableSkeleton`: 5 skeleton rows with animated pulse

---

### Insider Trades (`/insider-trades`)

**File:** `src/app/(dashboard)/insider-trades/page.tsx`
**Type:** Server Component

#### Query Parameters

| Param | Type | Default | Options |
|-------|------|---------|---------|
| `type` | string | `all` | all, P (buy), S (sell), A, D, G, M |
| `days` | number | `30` | 7, 30, 90, 365 |
| `ticker` | string | — | Any valid ticker |
| `page` | number | `1` | Pagination |

#### Page Elements

| Section | Component | Features |
|---------|-----------|----------|
| **Header** | Custom | Title, live badge, subtitle |
| **Stats Row** | `StatCard` x4 | Today, this week, net volume, active companies |
| **Filters** | `TransactionFilters` | Type dropdown, date range, ticker search |
| **Results Summary** | Custom | "Showing X transactions" with filters |
| **Transaction Table** | `TransactionTable` | Sortable columns, pagination |
| **Load More** | `Button` | Incremental pagination |
| **Empty State** | `InsiderTradesEmptyState` | When no results |

#### Filter Component (`TransactionFilters`)

| Filter | Type | Options |
|--------|------|---------|
| Transaction Type | Select | All, Buy, Sell, Award, Disposition, Gift, Exercise |
| Date Range | Select | 7 days, 30 days, 90 days, 1 year |
| Ticker | Input + Pills | Text input with removable chips |

---

### Institutions (`/institutions`)

**File:** `src/app/(dashboard)/institutions/page.tsx`
**Type:** Server Component

#### Page Elements

| Section | Component | Features |
|---------|-----------|----------|
| **Header** | Custom | Title, "13F filings updated quarterly" note |
| **Tabs** | `InstitutionsTabs` | Tabbed interface |

#### Tabs Content

| Tab | Data Displayed |
|-----|----------------|
| **Top Institutions** | Ranked by AUM, searchable |
| **New Positions** | Companies with most new institutional buyers |
| **Top Bought** | Stocks with highest institutional buying |
| **Top Sold** | Stocks with highest institutional selling |

---

### Watchlist (`/watchlist`)

**File:** `src/app/(dashboard)/watchlist/page.tsx`
**Component:** `WatchlistClient` (client)

#### Tier Limits

| Tier | Max Companies |
|------|---------------|
| Free | 5 |
| Retail | 25 |
| Pro | 100 |

#### Watchlist Card Data

| Field | Description |
|-------|-------------|
| Ticker | Company symbol (link to `/company/[ticker]`) |
| Company Name | Full name |
| Sentiment | Bullish / Bearish / Neutral badge |
| Recent Activity | Buy/sell counts in last 30 days |
| Last Transaction | Date of most recent activity |
| Avg Significance | AI significance score |
| Remove Button | Star icon to remove from watchlist |

#### Interactive Features

- Add via search (autocomplete)
- Remove with confirmation
- Click card to view company
- Sentiment auto-calculated from buy/sell ratio

---

### Company Detail (`/company/[ticker]`)

**File:** `src/app/(dashboard)/company/[ticker]/page.tsx`
**Type:** Server Component (dynamic route)

#### Page Elements

| Section | Component | Features |
|---------|-----------|----------|
| **Header** | Custom | Ticker (h1), sector badge, company name |
| **Watchlist Button** | `WatchlistButton` | Add/remove from watchlist |
| **Tabs** | `CompanyTabs` | 4 tabs of data |

#### Company Tabs

| Tab | Content |
|-----|---------|
| **Overview** | Activity chart (12 months), YTD stats |
| **Insider Trading** | Transaction table for this company |
| **Institutional Holdings** | Top 50 institutional holders |
| **AI Insights** | AI-generated context (if available) |

#### Overview Stats

| Stat | Description |
|------|-------------|
| YTD Buys | Count and total value |
| YTD Sells | Count and total value |
| Net Activity | Buy - Sell value |

---

## Settings Pages

**Layout:** `src/app/(dashboard)/settings/layout.tsx`
**Type:** Client Component (uses `usePathname`)

### Settings Navigation

```
┌─────────────────────────────────────────────────────────────┐
│  Settings                                                    │
│  Manage your account settings and preferences               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐ ┌──────────────────────────────────────┐  │
│  │ Navigation   │ │ Content Area                         │  │
│  │              │ │                                      │  │
│  │ [Profile]    │ │  Current settings form               │  │
│  │ [Billing]    │ │                                      │  │
│  │ [Notifs]     │ │                                      │  │
│  │              │ │                                      │  │
│  └──────────────┘ └──────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### Profile Settings (`/settings/profile`)

**File:** `src/app/(dashboard)/settings/profile/page.tsx`
**Component:** `ProfileForm` (client)

| Field | Type | Editable |
|-------|------|----------|
| Full Name | Input | Yes |
| Email | Input | No (display only) |
| Subscription Tier | Badge | No (link to billing) |
| Member Since | Text | No |

**Actions:**
- Save Changes button (with loading state)
- Success/error toast feedback

---

### Billing Settings (`/settings/billing`)

**File:** `src/app/(dashboard)/settings/billing/page.tsx`
**Component:** `BillingContent` (client)

| Element | Features |
|---------|----------|
| Current Plan | Tier name with badge |
| Plan Features | List of included features |
| Upgrade Options | Available higher tiers |
| Manage Subscription | → Stripe Customer Portal |

---

### Notifications Settings (`/settings/notifications`)

**File:** `src/app/(dashboard)/settings/notifications/page.tsx`
**Component:** `NotificationsForm` (client)

| Setting | Default | Description |
|---------|---------|-------------|
| Daily Digest | On | Morning summary email |
| Instant Alerts | Off | Real-time notifications (Retail+) |
| Weekly Summary | On | Weekly wrap-up email |

---

## Marketing Pages

**Route Group:** `(marketing)`
**Layout:** `src/app/(marketing)/layout.tsx`
**Theme:** Light

### Marketing Layout

| Element | Features |
|---------|----------|
| **Header** | Sticky, logo, Sign In + Get Started buttons |
| **Content** | Full-width, padded |
| **Footer** | 4-column grid (same as landing) |

---

### About (`/about`)

**File:** `src/app/(marketing)/about/page.tsx`

| Section | Content |
|---------|---------|
| Hero | Icon, title, mission |
| Mission | 3 paragraphs |
| Values | 4 cards (Transparency, Accuracy, Speed, Accessibility) |
| How We Work | 4-step process |
| Our Data | SEC EDGAR explanation |
| Team | "Built by Investors" |
| CTA | Start Free + Contact buttons |

---

### Contact (`/contact`)

**File:** `src/app/(marketing)/contact/page.tsx`

| Contact Type | Email | Response Time |
|--------------|-------|---------------|
| General Support | support@insiderintel.com | 24 hours |
| Sales & Enterprise | sales@insiderintel.com | 12 hours |
| Legal & Privacy | legal@insiderintel.com | 48 hours |
| Press & Media | press@insiderintel.com | 48 hours |

---

### Legal Pages

| Page | Route | File | Sections |
|------|-------|------|----------|
| Terms | `/terms` | `src/app/(marketing)/terms/page.tsx` | 14 sections |
| Privacy | `/privacy` | `src/app/(marketing)/privacy/page.tsx` | 14 sections |
| Disclaimer | `/disclaimer` | `src/app/(marketing)/disclaimer/page.tsx` | 9 sections + banner |

---

## Shared Components

### UI Primitives (`src/components/ui/`)

| Component | File | Variants |
|-----------|------|----------|
| Button | `button.tsx` | default, outline, outline-light, ghost, link, destructive |
| Input | `input.tsx` | Theme-aware (light default, dark override) |
| Card | `card.tsx` | Card, CardHeader, CardTitle, CardContent, CardDescription |
| Badge | `badge.tsx` | default, secondary, outline, destructive |
| Table | `table.tsx` | Table, TableHeader, TableBody, TableRow, TableCell |
| Tabs | `tabs.tsx` | Tabs, TabsList, TabsTrigger, TabsContent |
| Select | `select.tsx` | Select, SelectTrigger, SelectContent, SelectItem |
| Checkbox | `checkbox.tsx` | With label support |
| Switch | `switch.tsx` | For toggles |
| Skeleton | `skeleton.tsx` | Loading placeholder |
| Avatar | `avatar.tsx` | User avatars with fallback |
| DropdownMenu | `dropdown-menu.tsx` | Menu with items |

### Dashboard Components (`src/components/dashboard/`)

| Component | Purpose | Props |
|-----------|---------|-------|
| `DashboardShell` | Layout wrapper | children, user |
| `Sidebar` | Navigation | collapsed state |
| `Header` | Top bar | user menu |
| `UserMenu` | User dropdown | user data |
| `StatCard` | Metric display | title, value, icon, change |
| `TransactionTable` | Transaction list | transactions, loading, sortable |
| `TransactionCard` | Single transaction | transaction, compact |
| `TransactionFilters` | Filter controls | onFilter, initialValues |
| `SignificanceBadge` | AI score display | score, showLabel |
| `ClusterAlert` | Cluster detection | clusters |
| `CompanyTabs` | Company detail tabs | transactions, holders, stats |
| `InstitutionsTabs` | Institution tabs | institutions, newPositions |
| `WatchlistButton` | Add/remove watchlist | companyId, watchlistItemId |

### Landing Components (`src/components/landing/`)

| Component | Purpose |
|-----------|---------|
| `DashboardPreview` | Mock dashboard for hero |
| `FeatureCards` | Feature highlight cards |
| `PricingSection` | Tier comparison |
| `FAQSection` | Expandable FAQ |
| `Testimonials` | Use case descriptions |
| `LiveActivityFeed` | Animated activity |
| `TrustBadges` | Credibility indicators |

### Chart Components (`src/components/charts/`)

| Component | Library | Purpose |
|-----------|---------|---------|
| `InsiderActivityChart` | Recharts | Bar chart of buy/sell over time |
| `HoldingsPieChart` | Recharts | Institutional holdings distribution |
| `TrendSparkline` | Recharts | Inline mini charts |

---

## Component Hierarchy Diagrams

### Landing Page

```
LandingPage (Server)
├── <header> Navigation
│   ├── Logo
│   ├── NavLinks (desktop)
│   └── AuthButtons
├── <section> Hero
│   ├── Badge (animated)
│   ├── Heading
│   ├── CTAs
│   └── DashboardPreview
├── <section> LiveActivity
│   ├── LiveActivityHeader
│   └── LiveActivityFeed
├── TrustBadges
├── FeatureCards (4x FeatureCard)
├── <section> HowItWorks (3 steps)
├── Testimonials
├── PricingSection
├── FAQSection
├── <section> FinalCTA
└── <footer> Footer
```

### Dashboard Page

```
DashboardLayout (Server)
└── DashboardShell (Client)
    ├── Sidebar
    │   ├── Logo
    │   └── NavItems (5)
    ├── Header
    │   ├── MobileToggle
    │   └── UserMenu
    └── <main>
        └── DashboardPage (Server)
            ├── HeaderSection
            │   └── Greeting
            ├── StatsRow
            │   └── StatCard (x4)
            ├── ClusterAlert (conditional)
            └── <Suspense>
                └── TransactionTable
```

### Auth Pages

```
AuthLayout (Server)
├── LeftPanel (lg:only)
│   ├── Logo
│   ├── StatCards (4)
│   └── ValueProp
└── RightPanel
    ├── MobileLogo (lg:hidden)
    └── LoginForm/SignupForm/etc (Client)
        ├── CardHeader
        ├── ErrorAlert
        ├── FormFields
        ├── SubmitButton
        ├── Divider
        ├── OAuthButton
        └── AlternateLink
```

---

## Quick Reference: Common Patterns

### Adding a New Dashboard Page

1. Create `src/app/(dashboard)/[name]/page.tsx`
2. Add `loading.tsx` with skeleton
3. Add navigation item to `sidebar.tsx`
4. Follow pattern: Header → Stats → Filters → Content → Empty State

### Adding Form Validation

```tsx
const [errors, setErrors] = useState<{ field?: string }>({})

// Validate
if (!value) {
  newErrors.field = 'Required'
}

// Display
{errors.field && (
  <p className="text-xs text-destructive flex items-center gap-1">
    <Info className="h-3 w-3" />
    {errors.field}
  </p>
)}
```

### Adding Loading States

```tsx
// In page.tsx
export default async function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <DataComponent />
    </Suspense>
  )
}
```

### Adding Interactive Elements

1. Use `focus-visible:ring-2 focus-visible:ring-cyan-400` for focus
2. Add `aria-label` for icon-only buttons
3. Include loading spinners for async actions
4. Add success/error toasts for feedback

---

*Last updated: January 16, 2026*
