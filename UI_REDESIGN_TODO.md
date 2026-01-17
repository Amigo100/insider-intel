# InsiderIntel UI Redesign - Task Checklist

**Created:** January 17, 2026  
**Status:** In Progress  
**Total Tasks:** 115  
**Completed:** 0  

> **Instructions for Claude Code:** Reference this file to track implementation progress. After completing each task, update the checkbox from `[ ]` to `[x]` and add the completion date. Run verification steps before marking complete.

---

## Progress Summary

| Phase | Tasks | Completed | Status |
|-------|-------|-----------|--------|
| 1. Foundation | 12 | 0 | ⬜ Not Started |
| 2. Core Components | 24 | 0 | ⬜ Not Started |
| 3. Data Tables | 15 | 0 | ⬜ Not Started |
| 4. Navigation | 12 | 0 | ⬜ Not Started |
| 5. Page Layouts | 20 | 0 | ⬜ Not Started |
| 6. Loading & Polish | 14 | 0 | ⬜ Not Started |
| 7. Accessibility | 29 | 0 | ⬜ Not Started |
| 8. Content Fixes | 9 | 0 | ⬜ Not Started |

**Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## Phase 1: Foundation

### 1.1 CSS Variables & Design Tokens
**File:** `src/app/globals.css`  
**Prompt Reference:** Prompt 1

#### Background Colors
- [ ] Add `--bg-app: #0D0D0D` (main application background)
- [ ] Add `--bg-card: #1A1A1A` (cards, panels, modals)
- [ ] Add `--bg-elevated: #222222` (elevated surfaces, dropdowns)
- [ ] Add `--bg-hover: #262626` (hover states, active rows)
- [ ] Add `--bg-active: #2D2D2D` (pressed states, selected items)

#### Border Colors
- [ ] Add `--border-default: #333333` (standard borders)
- [ ] Add `--border-subtle: #2A2A2A` (subtle separators)
- [ ] Add `--border-focus: #FFA028` (focus rings)
- [ ] Add `--border-glass: rgba(255, 255, 255, 0.08)` (glassmorphism)

#### Text Colors
- [ ] Add `--text-primary: #F5F5F5` (headlines, numbers)
- [ ] Add `--text-secondary: #D4D4D4` (body text)
- [ ] Add `--text-tertiary: #A0A0A0` (labels, captions)
- [ ] Add `--text-muted: #737373` (disabled, placeholders)
- [ ] Add `--text-disabled: #525252` (fully disabled)

#### Accent Colors
- [ ] Add `--accent-primary: #FFA028` (Bloomberg amber - ACTIONS ONLY)
- [ ] Add `--accent-primary-hover: #FFB04D` (hover state)
- [ ] Add `--accent-primary-muted: rgba(255, 160, 40, 0.15)` (subtle backgrounds)
- [ ] Add `--accent-secondary: #D4AF37` (premium/gold)
- [ ] Add `--accent-info: #4A90D9` (links, info)

#### Semantic Colors
- [ ] Add `--signal-positive: #00C853` (gains, buys, success)
- [ ] Add `--signal-positive-bg: rgba(0, 200, 83, 0.15)`
- [ ] Add `--signal-negative: #FF5252` (losses, sells, errors)
- [ ] Add `--signal-negative-bg: rgba(255, 82, 82, 0.15)`
- [ ] Add `--signal-warning: #FFB300` (warnings)
- [ ] Add `--signal-neutral: #4A90D9` (neutral info)

#### Glassmorphism
- [ ] Add `--glass-bg: rgba(26, 26, 26, 0.75)`
- [ ] Add `--glass-border: rgba(255, 255, 255, 0.08)`
- [ ] Add `--glass-blur: 12px`

#### Animation Tokens
- [ ] Add `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`
- [ ] Add `--duration-fast: 100ms`
- [ ] Add `--duration-normal: 150ms`
- [ ] Add `--duration-slow: 300ms`

#### Tailwind Mapping
- [ ] Map new variables to `.dark` class scope
- [ ] Ensure existing semantic names (background, foreground, card) still work
- [ ] Test landing page (light theme) still works
- [ ] Test dashboard (dark theme) uses new colors

**Verification:**
```bash
# Check variables are defined
grep -c "bg-app" src/app/globals.css
# Visual check: Dashboard should show new darker background
```

---

### 1.2 Typography & Fonts
**Files:** `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.ts`  
**Prompt Reference:** Prompt 2

- [ ] Import Inter font (weights: 400, 500, 600, 700)
- [ ] Import JetBrains Mono font (weights: 400, 500)
- [ ] Add `--font-sans` CSS variable for Inter
- [ ] Add `--font-mono` CSS variable for JetBrains Mono
- [ ] Add `.tabular-nums` utility class with `font-variant-numeric: tabular-nums`
- [ ] Update `tailwind.config.ts` to use new font variables
- [ ] Remove Geist font references (or map them to new fonts)
- [ ] Test fonts render correctly on dashboard
- [ ] Test fonts render correctly on landing page

**Verification:**
```bash
# Check font imports
grep -i "inter" src/app/layout.tsx
grep -i "jetbrains" src/app/layout.tsx
# Visual check: Numbers should align in columns (tabular figures)
```

---

## Phase 2: Core Components

### 2.1 Button Component
**File:** `src/components/ui/button.tsx`  
**Prompt Reference:** Prompt 3

#### Variants
- [ ] Update `default` (primary) variant:
  - [ ] Background: `--accent-primary` (#FFA028)
  - [ ] Text: `--bg-app` (#0D0D0D) - dark on amber
  - [ ] Hover: `--accent-primary-hover` (#FFB04D)
- [ ] Update `secondary` variant:
  - [ ] Background: transparent
  - [ ] Border: `--border-default`
  - [ ] Hover: border and text change to `--accent-primary`
- [ ] Update `ghost` variant:
  - [ ] Text: `--text-secondary`
  - [ ] Hover: `--bg-hover`, `--text-primary`
- [ ] Update `destructive` variant:
  - [ ] Background: `--signal-negative`
  - [ ] Text: white
- [ ] Remove `outline-light` variant or update colors

#### Common Styles
- [ ] Add focus ring: `focus-visible:ring-2 focus-visible:ring-[--accent-primary] focus-visible:ring-offset-2`
- [ ] Set heights: sm=28px, md=36px, lg=44px
- [ ] Set border-radius: 6px
- [ ] Set font-weight: 600
- [ ] Add transition: `transition-all duration-150`
- [ ] Remove hardcoded slate/cyan colors

**Verification:**
- [ ] Primary button shows amber background
- [ ] Focus ring is amber (not cyan)
- [ ] All variants work in light and dark themes

---

### 2.2 Card Component
**File:** `src/components/ui/card.tsx`  
**Prompt Reference:** Prompt 4

- [ ] Update Card base:
  - [ ] Background: `bg-card`
  - [ ] Border: `border border-[--border-default]`
  - [ ] Border-radius: 8px
- [ ] Update CardHeader:
  - [ ] Padding: 16px 20px
  - [ ] Border-bottom: `border-b border-[--border-subtle]`
- [ ] Update CardTitle:
  - [ ] Font-size: 16px
  - [ ] Font-weight: 600
  - [ ] Color: `text-foreground` (NOT amber)
- [ ] Update CardContent padding: 20px
- [ ] Update CardDescription color: `text-muted-foreground`
- [ ] Remove all hardcoded colors
- [ ] Test in light theme (landing page)
- [ ] Test in dark theme (dashboard)

**Verification:**
- [ ] Cards have consistent styling across all pages
- [ ] No amber in card headers/titles

---

### 2.3 Input Component
**File:** `src/components/ui/input.tsx`  
**Prompt Reference:** Prompt 5

- [ ] Set height: 40px minimum (44px preferred for touch)
- [ ] Set padding: 0 12px
- [ ] Set background: `bg-background` (uses CSS variable)
- [ ] Set border: `border border-[--border-default]`
- [ ] Set border-radius: 6px
- [ ] Add focus styles:
  - [ ] Border: `--accent-primary`
  - [ ] Ring: `0 0 0 3px rgba(255, 160, 40, 0.15)`
- [ ] Set placeholder color: `text-muted`
- [ ] Remove hardcoded `dark:` prefixed colors
- [ ] Test in login form
- [ ] Test in dashboard filters

**Verification:**
- [ ] Input focus shows amber ring (not cyan)
- [ ] Works in both light and dark themes

---

### 2.4 Select Component
**File:** `src/components/ui/select.tsx`  
**Prompt Reference:** Prompt 5  
**Fixes:** UI_AUDIT #13, #142

- [ ] Update SelectTrigger to match Input styles
- [ ] Update SelectContent:
  - [ ] Remove `bg-slate-800` hardcoding
  - [ ] Use `bg-popover` (maps to `--bg-elevated`)
  - [ ] Border: `--border-default`
- [ ] Update SelectItem:
  - [ ] Hover: `bg-[--bg-hover]`
  - [ ] Focus: amber ring
- [ ] Test in transaction filters
- [ ] Test in settings forms

**Verification:**
- [ ] No hardcoded slate colors remain
- [ ] Dropdown uses correct dark theme colors

---

### 2.5 Checkbox Component
**File:** `src/components/ui/checkbox.tsx`  
**Prompt Reference:** Prompt 5  
**Fixes:** UI_AUDIT #17

- [ ] Increase size from 16x16 to 20x20 (`h-5 w-5`)
- [ ] Set checked state background: `--accent-primary`
- [ ] Add focus ring: `focus-visible:ring-2 focus-visible:ring-[--accent-primary]`
- [ ] Remove cyan references
- [ ] Test in signup form (terms checkbox)
- [ ] Test in settings (notification toggles)

**Verification:**
- [ ] Checkbox is larger (meets 44px touch target with padding)
- [ ] Checked state shows amber

---

### 2.6 Switch Component
**File:** `src/components/ui/switch.tsx`  
**Prompt Reference:** Prompt 5

- [ ] Set track (off): `bg-muted`
- [ ] Set track (on): `bg-[--accent-primary]`
- [ ] Set thumb: white
- [ ] Add focus ring: `focus-visible:ring-2 focus-visible:ring-[--accent-primary]`
- [ ] Test in notification settings

**Verification:**
- [ ] Switch "on" state is amber

---

### 2.7 Badge Component
**File:** `src/components/ui/badge.tsx`  
**Prompt Reference:** Prompt 6

- [ ] Add `buy` variant:
  - [ ] Background: `rgba(0, 200, 83, 0.15)`
  - [ ] Text: `#00C853`
- [ ] Add `sell` variant:
  - [ ] Background: `rgba(255, 82, 82, 0.15)`
  - [ ] Text: `#FF5252`
- [ ] Add `new` variant:
  - [ ] Background: `--accent-primary` (solid)
  - [ ] Text: `#0D0D0D`
- [ ] Add `premium` variant:
  - [ ] Background: `rgba(212, 175, 55, 0.15)`
  - [ ] Text: `#D4AF37`
- [ ] Set common styles:
  - [ ] Padding: 2px 8px
  - [ ] Border-radius: 4px
  - [ ] Font-size: 11px
  - [ ] Font-weight: 600
  - [ ] Text-transform: uppercase
  - [ ] Letter-spacing: 0.04em
- [ ] Update existing variants to use CSS variables

**Verification:**
- [ ] BUY badge is green with icon
- [ ] SELL badge is red with icon
- [ ] NEW badge is solid amber

---

### 2.8 Tabs Component
**File:** `src/components/ui/tabs.tsx`  
**Prompt Reference:** Prompt 7  
**Fixes:** UI_AUDIT #14, #15

- [ ] Update TabsList:
  - [ ] Remove hardcoded slate colors
  - [ ] Use `bg-muted`
  - [ ] Border-radius: 6px
  - [ ] Padding: 4px
- [ ] Update TabsTrigger:
  - [ ] Default: `text-muted-foreground`, `bg-transparent`
  - [ ] Hover: `text-foreground`
  - [ ] Active: `bg-background`, `text-foreground`, amber bottom border
- [ ] Add focus ring: `focus-visible:ring-2 focus-visible:ring-[--accent-primary]`
- [ ] Add `aria-label` prop support to TabsList
- [ ] Test in company detail page
- [ ] Test in institutions page

**Verification:**
- [ ] Active tab has amber underline
- [ ] No hardcoded colors remain

---

### 2.9 Skeleton Component
**File:** `src/components/ui/skeleton.tsx`  
**Prompt Reference:** Prompt 8

- [ ] Add shimmer animation keyframes:
  ```css
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  ```
- [ ] Update base skeleton:
  - [ ] Background gradient: `--bg-hover` → `--bg-elevated` → `--bg-hover`
  - [ ] Background-size: 200% 100%
  - [ ] Animation: shimmer 1.5s infinite
- [ ] Create/export variants:
  - [ ] `SkeletonText` (h-3.5, varying widths)
  - [ ] `SkeletonHeading` (h-6, w-1/2)
  - [ ] `SkeletonAvatar` (40x40, rounded-full)
  - [ ] `SkeletonButton` (h-9, w-24)
  - [ ] `SkeletonCard` (h-32)
  - [ ] `SkeletonTableRow` (h-13 comfortable, h-9 compact)
  - [ ] `SkeletonChart` (h-48)

**Verification:**
- [ ] Skeleton has shimmer animation (not just pulse)
- [ ] Animation is smooth and not jarring

---

## Phase 3: Data Tables

### 3.1 Sticky Table Headers
**Files:** `src/components/dashboard/transaction-table.tsx`, `src/components/ui/table.tsx`  
**Prompt Reference:** Prompt 9

- [ ] Add scroll container wrapper:
  - [ ] `max-height: calc(100vh - 200px)`
  - [ ] `overflow: auto`
  - [ ] Border and border-radius
- [ ] Update table headers (`thead th`):
  - [ ] `position: sticky`
  - [ ] `top: 0`
  - [ ] `z-index: 20`
  - [ ] Glassmorphism: `bg-[--glass-bg]`, `backdrop-blur-[12px]`
  - [ ] Border-bottom
  - [ ] Font: 11px, uppercase, letter-spacing 0.05em
  - [ ] Color: `--text-tertiary`
- [ ] Make first column sticky:
  - [ ] `position: sticky`
  - [ ] `left: 0`
  - [ ] `z-index: 10`
  - [ ] Opaque background (not glass)
  - [ ] Border-right
- [ ] Set corner cell `z-index: 30`
- [ ] Style number columns:
  - [ ] `text-align: right`
  - [ ] `font-family: var(--font-mono)`
  - [ ] `font-variant-numeric: tabular-nums`
- [ ] Add row hover: `bg-[--bg-hover]`
- [ ] Add `scope="col"` to all th elements

**Verification:**
- [ ] Headers stay visible when scrolling
- [ ] First column stays visible when scrolling horizontally
- [ ] Glassmorphism effect visible on headers
- [ ] Numbers align properly in columns

---

### 3.2 Sparklines
**Files:** `src/components/dashboard/transaction-table.tsx`, `src/components/charts/trend-sparkline.tsx`  
**Prompt Reference:** Prompt 10

- [ ] Create TrendSparkline component (or update existing):
  - [ ] Props: `data: number[]`, `trend: 'up' | 'down' | 'neutral'`
  - [ ] Width: 60-80px
  - [ ] Height: 24px
  - [ ] SVG-based
  - [ ] No axes/gridlines/labels
  - [ ] Stroke-width: 1.5px
  - [ ] Stroke-linecap: round
- [ ] Implement color by trend:
  - [ ] Up: `--signal-positive`
  - [ ] Down: `--signal-negative`
  - [ ] Neutral: `--text-muted`
- [ ] Add end-point dot (radius 2.5px)
- [ ] Add to TransactionTable:
  - [ ] New column "6M Trend"
  - [ ] Position after Value column
  - [ ] Hide on mobile
- [ ] Add `aria-label` describing trend

**Verification:**
- [ ] Sparklines render correctly
- [ ] Colors match trend direction
- [ ] Hidden on small screens

---

### 3.3 Density Toggle
**Files:** `src/components/dashboard/transaction-table.tsx`, `src/components/dashboard/density-toggle.tsx` (create)  
**Prompt Reference:** Prompt 11

- [ ] Create DensityToggle component:
  - [ ] Two options: "Comfortable" | "Compact"
  - [ ] Segmented control style
  - [ ] Active: `bg-[--accent-primary]`, dark text
  - [ ] Inactive: transparent, `text-tertiary`
  - [ ] Container: `bg-[--bg-elevated]`, padding 4px, rounded
- [ ] Define density specifications:
  - [ ] Comfortable: row 52px, padding 14px 16px, font 13px
  - [ ] Compact: row 36px, padding 8px 12px, font 12px
- [ ] Add state management to TransactionTable
- [ ] Store preference in localStorage
- [ ] Position in results summary bar

**Verification:**
- [ ] Toggle switches between densities
- [ ] Preference persists on page reload
- [ ] Table adjusts row heights correctly

---

## Phase 4: Navigation

### 4.1 Sidebar Update
**File:** `src/components/dashboard/sidebar.tsx`  
**Prompt Reference:** Prompt 12

#### Structure
- [ ] Set width: 256px desktop, 64px collapsed, hidden mobile
- [ ] Set background: `--bg-card`
- [ ] Set border-right: `--border-default`

#### Logo Section
- [ ] Padding: 20px
- [ ] Border-bottom: `--border-subtle`
- [ ] Logo icon: 32x32, amber background, rounded 8px

#### Search Trigger
- [ ] Style like input (clickable)
- [ ] Background: `--bg-app`
- [ ] Border: `--border-default`
- [ ] Placeholder: "Search... ⌘K"
- [ ] On click: open Command Palette

#### Navigation Items
- [ ] Padding: 10px 12px
- [ ] Border-radius: 6px
- [ ] Font: 14px, weight 500
- [ ] Icon: 20px, opacity 0.7
- [ ] Default state: `text-secondary`, transparent bg
- [ ] Hover state: `text-primary`, `bg-hover`
- [ ] Active state:
  - [ ] Background: `--accent-primary-muted`
  - [ ] Text: `--accent-primary`
  - [ ] Left border: 3px solid `--accent-primary`
  - [ ] Icon opacity: 1

#### Section Labels
- [ ] Font: 11px, uppercase, letter-spacing 0.05em
- [ ] Color: `--text-muted`

#### Remove Cyan
- [ ] Replace all cyan references with amber
- [ ] Test active state styling

**Verification:**
- [ ] Active nav item shows amber indicator
- [ ] Hover states work correctly
- [ ] Mobile menu works

---

### 4.2 Command Palette
**File:** `src/components/dashboard/command-palette.tsx` (create)  
**Prompt Reference:** Prompt 13

#### Triggers
- [ ] ⌘K (Mac) / Ctrl+K (Windows) keyboard shortcut
- [ ] Click on sidebar search
- [ ] "/" key when not in input

#### Visual Design
- [ ] Backdrop: `rgba(0, 0, 0, 0.6)`, `backdrop-blur-[4px]`
- [ ] Modal: max-width 560px, margin-top 15vh
- [ ] Background: `--bg-card`
- [ ] Border: `--border-default`, radius 12px
- [ ] Shadow: 0 24px 48px rgba(0,0,0,0.4)
- [ ] Animation: slideDown 150ms

#### Search Input
- [ ] Full width, no border
- [ ] Padding: 20px
- [ ] Font-size: 18px
- [ ] Border-bottom: `--border-default`
- [ ] Placeholder: "Search tickers, views, or actions..."

#### Results
- [ ] Max-height: 360px, overflow-y auto
- [ ] Padding: 8px
- [ ] Item: flex with icon, label, shortcut
- [ ] Item padding: 12px
- [ ] Item hover: `bg-hover`
- [ ] Item selected: `bg-[--accent-primary-muted]`

#### Search Categories
- [ ] Tickers → /company/[ticker]
- [ ] Navigation → page routes
- [ ] Actions → Add to Watchlist, Export
- [ ] Recent → last 3 viewed

#### Keyboard Navigation
- [ ] ↑/↓: Navigate results
- [ ] Enter: Select
- [ ] Escape: Close
- [ ] Tab: Cycle categories

#### Accessibility
- [ ] Use Radix Dialog or similar
- [ ] Focus trap when open
- [ ] Return focus on close

**Verification:**
- [ ] ⌘K opens palette
- [ ] Can navigate with keyboard
- [ ] Escape closes
- [ ] Search filters results

---

## Phase 5: Page Layouts

### 5.1 Dashboard Page
**File:** `src/app/(dashboard)/dashboard/page.tsx`  
**Prompt Reference:** Prompt 14

- [ ] Update page header:
  - [ ] Title: "Dashboard"
  - [ ] Right: Date range selector
  - [ ] Remove time-based greeting
- [ ] Update metrics row:
  - [ ] 4-column grid (2 on mobile)
  - [ ] Gap: 16px
  - [ ] Cards: Buys, Sells, Clusters, Watchlist
- [ ] Implement content grid:
  - [ ] Main: 2/3 width
  - [ ] Sidebar: 1/3 width
  - [ ] Gap: 24px
  - [ ] Stack on mobile
- [ ] Main content:
  - [ ] "Recent Insider Activity" card
  - [ ] "View All →" link
  - [ ] TransactionTable (10 rows)
- [ ] Sidebar:
  - [ ] "Cluster Alerts" card
  - [ ] "Watchlist Activity" card
- [ ] Add Suspense boundaries with skeletons

**Verification:**
- [ ] Layout matches wireframe
- [ ] Responsive at all breakpoints
- [ ] Loading states work

---

### 5.2 Insider Trades Page
**File:** `src/app/(dashboard)/insider-trades/page.tsx`  
**Prompt Reference:** Prompt 15

- [ ] Update page header:
  - [ ] Title: "Insider Trades"
  - [ ] Action: "Export CSV" button
- [ ] Implement filter bar:
  - [ ] Card-style container
  - [ ] Search input with icon
  - [ ] Type dropdown
  - [ ] Date range dropdown
  - [ ] Significance dropdown
  - [ ] Clear filters button
- [ ] Add results summary bar:
  - [ ] "Showing X-Y of Z transactions"
  - [ ] Density toggle
- [ ] Update table:
  - [ ] Full width
  - [ ] Sticky headers + first column
  - [ ] All columns per spec
- [ ] Implement row expansion:
  - [ ] AI Context paragraph
  - [ ] Significance indicator
  - [ ] Actions: View Company, Add to Watchlist
- [ ] Add pagination

**Verification:**
- [ ] Filters work correctly
- [ ] Row expansion shows AI context
- [ ] Pagination works

---

### 5.3 Institutions Page
**File:** `src/app/(dashboard)/institutions/page.tsx`  
**Prompt Reference:** Prompt 16  
**Fixes:** UI_AUDIT #35

- [ ] Update page header
- [ ] Implement tab navigation:
  - [ ] Tabs: New Positions, Increased, Decreased, Closed, All
  - [ ] Active: amber underline
  - [ ] Count badges on tabs
  - [ ] ARIA tab pattern
- [ ] Add filter bar:
  - [ ] Search input
  - [ ] Quarter dropdown
  - [ ] Minimum value dropdown
- [ ] Update data table columns
- [ ] Add empty states per tab
- [ ] Fix InstitutionsTabs aria-label (UI_AUDIT #35)

**Verification:**
- [ ] Tabs filter data correctly
- [ ] ARIA attributes present
- [ ] Empty states display

---

### 5.4 Watchlist Page
**Files:** `src/app/(dashboard)/watchlist/page.tsx`, `src/app/(dashboard)/watchlist/watchlist-client.tsx`  
**Prompt Reference:** Prompt 17  
**Fixes:** UI_AUDIT #146, #151

- [ ] Update page header:
  - [ ] Title with count
  - [ ] "+ Add Ticker" button
- [ ] Implement watchlist grid:
  - [ ] 3 columns desktop, 2 tablet, 1 mobile
  - [ ] Gap: 16px
- [ ] Create watchlist card:
  - [ ] Ticker (18px, bold)
  - [ ] Company name (13px, tertiary)
  - [ ] Sparkline
  - [ ] Last activity
  - [ ] Active indicator (green border + badge)
  - [ ] Hover actions: View, Remove
- [ ] Add removal confirmation dialog (fixes #151)
- [ ] Implement activity feed:
  - [ ] Grouped by date
  - [ ] Item: ticker, description, AI preview
- [ ] Create empty state
- [ ] Refactor watchlist-client.tsx (fixes #146):
  - [ ] Create WatchlistGrid component
  - [ ] Create WatchlistCard component
  - [ ] Create WatchlistActivityFeed component
  - [ ] Create useWatchlist hook

**Verification:**
- [ ] Grid layout responsive
- [ ] Removal shows confirmation
- [ ] Empty state displays
- [ ] Client file is smaller/split

---

### 5.5 Company Detail Page
**Files:** `src/app/(dashboard)/company/[ticker]/page.tsx`, `src/components/dashboard/company-tabs.tsx`  
**Prompt Reference:** Prompt 18  
**Fixes:** UI_AUDIT #149

- [ ] Update page header:
  - [ ] Back link
  - [ ] Title: "TICKER - Company Name"
  - [ ] Subtitle: Sector, Market Cap
  - [ ] Watchlist button
- [ ] Implement metrics row (company-specific):
  - [ ] Insider Buys (1Y)
  - [ ] Insider Sells (1Y)
  - [ ] Net Insider Activity
  - [ ] Institutional Ownership
- [ ] Implement tabs:
  - [ ] Overview, Insider Activity, Institutional Holdings
  - [ ] ARIA labels
- [ ] Overview tab content:
  - [ ] 2-column layout
  - [ ] Activity chart (12 months)
  - [ ] Key insiders list
  - [ ] Recent transactions
- [ ] Insider Activity tab:
  - [ ] Filters
  - [ ] Full TransactionTable
- [ ] Institutional Holdings tab:
  - [ ] Top holders pie chart
  - [ ] Recent changes
  - [ ] Full holders table
- [ ] Replace Card with DashboardCard (fixes #149)

**Verification:**
- [ ] All tabs render correctly
- [ ] Charts display
- [ ] Watchlist toggle works

---

## Phase 6: Loading & Polish

### 6.1 Loading States
**Files:** All `loading.tsx` files in `(dashboard)` route group  
**Prompt Reference:** Prompt 19

- [ ] `src/app/(dashboard)/dashboard/loading.tsx`:
  - [ ] 4 skeleton metric cards
  - [ ] Skeleton content grid
  - [ ] Skeleton table (5 rows)
- [ ] `src/app/(dashboard)/insider-trades/loading.tsx`:
  - [ ] Skeleton filter bar
  - [ ] Skeleton results summary
  - [ ] Skeleton table (10 rows)
- [ ] `src/app/(dashboard)/institutions/loading.tsx`:
  - [ ] Skeleton tabs
  - [ ] Skeleton filter bar
  - [ ] Skeleton table (8 rows)
- [ ] `src/app/(dashboard)/watchlist/loading.tsx`:
  - [ ] Skeleton grid (6 cards)
  - [ ] Skeleton activity feed
- [ ] `src/app/(dashboard)/company/[ticker]/loading.tsx`:
  - [ ] Skeleton header
  - [ ] Skeleton metrics
  - [ ] Skeleton tabs
  - [ ] Skeleton content
- [ ] `src/app/(dashboard)/settings/loading.tsx`:
  - [ ] Skeleton nav
  - [ ] Skeleton form fields

**Verification:**
- [ ] All pages show skeletons on load
- [ ] No spinners anywhere
- [ ] No layout shift when content loads

---

### 6.2 Empty States
**Files:** Create `src/components/ui/empty-state.tsx`, update pages  
**Prompt Reference:** Prompt 20  
**Fixes:** UI_AUDIT #152

- [ ] Create EmptyState component:
  - [ ] Props: icon, title, description, action, secondaryText
  - [ ] Centered layout
  - [ ] Icon: 64px, text-muted
  - [ ] Title: 18px, font-weight 600
  - [ ] Description: 14px, text-secondary, max-width 400px
  - [ ] Action: primary button
- [ ] Implement empty states:
  - [ ] Watchlist: Star icon, add stock CTA
  - [ ] Insider Trades (no results): Search icon, clear filters
  - [ ] Institutions (no results): Building icon, adjust filters
  - [ ] Company not found: AlertCircle icon, go to dashboard
- [ ] Fix TransactionTable empty state (UI_AUDIT #152)

**Verification:**
- [ ] Empty states display correctly
- [ ] Actions work

---

## Phase 7: Accessibility

### 7.1 Critical ARIA Labels
**Files:** Multiple per UI_AUDIT  
**Prompt Reference:** Prompt 21

- [ ] `src/components/landing/feature-cards.tsx` (178-229):
  - [ ] Add `<title>` to SVG pie chart
  - [ ] Add `aria-labelledby` to SVG
- [ ] `src/components/landing/testimonials.tsx` (75-81):
  - [ ] Add `aria-label="Rating: X out of 5 stars"` to star rating
- [ ] `src/components/landing/live-activity-feed.tsx` (45):
  - [ ] Add `aria-label="Loading transactions"` to spinner
- [ ] `src/app/page.tsx` (95-112):
  - [ ] Add `focus:ring-2 focus:ring-primary focus:ring-offset-2` to nav links
- [ ] `src/app/(auth)/login/login-form.tsx` (190-201):
  - [ ] Add `role="alert" aria-live="polite"` to error containers
- [ ] `src/app/(auth)/login/login-form.tsx` (209-221):
  - [ ] Add `aria-invalid={!!error}` to inputs
  - [ ] Add `aria-describedby` linking errors
- [ ] `src/components/dashboard/transaction-filters.tsx` (109-136):
  - [ ] Add `role="group" aria-label="Transaction type filter"`
- [ ] `src/components/dashboard/header.tsx` (186):
  - [ ] Add `role="alert"` to "No results" message
- [ ] All table headers:
  - [ ] Add `scope="col"` to all `<th>` elements

**Verification:**
- [ ] Run axe DevTools - no critical violations
- [ ] Screen reader announces errors correctly

---

### 7.2 Skip Navigation & Focus
**Files:** `src/app/layout.tsx`, `src/app/(auth)/layout.tsx`, `src/components/dashboard/sidebar.tsx`  
**Prompt Reference:** Prompt 22

- [ ] Add skip link to root layout:
  ```jsx
  <a href="#main-content" className="sr-only focus:not-sr-only ...">
    Skip to main content
  </a>
  ```
- [ ] Add `id="main-content"` to main area
- [ ] Add skip link to auth layout
- [ ] Add `id="auth-form"` to form container
- [ ] Implement focus trap in mobile sidebar:
  - [ ] Focus stays within when open
  - [ ] Escape closes
  - [ ] Focus returns to trigger

**Verification:**
- [ ] Tab to skip link works
- [ ] Focus trap works on mobile sidebar

---

### 7.3 Color Independence
**Files:** `src/components/dashboard/stat-card.tsx`, `src/components/dashboard/significance-badge.tsx`  
**Prompt Reference:** Prompt 23  
**Fixes:** UI_AUDIT #33

- [ ] Update StatCard change indicator (fixes #33):
  - [ ] Positive: ↑ arrow + green + "+X%" text
  - [ ] Negative: ↓ arrow + red + "−X%" text
  - [ ] Neutral: → arrow + gray
- [ ] Update SignificanceBadge:
  - [ ] Add text labels: "High", "Medium", "Low"
  - [ ] Add `aria-label`
- [ ] Verify transaction badges have icon + text + color
- [ ] Add `aria-label` to sparklines

**Verification:**
- [ ] Information conveyed without color
- [ ] Screen reader announces significance

---

### 7.4 Form Accessibility
**Files:** Auth forms, settings forms  
**Prompt Reference:** Prompt 24  
**Fixes:** UI_AUDIT #22, #23, #24, #32, #147, #153

- [ ] Add password visibility toggle (#24):
  - [ ] Eye/EyeOff icon button
  - [ ] `aria-label="Show password"` / "Hide password"
  - [ ] Position inside input
- [ ] Add `rel="noopener noreferrer"` to terms links (#23)
- [ ] Add external link indicator
- [ ] Wrap terms checkbox in fieldset (#32)
- [ ] Replace CSS tooltips with Radix Tooltip (#22, #147)
- [ ] Fix profile form label (#153)
- [ ] Ensure all inputs have:
  - [ ] Associated `<label>` with `htmlFor`
  - [ ] `aria-invalid` when error
  - [ ] `aria-describedby` for error messages

**Verification:**
- [ ] Password can be shown/hidden
- [ ] Tooltips accessible by keyboard
- [ ] Form validation announced

---

## Phase 8: Content Fixes

### 8.1 Marketing & Quick Wins
**Files:** Various per UI_AUDIT  
**Prompt Reference:** Prompt 25

- [ ] Remove "Join 500+ investors" (#143):
  - [ ] File: `src/components/landing/pricing-section.tsx` (139-141)
  - [ ] Delete line or replace with feature text
- [ ] Fix SOC 2 claim (#144):
  - [ ] File: `src/components/landing/faq-section.tsx` (71-75)
  - [ ] Change to "We implement industry security best practices"
- [ ] Add title to truncated names (#158):
  - [ ] File: `src/components/dashboard/transaction-table.tsx` (220-221)
  - [ ] Add `title={transaction.company_name}` attribute
- [ ] Increase success message duration (#159):
  - [ ] File: `src/app/(dashboard)/settings/profile/profile-form.tsx` (80-81)
  - [ ] Change 3000ms to 5000ms
- [ ] Fix dashboard subtitle (#155):
  - [ ] File: `src/app/(dashboard)/dashboard/page.tsx`
  - [ ] Change to "Latest insider trading activity"
- [ ] Add clear buttons to search inputs (#163):
  - [ ] Watchlist search
  - [ ] Institutions search
  - [ ] Transaction filters
  - [ ] Show only when value present
  - [ ] `aria-label="Clear search"`
- [ ] Clean up unused animation classes (#161):
  - [ ] File: `src/app/globals.css`
  - [ ] Remove or implement staggered animations

**Verification:**
- [ ] No unverifiable marketing claims
- [ ] Search inputs can be cleared
- [ ] Success messages visible longer

---

## Final Verification Checklist

Run these checks after all phases are complete:

### Visual Checks
- [ ] Dashboard uses new dark color scheme (#0D0D0D background)
- [ ] All amber accents are on interactive elements only
- [ ] Tables have glassmorphism headers
- [ ] Sparklines render in tables
- [ ] Empty states display correctly
- [ ] Skeleton loading works on all pages

### Theme Checks
- [ ] Landing page (light theme) works correctly
- [ ] Dashboard (dark theme) uses new colors
- [ ] Auth pages work correctly
- [ ] No hardcoded colors breaking themes

### Responsive Checks
- [ ] Mobile: 375px
- [ ] Tablet: 768px
- [ ] Desktop: 1280px
- [ ] Tables scroll horizontally on mobile
- [ ] Sidebar collapses correctly

### Keyboard Navigation
- [ ] ⌘K opens Command Palette
- [ ] Tab navigates all interactive elements
- [ ] Enter activates buttons/links
- [ ] Escape closes modals
- [ ] Focus rings visible

### Screen Reader
- [ ] Skip links work
- [ ] Errors announced
- [ ] Tables have proper semantics
- [ ] Images have alt text

### Performance
- [ ] No layout shift on load
- [ ] Animations respect prefers-reduced-motion
- [ ] No console errors

---

## Change Log

| Date | Tasks Completed | Notes |
|------|-----------------|-------|
| Jan 17, 2026 | 0 | Initial checklist created |
| | | |
| | | |

---

*Last updated: January 17, 2026*
