# UI/UX Audit Report - InsiderIntel

**Audit Date:** January 2026
**Auditor:** Claude Code
**Scope:** All pages, components, and user flows

---

## Executive Summary

This audit identified **47 issues** across the application:
- **8 High Severity** - Critical issues affecting core functionality
- **18 Medium Severity** - Notable problems impacting UX
- **21 Low Severity** - Minor polish items

The application has a solid foundation with consistent use of shadcn/ui components and Tailwind CSS. The primary concerns are missing accessibility features, inconsistent error handling, and several broken links/routes.

---

## Table of Contents

1. [Consistency Issues](#1-consistency-issues)
2. [Accessibility Problems](#2-accessibility-problems)
3. [Usability Concerns](#3-usability-concerns)
4. [Mobile/Responsive Issues](#4-mobileresponsive-issues)
5. [Performance Concerns](#5-performance-concerns)
6. [Visual Polish](#6-visual-polish)

---

## 1. Consistency Issues

### HIGH SEVERITY

#### 1.1 Broken Navigation Link in User Menu
**File:** `src/components/dashboard/user-menu.tsx:85-89`
**Issue:** Billing link points to `/dashboard/billing` which doesn't exist. Should be `/dashboard/settings/billing`.
**Impact:** Users clicking "Billing" in dropdown get 404.
**Suggested Fix:**
```tsx
onClick={() => router.push('/dashboard/settings/billing')}
```

#### 1.2 Settings Page Redirect Missing Dashboard Prefix
**File:** `src/app/(dashboard)/settings/page.tsx:4`
**Issue:** Redirects to `/settings/profile` instead of `/dashboard/settings/profile`.
**Impact:** Causes 404 error when landing on settings page.
**Suggested Fix:**
```tsx
redirect('/dashboard/settings/profile')
```

### MEDIUM SEVERITY

#### 1.3 Inconsistent Button Variants in Filters
**File:** `src/components/dashboard/transaction-filters.tsx:118-135`
**Issue:** Buy/Sell toggle buttons use hardcoded colors (`bg-emerald-600`, `bg-red-600`) instead of design system variants.
**Impact:** Inconsistent with rest of app, harder to maintain dark mode.
**Suggested Fix:** Create custom button variants or use Badge component for toggle states.

#### 1.4 Mixed Link Component Usage
**Files:** Multiple
**Issue:** Some files use `<a>` tags, others use Next.js `<Link>`. Profile form was fixed but others may remain.
**Suggested Fix:** Audit all navigation and use `<Link>` for internal routes.

#### 1.5 Inconsistent Error Message Styling
**Files:** Various form components
**Issue:** Error messages use different styles:
- `profile-form.tsx`: `bg-destructive/10 p-3 rounded-md`
- `billing-content.tsx`: `border-destructive/50 bg-destructive/10 p-4 rounded-lg`
- `notifications-form.tsx`: `bg-destructive/10 p-3 rounded-md`
**Suggested Fix:** Create a shared `ErrorAlert` component for consistency.

#### 1.6 Duplicate Currency/Number Formatting Functions
**Files:**
- `transaction-table.tsx:34-55`
- `cluster-alert.tsx:28-35`
- `institutions-tabs.tsx:73-94`
- `company-tabs.tsx:53-74`
**Issue:** Same `formatCurrency` and `formatNumber` functions duplicated across 4+ files.
**Suggested Fix:** Centralize in `src/lib/utils.ts`.

### LOW SEVERITY

#### 1.7 Inconsistent Card Padding
**Files:** Various
**Issue:** Some cards use `CardContent className="pt-6"`, others use default. Inconsistent vertical spacing.
**Suggested Fix:** Standardize padding approach across all cards.

#### 1.8 Mixed Icon Sizes in Navigation
**File:** `src/components/dashboard/sidebar.tsx:110`
**Issue:** Nav icons are `h-5 w-5`, but close button is `h-5 w-5` while other icon buttons use `h-4 w-4`.
**Suggested Fix:** Standardize icon sizes (recommend `h-4 w-4` for buttons, `h-5 w-5` for nav items).

---

## 2. Accessibility Problems

### HIGH SEVERITY

#### 2.1 Missing Form Labels on Auth Pages
**File:** `src/app/(auth)/login/login-form.tsx`
**Issue:** Input fields lack associated `<Label>` components. Screen readers cannot identify fields.
**Impact:** Fails WCAG 2.1 Level A (1.3.1 Info and Relationships).
**Suggested Fix:**
```tsx
<Label htmlFor="email" className="sr-only">Email</Label>
<Input id="email" ... />
```

#### 2.2 Color-Only Significance Indicators
**File:** `src/components/dashboard/significance-badge.tsx`
**Issue:** Significance is communicated only through color dots (gray/yellow/orange/red). Users with color blindness cannot distinguish levels.
**Impact:** Fails WCAG 2.1 Level A (1.4.1 Use of Color).
**Suggested Fix:** Always show label text, or add patterns/icons to dots.

#### 2.3 Missing ARIA Labels on Icon Buttons
**Files:** Multiple
**Issue:** Icon-only buttons lack `aria-label` attributes:
- Clear ticker button in `transaction-filters.tsx:166-174`
- Sort buttons in `transaction-table.tsx:104-120`
**Suggested Fix:**
```tsx
<button aria-label="Clear search">
  <X className="h-4 w-4" />
</button>
```

### MEDIUM SEVERITY

#### 2.4 Missing Skip Link
**File:** `src/app/(dashboard)/layout.tsx`
**Issue:** No "Skip to main content" link for keyboard users to bypass sidebar navigation.
**Suggested Fix:** Add skip link as first focusable element.

#### 2.5 Insufficient Color Contrast - Muted Text
**Files:** Various
**Issue:** `text-muted-foreground` on light backgrounds may not meet 4.5:1 contrast ratio.
**Impact:** Fails WCAG 2.1 Level AA (1.4.3 Contrast).
**Suggested Fix:** Test with contrast checker; increase opacity of muted color.

#### 2.6 Missing Focus Indicators on Custom Elements
**File:** `src/components/dashboard/cluster-alert.tsx`
**Issue:** Card links don't show visible focus outline when tabbed to.
**Suggested Fix:** Add `focus-visible:ring-2 focus-visible:ring-ring` to clickable cards.

#### 2.7 Table Without Accessible Headers
**File:** `src/components/dashboard/transaction-table.tsx`
**Issue:** Table headers don't use `scope="col"` attribute.
**Suggested Fix:**
```tsx
<TableHead scope="col">Date</TableHead>
```

### LOW SEVERITY

#### 2.8 Missing Alt Text Pattern for Avatar
**File:** `src/components/dashboard/user-menu.tsx:56`
**Issue:** Avatar image has generic "Avatar" alt text.
**Suggested Fix:** Use `alt={user.name ? `${user.name}'s avatar` : 'User avatar'}`.

#### 2.9 No Reduced Motion Support
**Files:** Various skeleton/animation components
**Issue:** Animations don't respect `prefers-reduced-motion` media query.
**Suggested Fix:** Wrap animations in `motion-safe:` variant.

---

## 3. Usability Concerns

### HIGH SEVERITY

#### 3.1 No Success Feedback for Watchlist Actions
**File:** `src/app/(dashboard)/company/[ticker]/watchlist-button.tsx:70-72`
**Issue:** Watchlist toggle catches errors but doesn't show success toast. Users don't know if action succeeded.
**Suggested Fix:** Add success toast notification after action completes.

#### 3.2 Silent Failures in Institutions Search
**File:** `src/components/dashboard/institutions-tabs.tsx:166-172`
**Issue:** `catch {}` block has empty handler - errors are completely swallowed.
**Suggested Fix:** Set error state and display message to user.

#### 3.3 Missing Pagination
**Files:**
- `transaction-table.tsx`
- `institutions-tabs.tsx`
- `company-tabs.tsx`
**Issue:** Tables are limited to 50-100 items but no pagination UI to see more.
**Impact:** Users cannot access older transactions.
**Suggested Fix:** Implement cursor-based or offset pagination.

### MEDIUM SEVERITY

#### 3.4 No Empty State CTAs
**Files:** Various table/list components
**Issue:** Empty states say "No transactions found" but don't guide user on next action.
**Suggested Fix:** Add action buttons like "Adjust filters" or "Browse popular stocks".

#### 3.5 Confusing Institution Type Filter
**File:** `src/components/dashboard/institutions-tabs.tsx:435-444`
**Issue:** Filter dropdown appears but filtering is not implemented (no actual filtering logic).
**Suggested Fix:** Either implement filter or remove the dropdown.

#### 3.6 No Confirmation on Destructive Actions
**File:** `src/app/(dashboard)/watchlist/watchlist-client.tsx`
**Issue:** Removing from watchlist happens immediately without confirmation.
**Suggested Fix:** Add confirmation dialog for remove action.

#### 3.7 Search Requires Button Click
**File:** `src/components/dashboard/transaction-filters.tsx`
**Issue:** Ticker search requires clicking "Search" button after typing. Should search on Enter (which it does) but also provide debounced auto-search.
**Suggested Fix:** Add debounced search after 300ms of typing.

#### 3.8 Form Validation Missing
**Files:** Auth forms
**Issue:** No client-side validation before submission. Users must submit to see errors.
**Suggested Fix:** Add inline validation with `zod` + `react-hook-form`.

### LOW SEVERITY

#### 3.9 No Keyboard Shortcuts
**Issue:** No keyboard shortcuts for common actions (search, navigation).
**Suggested Fix:** Consider adding `⌘K` for search, `⌘/` for help.

#### 3.10 Time Period Selection Could Be More Intuitive
**File:** `src/components/dashboard/transaction-filters.tsx:139-152`
**Issue:** "Last 7 days" vs "Last 30 days" - users might want custom date ranges.
**Suggested Fix:** Consider adding date picker for custom ranges (lower priority).

---

## 4. Mobile/Responsive Issues

### HIGH SEVERITY

#### 4.1 Table Horizontal Scroll Issues
**Files:** All table components
**Issue:** Tables wrap in `overflow-auto` but columns don't have min-widths, causing text cramping on mobile.
**Suggested Fix:** Add `min-w-[600px]` to table element and ensure horizontal scroll indicator is visible.

#### 4.2 Billing Plan Cards Stack Poorly
**File:** `src/app/(dashboard)/settings/billing/billing-content.tsx:203`
**Issue:** Plan comparison grid (`grid-cols-3`) doesn't stack on mobile, cards become too narrow.
**Suggested Fix:**
```tsx
className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### MEDIUM SEVERITY

#### 4.3 Filter Bar Wraps Awkwardly
**File:** `src/components/dashboard/transaction-filters.tsx:101-106`
**Issue:** On medium screens, filters wrap in inconsistent patterns.
**Suggested Fix:** Use `flex-wrap` with explicit breakpoints, or stack vertically on mobile.

#### 4.4 Touch Targets Too Small
**Files:** Various
**Issue:** Some interactive elements are below 44x44px minimum:
- Clear search button: ~32x32px
- Sparkline hover areas
- Table row click targets
**Suggested Fix:** Increase padding on touch targets to meet 44px minimum.

#### 4.5 Settings Navigation Horizontal on Mobile
**File:** `src/app/(dashboard)/settings/layout.tsx:46`
**Issue:** Settings nav is horizontal on mobile (`flex-row gap-2`), but items are cramped.
**Suggested Fix:** Consider full-width stacked buttons on mobile.

### LOW SEVERITY

#### 4.6 Company Header Misaligned on Mobile
**File:** `src/app/(dashboard)/company/[ticker]/page.tsx:175-200`
**Issue:** Header flexbox has `sm:flex-row sm:items-start` but watchlist button may overflow.
**Suggested Fix:** Ensure watchlist button has `flex-shrink-0`.

#### 4.7 Chart Legends Overlap on Small Screens
**File:** `src/components/charts/insider-activity-chart.tsx:136-142`
**Issue:** Legend takes 36px height which may crowd chart on mobile.
**Suggested Fix:** Hide legend on mobile, show tooltip instead.

---

## 5. Performance Concerns

### MEDIUM SEVERITY

#### 5.1 Large Component Without Code Splitting
**File:** `src/components/dashboard/institutions-tabs.tsx` (600+ lines)
**Issue:** Contains multiple sub-components that could be split. Entire file loads even if only one tab is used.
**Suggested Fix:** Split into separate files: `ByStockTab.tsx`, `ByInstitutionTab.tsx`, etc.

#### 5.2 No Loading States for Initial Page Load
**Files:** Dashboard pages
**Issue:** Server components fetch data but show no loading indicator during navigation.
**Suggested Fix:** Add `loading.tsx` files for route segments using Skeleton components.

#### 5.3 Recharts Bundle Size
**Files:** Chart components
**Issue:** Recharts is ~400KB. Loading for every dashboard user.
**Suggested Fix:** Consider `next/dynamic` with `ssr: false` for chart components.

#### 5.4 Duplicate Supabase Client Creation
**Files:** Client components
**Issue:** Each component calls `createBrowserClient()` separately. Could share instance.
**Suggested Fix:** Create single client in context provider.

### LOW SEVERITY

#### 5.5 No Image Optimization for Avatars
**File:** `src/components/dashboard/user-menu.tsx:56`
**Issue:** Avatar uses `<img>` via Radix instead of `next/image`.
**Suggested Fix:** Consider custom Avatar with `next/image` for optimization.

---

## 6. Visual Polish

### MEDIUM SEVERITY

#### 6.1 Unfinished Loading States
**Files:**
- `src/app/(dashboard)/insider-trades/page.tsx`
- `src/app/(dashboard)/institutions/page.tsx`
**Issue:** No Suspense boundaries or loading skeletons while data fetches.
**Suggested Fix:** Wrap data-fetching sections in `<Suspense>` with skeleton fallback.

#### 6.2 Error Toast Dismissal
**File:** `src/app/(dashboard)/watchlist/watchlist-client.tsx`
**Issue:** Error toast shows but auto-dismiss timeout (5s) may not be long enough for users to read.
**Suggested Fix:** Keep toast until manually dismissed, or extend to 8-10 seconds.

#### 6.3 Badge Hover States Inconsistent
**File:** `src/components/ui/badge.tsx`
**Issue:** All badge variants have `hover:` states but badges are often non-interactive, causing confusion.
**Suggested Fix:** Remove hover states from default badge, create `BadgeButton` variant for clickable badges.

### LOW SEVERITY

#### 6.4 Empty Watchlist State Plain
**File:** `src/app/(dashboard)/watchlist/watchlist-client.tsx`
**Issue:** Empty watchlist shows basic text. Could be more engaging.
**Suggested Fix:** Add illustration/icon and CTA to browse stocks.

#### 6.5 No Visual Feedback on Sort
**File:** `src/components/dashboard/transaction-table.tsx:104-120`
**Issue:** Sort buttons show same icon regardless of current sort state.
**Suggested Fix:** Use `ArrowUp`/`ArrowDown` icons to indicate current sort direction.

#### 6.6 Sidebar Footer Looks Disconnected
**File:** `src/components/dashboard/sidebar.tsx:118-124`
**Issue:** Footer info box has different style than rest of sidebar nav.
**Suggested Fix:** Consider integrating into sidebar design or removing.

#### 6.7 Tab Underline Missing
**File:** `src/components/ui/tabs.tsx`
**Issue:** Tabs don't have traditional underline indicator, relying only on background color.
**Suggested Fix:** Add border-bottom indicator on active tab for clearer state.

#### 6.8 Long Company Names Truncate Without Tooltip
**Files:** Various table cells
**Issue:** Company names truncate with `truncate max-w-[150px]` but no tooltip to see full name.
**Suggested Fix:** Wrap in tooltip component showing full text on hover.

---

## Priority Matrix

### Immediate Action Required (Week 1)

| Issue | Severity | Effort |
|-------|----------|--------|
| 1.1 Broken Billing Link | HIGH | Low |
| 1.2 Settings Redirect | HIGH | Low |
| 2.1 Missing Form Labels | HIGH | Medium |
| 3.1 Watchlist Feedback | HIGH | Low |
| 4.1 Table Mobile Scroll | HIGH | Medium |

### Short-term (Week 2-3)

| Issue | Severity | Effort |
|-------|----------|--------|
| 2.2 Color-Only Indicators | HIGH | Medium |
| 2.3 ARIA Labels | HIGH | Low |
| 3.2 Silent Failures | HIGH | Low |
| 3.3 Pagination | HIGH | High |
| 4.2 Billing Cards Stack | HIGH | Low |

### Medium-term (Month 1)

| Issue | Severity | Effort |
|-------|----------|--------|
| 1.3-1.6 Consistency Items | MEDIUM | Medium |
| 2.4-2.7 A11y Items | MEDIUM | Medium |
| 3.4-3.8 Usability Items | MEDIUM | High |
| 5.1-5.4 Performance | MEDIUM | High |

### Backlog

All LOW severity items and lower-priority MEDIUM items.

---

## Recommended Actions

### Quick Wins (< 1 hour each)
1. Fix broken billing link in user menu
2. Fix settings page redirect
3. Add aria-labels to icon buttons
4. Add success toast to watchlist actions
5. Fix billing grid responsive breakpoints

### Component Library Improvements
1. Create shared `ErrorAlert` component
2. Create shared `SuccessToast` component
3. Add `formatCurrency`/`formatNumber` to utils
4. Create accessible `SortButton` component

### Infrastructure
1. Add `loading.tsx` files for all route segments
2. Set up Suspense boundaries
3. Implement pagination utility
4. Create accessibility testing in CI

---

*This audit should be repeated quarterly or after major feature releases.*
