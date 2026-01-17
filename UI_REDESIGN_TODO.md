# InsiderIntel UI Redesign - Task Checklist

**Created:** January 17, 2026
**Status:** In Progress
**Total Tasks:** 115
**Completed:** 83  

> **Instructions for Claude Code:** Reference this file to track implementation progress. After completing each task, update the checkbox from `[ ]` to `[x]` and add the completion date. Run verification steps before marking complete.

---

## Progress Summary

| Phase | Tasks | Completed | Status |
|-------|-------|-----------|--------|
| 1. Foundation | 12 | 12 | ✅ Complete |
| 2. Core Components | 24 | 24 | ✅ Complete |
| 3. Data Tables | 15 | 15 | ✅ Complete |
| 4. Navigation | 12 | 12 | ✅ Complete |
| 5. Page Layouts | 20 | 20 | ✅ Complete |
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
- [x] Add `--bg-app: #0D0D0D` (main application background)
- [x] Add `--bg-card: #1A1A1A` (cards, panels, modals)
- [x] Add `--bg-elevated: #222222` (elevated surfaces, dropdowns)
- [x] Add `--bg-hover: #262626` (hover states, active rows)
- [x] Add `--bg-active: #2D2D2D` (pressed states, selected items)

#### Border Colors
- [x] Add `--border-default: #333333` (standard borders)
- [x] Add `--border-subtle: #2A2A2A` (subtle separators)
- [x] Add `--border-focus: #FFA028` (focus rings)
- [x] Add `--border-glass: rgba(255, 255, 255, 0.08)` (glassmorphism)

#### Text Colors
- [x] Add `--text-primary: #F5F5F5` (headlines, numbers)
- [x] Add `--text-secondary: #D4D4D4` (body text)
- [x] Add `--text-tertiary: #A0A0A0` (labels, captions)
- [x] Add `--text-muted: #737373` (disabled, placeholders)
- [x] Add `--text-disabled: #525252` (fully disabled)

#### Accent Colors
- [x] Add `--accent-primary: #FFA028` (Bloomberg amber - ACTIONS ONLY)
- [x] Add `--accent-primary-hover: #FFB04D` (hover state)
- [x] Add `--accent-primary-muted: rgba(255, 160, 40, 0.15)` (subtle backgrounds)
- [x] Add `--accent-secondary: #D4AF37` (premium/gold)
- [x] Add `--accent-info: #4A90D9` (links, info)

#### Semantic Colors
- [x] Add `--signal-positive: #00C853` (gains, buys, success)
- [x] Add `--signal-positive-bg: rgba(0, 200, 83, 0.15)`
- [x] Add `--signal-negative: #FF5252` (losses, sells, errors)
- [x] Add `--signal-negative-bg: rgba(255, 82, 82, 0.15)`
- [x] Add `--signal-warning: #FFB300` (warnings)
- [x] Add `--signal-neutral: #4A90D9` (neutral info)

#### Glassmorphism
- [x] Add `--glass-bg: rgba(26, 26, 26, 0.75)`
- [x] Add `--glass-border: rgba(255, 255, 255, 0.08)`
- [x] Add `--glass-blur: 12px`

#### Animation Tokens
- [x] Add `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`
- [x] Add `--duration-fast: 100ms`
- [x] Add `--duration-normal: 150ms`
- [x] Add `--duration-slow: 300ms`

#### Tailwind Mapping
- [x] Map new variables to `.dark` class scope
- [x] Ensure existing semantic names (background, foreground, card) still work
- [x] Test landing page (light theme) still works
- [x] Test dashboard (dark theme) uses new colors

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

- [x] Import Inter font (weights: 400, 500, 600, 700)
- [x] Import JetBrains Mono font (weights: 400, 500)
- [x] Add `--font-sans` CSS variable for Inter
- [x] Add `--font-mono` CSS variable for JetBrains Mono
- [x] Add `.tabular-nums` utility class with `font-variant-numeric: tabular-nums`
- [x] Update `tailwind.config.ts` to use new font variables
- [x] Remove Geist font references (or map them to new fonts)
- [x] Test fonts render correctly on dashboard
- [x] Test fonts render correctly on landing page

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
- [x] Update `default` (primary) variant:
  - [x] Background: `--accent-primary` (#FFA028)
  - [x] Text: `--bg-app` (#0D0D0D) - dark on amber
  - [x] Hover: `--accent-primary-hover` (#FFB04D)
- [x] Update `secondary` variant:
  - [x] Background: transparent
  - [x] Border: `--border-default`
  - [x] Hover: border and text change to `--accent-primary`
- [x] Update `ghost` variant:
  - [x] Text: `--text-secondary`
  - [x] Hover: `--bg-hover`, `--text-primary`
- [x] Update `destructive` variant:
  - [x] Background: `--signal-negative`
  - [x] Text: white
- [x] Remove `outline-light` variant or update colors

#### Common Styles
- [x] Add focus ring: `focus-visible:ring-2 focus-visible:ring-[--accent-primary] focus-visible:ring-offset-2`
- [x] Set heights: sm=28px, md=36px, lg=44px
- [x] Set border-radius: 6px
- [x] Set font-weight: 600
- [x] Add transition: `transition-all duration-150`
- [x] Remove hardcoded slate/cyan colors

**Verification:**
- [x] Primary button shows amber background
- [x] Focus ring is amber (not cyan)
- [x] All variants work in light and dark themes

---

### 2.2 Card Component
**File:** `src/components/ui/card.tsx`
**Prompt Reference:** Prompt 4

- [x] Update Card base:
  - [x] Background: `bg-card`
  - [x] Border: `border border-[--border-default]`
  - [x] Border-radius: 8px
- [x] Update CardHeader:
  - [x] Padding: 16px 20px
  - [x] Border-bottom: `border-b border-[--border-subtle]`
- [x] Update CardTitle:
  - [x] Font-size: 16px
  - [x] Font-weight: 600
  - [x] Color: `text-foreground` (NOT amber)
- [x] Update CardContent padding: 20px
- [x] Update CardDescription color: `text-muted-foreground`
- [x] Remove all hardcoded colors
- [x] Test in light theme (landing page)
- [x] Test in dark theme (dashboard)

**Verification:**
- [x] Cards have consistent styling across all pages
- [x] No amber in card headers/titles

---

### 2.3 Input Component
**File:** `src/components/ui/input.tsx`
**Prompt Reference:** Prompt 5

- [x] Set height: 40px minimum (44px preferred for touch)
- [x] Set padding: 0 12px
- [x] Set background: `bg-background` (uses CSS variable)
- [x] Set border: `border border-[--border-default]`
- [x] Set border-radius: 6px
- [x] Add focus styles:
  - [x] Border: `--accent-primary`
  - [x] Ring: `0 0 0 3px rgba(255, 160, 40, 0.15)`
- [x] Set placeholder color: `text-muted`
- [x] Remove hardcoded `dark:` prefixed colors
- [x] Test in login form
- [x] Test in dashboard filters

**Verification:**
- [x] Input focus shows amber ring (not cyan)
- [x] Works in both light and dark themes

---

### 2.4 Select Component
**File:** `src/components/ui/select.tsx`
**Prompt Reference:** Prompt 5
**Fixes:** UI_AUDIT #13, #142

- [x] Update SelectTrigger to match Input styles
- [x] Update SelectContent:
  - [x] Remove `bg-slate-800` hardcoding
  - [x] Use `bg-popover` (maps to `--bg-elevated`)
  - [x] Border: `--border-default`
- [x] Update SelectItem:
  - [x] Hover: `bg-[--bg-hover]`
  - [x] Focus: amber ring
- [x] Test in transaction filters
- [x] Test in settings forms

**Verification:**
- [x] No hardcoded slate colors remain
- [x] Dropdown uses correct dark theme colors

---

### 2.5 Checkbox Component
**File:** `src/components/ui/checkbox.tsx`
**Prompt Reference:** Prompt 5
**Fixes:** UI_AUDIT #17

- [x] Increase size from 16x16 to 20x20 (`h-5 w-5`)
- [x] Set checked state background: `--accent-primary`
- [x] Add focus ring: `focus-visible:ring-2 focus-visible:ring-[--accent-primary]`
- [x] Remove cyan references
- [x] Test in signup form (terms checkbox)
- [x] Test in settings (notification toggles)

**Verification:**
- [x] Checkbox is larger (meets 44px touch target with padding)
- [x] Checked state shows amber

---

### 2.6 Switch Component
**File:** `src/components/ui/switch.tsx`
**Prompt Reference:** Prompt 5

- [x] Set track (off): `bg-muted`
- [x] Set track (on): `bg-[--accent-primary]`
- [x] Set thumb: white
- [x] Add focus ring: `focus-visible:ring-2 focus-visible:ring-[--accent-primary]`
- [x] Test in notification settings

**Verification:**
- [x] Switch "on" state is amber

---

### 2.7 Badge Component
**File:** `src/components/ui/badge.tsx`
**Prompt Reference:** Prompt 6

- [x] Add `buy` variant:
  - [x] Background: `rgba(0, 200, 83, 0.15)`
  - [x] Text: `#00C853`
- [x] Add `sell` variant:
  - [x] Background: `rgba(255, 82, 82, 0.15)`
  - [x] Text: `#FF5252`
- [x] Add `new` variant:
  - [x] Background: `--accent-primary` (solid)
  - [x] Text: `#0D0D0D`
- [x] Add `premium` variant:
  - [x] Background: `rgba(212, 175, 55, 0.15)`
  - [x] Text: `#D4AF37`
- [x] Set common styles:
  - [x] Padding: 2px 8px
  - [x] Border-radius: 4px
  - [x] Font-size: 11px
  - [x] Font-weight: 600
  - [x] Text-transform: uppercase
  - [x] Letter-spacing: 0.04em
- [x] Update existing variants to use CSS variables

**Verification:**
- [x] BUY badge is green with icon
- [x] SELL badge is red with icon
- [x] NEW badge is solid amber

---

### 2.8 Tabs Component
**File:** `src/components/ui/tabs.tsx`
**Prompt Reference:** Prompt 7
**Fixes:** UI_AUDIT #14, #15

- [x] Update TabsList:
  - [x] Remove hardcoded slate colors
  - [x] Use `bg-muted`
  - [x] Border-radius: 6px
  - [x] Padding: 4px
- [x] Update TabsTrigger:
  - [x] Default: `text-muted-foreground`, `bg-transparent`
  - [x] Hover: `text-foreground`
  - [x] Active: `bg-background`, `text-foreground`, amber bottom border
- [x] Add focus ring: `focus-visible:ring-2 focus-visible:ring-[--accent-primary]`
- [x] Add `aria-label` prop support to TabsList
- [x] Test in company detail page
- [x] Test in institutions page

**Verification:**
- [x] Active tab has amber underline
- [x] No hardcoded colors remain

---

### 2.9 Skeleton Component
**File:** `src/components/ui/skeleton.tsx`
**Prompt Reference:** Prompt 8

- [x] Add shimmer animation keyframes:
  ```css
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  ```
- [x] Update base skeleton:
  - [x] Background gradient: `--bg-hover` → `--bg-elevated` → `--bg-hover`
  - [x] Background-size: 200% 100%
  - [x] Animation: shimmer 1.5s infinite
- [x] Create/export variants:
  - [x] `SkeletonText` (h-3.5, varying widths)
  - [x] `SkeletonHeading` (h-6, w-1/2)
  - [x] `SkeletonAvatar` (40x40, rounded-full)
  - [x] `SkeletonButton` (h-9, w-24)
  - [x] `SkeletonCard` (h-32)
  - [x] `SkeletonTableRow` (h-13 comfortable, h-9 compact)
  - [x] `SkeletonChart` (h-48)

**Verification:**
- [x] Skeleton has shimmer animation (not just pulse)
- [x] Animation is smooth and not jarring

---

## Phase 3: Data Tables

### 3.1 Sticky Table Headers
**Files:** `src/components/dashboard/transaction-table.tsx`, `src/components/ui/table.tsx`
**Prompt Reference:** Prompt 9

- [x] Add scroll container wrapper:
  - [x] `max-height: calc(100vh - 200px)`
  - [x] `overflow: auto`
  - [x] Border and border-radius
- [x] Update table headers (`thead th`):
  - [x] `position: sticky`
  - [x] `top: 0`
  - [x] `z-index: 20`
  - [x] Glassmorphism: `bg-[--glass-bg]`, `backdrop-blur-[12px]`
  - [x] Border-bottom
  - [x] Font: 11px, uppercase, letter-spacing 0.05em
  - [x] Color: `--text-tertiary`
- [x] Make first column sticky:
  - [x] `position: sticky`
  - [x] `left: 0`
  - [x] `z-index: 10`
  - [x] Opaque background (not glass)
  - [x] Border-right
- [x] Set corner cell `z-index: 30`
- [x] Style number columns:
  - [x] `text-align: right`
  - [x] `font-family: var(--font-mono)`
  - [x] `font-variant-numeric: tabular-nums`
- [x] Add row hover: `bg-[--bg-hover]`
- [x] Add `scope="col"` to all th elements

**Verification:**
- [x] Headers stay visible when scrolling
- [x] First column stays visible when scrolling horizontally
- [x] Glassmorphism effect visible on headers
- [x] Numbers align properly in columns

---

### 3.2 Sparklines
**Files:** `src/components/dashboard/transaction-table.tsx`, `src/components/charts/trend-sparkline.tsx`
**Prompt Reference:** Prompt 10

- [x] Create TrendSparkline component (or update existing):
  - [x] Props: `data: number[]`, `trend: 'up' | 'down' | 'neutral'`
  - [x] Width: 60-80px
  - [x] Height: 24px
  - [x] SVG-based
  - [x] No axes/gridlines/labels
  - [x] Stroke-width: 1.5px
  - [x] Stroke-linecap: round
- [x] Implement color by trend:
  - [x] Up: `--signal-positive`
  - [x] Down: `--signal-negative`
  - [x] Neutral: `--text-muted`
- [x] Add end-point dot (radius 2.5px)
- [x] Add to TransactionTable:
  - [x] New column "6M Trend"
  - [x] Position after Value column
  - [x] Hide on mobile
- [x] Add `aria-label` describing trend

**Verification:**
- [x] Sparklines render correctly
- [x] Colors match trend direction
- [x] Hidden on small screens

---

### 3.3 Density Toggle
**Files:** `src/components/dashboard/transaction-table.tsx`, `src/components/dashboard/density-toggle.tsx` (create)
**Prompt Reference:** Prompt 11

- [x] Create DensityToggle component:
  - [x] Two options: "Comfortable" | "Compact"
  - [x] Segmented control style
  - [x] Active: `bg-[--accent-primary]`, dark text
  - [x] Inactive: transparent, `text-tertiary`
  - [x] Container: `bg-[--bg-elevated]`, padding 4px, rounded
- [x] Define density specifications:
  - [x] Comfortable: row 52px, padding 14px 16px, font 13px
  - [x] Compact: row 36px, padding 8px 12px, font 12px
- [x] Add state management to TransactionTable
- [x] Store preference in localStorage
- [x] Position in results summary bar

**Verification:**
- [x] Toggle switches between densities
- [x] Preference persists on page reload
- [x] Table adjusts row heights correctly

---

## Phase 4: Navigation

### 4.1 Sidebar Update
**File:** `src/components/dashboard/sidebar.tsx`  
**Prompt Reference:** Prompt 12

#### Structure
- [x] Set width: 256px desktop, 64px collapsed, hidden mobile
- [x] Set background: `--bg-card`
- [x] Set border-right: `--border-default`

#### Logo Section
- [x] Padding: 20px
- [x] Border-bottom: `--border-subtle`
- [x] Logo icon: 32x32, amber background, rounded 8px

#### Search Trigger
- [x] Style like input (clickable)
- [x] Background: `--bg-app`
- [x] Border: `--border-default`
- [x] Placeholder: "Search... ⌘K"
- [x] On click: open Command Palette

#### Navigation Items
- [x] Padding: 10px 12px
- [x] Border-radius: 6px
- [x] Font: 14px, weight 500
- [x] Icon: 20px, opacity 0.7
- [x] Default state: `text-secondary`, transparent bg
- [x] Hover state: `text-primary`, `bg-hover`
- [x] Active state:
  - [x] Background: `--accent-primary-muted`
  - [x] Text: `--accent-primary`
  - [x] Left border: 3px solid `--accent-primary`
  - [x] Icon opacity: 1

#### Section Labels
- [x] Font: 11px, uppercase, letter-spacing 0.05em
- [x] Color: `--text-muted`

#### Remove Cyan
- [x] Replace all cyan references with amber
- [x] Test active state styling

**Verification:**
- [x] Active nav item shows amber indicator
- [x] Hover states work correctly
- [x] Mobile menu works

---

### 4.2 Command Palette
**File:** `src/components/dashboard/command-palette.tsx` (create)  
**Prompt Reference:** Prompt 13

#### Triggers
- [x] ⌘K (Mac) / Ctrl+K (Windows) keyboard shortcut
- [x] Click on sidebar search
- [x] "/" key when not in input

#### Visual Design
- [x] Backdrop: `rgba(0, 0, 0, 0.6)`, `backdrop-blur-[4px]`
- [x] Modal: max-width 560px, margin-top 15vh
- [x] Background: `--bg-card`
- [x] Border: `--border-default`, radius 12px
- [x] Shadow: 0 24px 48px rgba(0,0,0,0.4)
- [x] Animation: slideDown 150ms

#### Search Input
- [x] Full width, no border
- [x] Padding: 20px
- [x] Font-size: 18px
- [x] Border-bottom: `--border-default`
- [x] Placeholder: "Search tickers, views, or actions..."

#### Results
- [x] Max-height: 360px, overflow-y auto
- [x] Padding: 8px
- [x] Item: flex with icon, label, shortcut
- [x] Item padding: 12px
- [x] Item hover: `bg-hover`
- [x] Item selected: `bg-[--accent-primary-muted]`

#### Search Categories
- [x] Tickers → /company/[ticker]
- [x] Navigation → page routes
- [x] Actions → Add to Watchlist, Export
- [x] Recent → last 3 viewed

#### Keyboard Navigation
- [x] ↑/↓: Navigate results
- [x] Enter: Select
- [x] Escape: Close
- [x] Tab: Cycle categories

#### Accessibility
- [x] Use Radix Dialog or similar
- [x] Focus trap when open
- [x] Return focus on close

**Verification:**
- [x] ⌘K opens palette
- [x] Can navigate with keyboard
- [x] Escape closes
- [x] Search filters results

---

## Phase 5: Page Layouts

### 5.1 Dashboard Page
**File:** `src/app/(dashboard)/dashboard/page.tsx`
**Prompt Reference:** Prompt 14

- [x] Update page header:
  - [x] Title: "Dashboard"
  - [x] Right: Date range selector
  - [x] Remove time-based greeting
- [x] Update metrics row:
  - [x] 4-column grid (2 on mobile)
  - [x] Gap: 16px
  - [x] Cards: Buys, Sells, Clusters, Watchlist
- [x] Implement content grid:
  - [x] Main: 2/3 width
  - [x] Sidebar: 1/3 width
  - [x] Gap: 24px
  - [x] Stack on mobile
- [x] Main content:
  - [x] "Recent Insider Activity" card
  - [x] "View All →" link
  - [x] TransactionTable (10 rows)
- [x] Sidebar:
  - [x] "Cluster Alerts" card
  - [x] "Watchlist Activity" card
- [x] Add Suspense boundaries with skeletons

**Verification:**
- [x] Layout matches wireframe
- [x] Responsive at all breakpoints
- [x] Loading states work

---

### 5.2 Insider Trades Page
**File:** `src/app/(dashboard)/insider-trades/page.tsx`
**Prompt Reference:** Prompt 15

- [x] Update page header:
  - [x] Title: "Insider Trades"
  - [x] Action: "Export CSV" button
- [x] Implement filter bar:
  - [x] Card-style container
  - [x] Search input with icon
  - [x] Type dropdown
  - [x] Date range dropdown
  - [x] Significance dropdown
  - [x] Clear filters button
- [x] Add results summary bar:
  - [x] "Showing X-Y of Z transactions"
  - [x] Density toggle
- [x] Update table:
  - [x] Full width
  - [x] Sticky headers + first column
  - [x] All columns per spec
- [x] Implement row expansion:
  - [x] AI Context paragraph
  - [x] Significance indicator
  - [x] Actions: View Company, Add to Watchlist
- [x] Add pagination

**Verification:**
- [x] Filters work correctly
- [x] Row expansion shows AI context
- [x] Pagination works

---

### 5.3 Institutions Page
**File:** `src/app/(dashboard)/institutions/page.tsx`
**Prompt Reference:** Prompt 16
**Fixes:** UI_AUDIT #35

- [x] Update page header
- [x] Implement tab navigation:
  - [x] Tabs: New Positions, Increased, Decreased, Closed, All
  - [x] Active: amber underline
  - [x] Count badges on tabs
  - [x] ARIA tab pattern
- [x] Add filter bar:
  - [x] Search input
  - [x] Quarter dropdown
  - [x] Minimum value dropdown
- [x] Update data table columns
- [x] Add empty states per tab
- [x] Fix InstitutionsTabs aria-label (UI_AUDIT #35)

**Verification:**
- [x] Tabs filter data correctly
- [x] ARIA attributes present
- [x] Empty states display

---

### 5.4 Watchlist Page
**Files:** `src/app/(dashboard)/watchlist/page.tsx`, `src/app/(dashboard)/watchlist/watchlist-client.tsx`
**Prompt Reference:** Prompt 17
**Fixes:** UI_AUDIT #146, #151

- [x] Update page header:
  - [x] Title with count
  - [x] "+ Add Ticker" button
- [x] Implement watchlist grid:
  - [x] 3 columns desktop, 2 tablet, 1 mobile
  - [x] Gap: 16px
- [x] Create watchlist card:
  - [x] Ticker (18px, bold)
  - [x] Company name (13px, tertiary)
  - [x] Sparkline
  - [x] Last activity
  - [x] Active indicator (green border + badge)
  - [x] Hover actions: View, Remove
- [x] Add removal confirmation dialog (fixes #151)
- [x] Implement activity feed:
  - [x] Grouped by date
  - [x] Item: ticker, description, AI preview
- [x] Create empty state
- [x] Refactor watchlist-client.tsx (fixes #146):
  - [x] Create WatchlistGrid component
  - [x] Create WatchlistCard component
  - [x] Create WatchlistActivityFeed component
  - [x] Create useWatchlist hook

**Verification:**
- [x] Grid layout responsive
- [x] Removal shows confirmation
- [x] Empty state displays
- [x] Client file is smaller/split

---

### 5.5 Company Detail Page
**Files:** `src/app/(dashboard)/company/[ticker]/page.tsx`, `src/components/dashboard/company-tabs.tsx`
**Prompt Reference:** Prompt 18
**Fixes:** UI_AUDIT #149

- [x] Update page header:
  - [x] Back link
  - [x] Title: "TICKER - Company Name"
  - [x] Subtitle: Sector, Market Cap
  - [x] Watchlist button
- [x] Implement metrics row (company-specific):
  - [x] Insider Buys (1Y)
  - [x] Insider Sells (1Y)
  - [x] Net Insider Activity
  - [x] Institutional Ownership
- [x] Implement tabs:
  - [x] Overview, Insider Activity, Institutional Holdings
  - [x] ARIA labels
- [x] Overview tab content:
  - [x] 2-column layout
  - [x] Activity chart (12 months)
  - [x] Key insiders list
  - [x] Recent transactions
- [x] Insider Activity tab:
  - [x] Filters
  - [x] Full TransactionTable
- [x] Institutional Holdings tab:
  - [x] Top holders pie chart
  - [x] Recent changes
  - [x] Full holders table
- [x] Replace Card with DashboardCard (fixes #149)

**Verification:**
- [x] All tabs render correctly
- [x] Charts display
- [x] Watchlist toggle works

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
| Jan 17, 2026 | 51 | **Phase 1-3 Complete**: All CSS variables, typography, core components (Button, Card, Input, Select, Checkbox, Switch, Badge, Tabs, Skeleton), and data table features (sticky headers, sparklines, density toggle) implemented and verified |
| Jan 17, 2026 | 63 | **Phase 4 Complete**: Sidebar and Command Palette fully implemented with amber accents, keyboard shortcuts (⌘K, /), focus traps, and accessibility features. Fixed hardcoded colors in DashboardShell |
| Jan 17, 2026 | 83 | **Phase 5 Complete**: All page layouts verified and updated (Dashboard, Insider Trades, Institutions, Watchlist, Company Detail). Added density toggle to Insider Trades page with state management via new client component |
| | | |

---

*Last updated: January 17, 2026*
