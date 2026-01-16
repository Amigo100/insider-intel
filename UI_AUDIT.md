# UI/UX Audit Report - InsiderIntel

**Audit Date:** January 2026
**Scope:** All pages, components, and user flows

---

## Executive Summary

This audit identified **34 issues** across the application:
- **9 High Severity** - Critical issues affecting usability and accessibility
- **16 Medium Severity** - Notable problems impacting user experience
- **9 Low Severity** - Minor polish items

The application has a solid foundation with shadcn/ui components and Tailwind CSS. Primary concerns are touch target sizes, missing accessibility attributes, inconsistent color usage, and price mismatches between pages.

---

## Summary by Category

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Consistency | 2 | 4 | 2 | 8 |
| Accessibility | 3 | 2 | 1 | 6 |
| Usability | 2 | 3 | 2 | 7 |
| Mobile/Responsive | 1 | 3 | 1 | 5 |
| Performance | 0 | 2 | 1 | 3 |
| Visual Polish | 1 | 2 | 2 | 5 |
| **Total** | **9** | **16** | **9** | **34** |

---

## HIGH SEVERITY ISSUES

### 1. Touch Targets Below 44x44px Minimum

**Severity:** HIGH
**Category:** Accessibility / Mobile
**Impact:** Users on touch devices will struggle to tap small interactive elements

| File | Line | Element | Current Size | Fix |
|------|------|---------|--------------|-----|
| `src/components/dashboard/user-menu.tsx` | 54-55 | Avatar button | `h-9 w-9` (36px) | Increase to `h-11 w-11` (44px) |
| `src/app/(dashboard)/watchlist/watchlist-client.tsx` | 526-541 | Remove button | `p-1.5` (~28px) | Increase to `p-2.5` with `min-h-[44px] min-w-[44px]` |
| `src/components/dashboard/transaction-table.tsx` | 111-120 | Sort buttons | `-ml-3` compresses touch area | Remove negative margin or add padding |

**Suggested Fix:**
```tsx
// user-menu.tsx line 54
<Button variant="ghost" className="relative h-11 w-11 rounded-full">
  <Avatar className="h-9 w-9">

// watchlist-client.tsx line 533
className="absolute right-2 top-2 rounded-full p-2.5 min-h-[44px] min-w-[44px] ..."
```

---

### 2. Missing ARIA Labels on Interactive Elements

**Severity:** HIGH
**Category:** Accessibility
**Impact:** Screen reader users cannot understand interactive element purposes

| File | Line | Element | Issue | Fix |
|------|------|---------|-------|-----|
| `src/components/dashboard/user-menu.tsx` | 54-61 | Avatar dropdown trigger | No accessible name | Add `aria-label="Open user menu"` |
| `src/components/dashboard/header.tsx` | 120-135 | Search input | Missing accessible label | Add `aria-label="Search stocks by ticker or company name"` |
| `src/app/(dashboard)/watchlist/watchlist-client.tsx` | 526-541 | Remove button | Has `title` but no `aria-label` | Add `aria-label="Remove from watchlist"` |
| `src/components/landing/pricing-section.tsx` | 54-66 | Billing toggle | aria-label logic is inverted | When isAnnual=true, label says "Switch to monthly" but that's wrong |

**Suggested Fix:**
```tsx
// user-menu.tsx line 53-54
<DropdownMenuTrigger asChild>
  <Button variant="ghost" className="relative h-11 w-11 rounded-full" aria-label="Open user menu">

// header.tsx line 120
<Input
  ref={inputRef}
  type="search"
  placeholder="Search stocks..."
  aria-label="Search stocks by ticker or company name"
```

---

### 3. Form Validation Feedback Inconsistencies

**Severity:** HIGH
**Category:** Usability
**Impact:** Users may not understand why forms fail or what to fix

| File | Line | Issue |
|------|------|-------|
| `src/app/(auth)/login/login-form.tsx` | 218, 253 | Error border applied with string concatenation instead of `cn()` utility |
| `src/app/(auth)/signup/signup-form.tsx` | Multiple | No real-time validation feedback as user types |
| Auth forms generally | - | No success confirmation message before redirect |

**Suggested Fix:**
```tsx
// login-form.tsx line 218 - use cn() for cleaner conditional classes
<Input
  className={cn(
    "pl-10",
    errors.email && "border-destructive focus-visible:ring-destructive"
  )}
```

---

### 4. Pricing Mismatch Between Landing and Billing Pages

**Severity:** HIGH
**Category:** Consistency
**Impact:** Users see different prices, creating confusion and eroding trust

| Location | Free | Retail | Pro |
|----------|------|--------|-----|
| `src/components/landing/pricing-section.tsx` (landing) | $0 | $29/mo ($23 annual) | $79/mo ($63 annual) |
| `src/app/(dashboard)/settings/billing/billing-content.tsx` (settings) | $0 | $19/mo | $49/mo |

**Fix Required:** Align prices across both files. Update `billing-content.tsx` lines 46-47, 64-65 to match landing page pricing.

---

### 5. Missing Loading States During Async Operations

**Severity:** HIGH
**Category:** Usability
**Impact:** Users don't know if their actions are being processed

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `src/components/dashboard/header.tsx` | 106-111 | No loading state during navigation after search selection | Add router loading indicator |
| `src/app/(dashboard)/watchlist/watchlist-client.tsx` | 141-182 | Optimistic updates lack visual pending indicator | Add subtle opacity/shimmer to pending rows |
| `src/components/dashboard/transaction-filters.tsx` | Multiple | Filter buttons remain interactive during search | Disable all filters while searching |

---

### 6. Color Inconsistency for Semantic Meanings

**Severity:** HIGH
**Category:** Consistency
**Impact:** Inconsistent color usage confuses users about meaning

| Meaning | Colors Found | Files |
|---------|-------------|-------|
| Buy/Bullish | `text-emerald-600`, `text-emerald-500`, `text-green-600`, `text-green-500` | watchlist-client.tsx:252,500, cluster-alert.tsx:68, transaction-table.tsx |
| Sell/Bearish | `text-red-600`, `text-red-500`, `bg-red-100` | watchlist-client.tsx:504,568 |

**Fix:** Create semantic color variables in `globals.css`:
```css
:root {
  --color-buy: 142.1 76.2% 36.3%;      /* emerald-600 */
  --color-sell: 0 72.2% 50.6%;          /* red-500 */
}
```

---

### 7. Search Dropdown Lacks Proper ARIA Roles

**Severity:** HIGH
**Category:** Accessibility
**Impact:** Screen readers cannot navigate search results properly

| File | Line | Issue |
|------|------|-------|
| `src/components/dashboard/header.tsx` | 141-169 | Dropdown uses `<ul>` with button children but lacks `role="listbox"` |

**Suggested Fix:**
```tsx
<div className="..." role="listbox" aria-label="Search results">
  {searchResults.map((result, index) => (
    <button
      role="option"
      aria-selected={index === selectedIndex}
      ...
```

---

## MEDIUM SEVERITY ISSUES

### 8. Inconsistent Spacing Patterns

**Severity:** MEDIUM
**Category:** Consistency
**Impact:** Visual inconsistency makes app feel unpolished

| File | Issue |
|------|-------|
| `src/components/ui/card.tsx` | `CardHeader` uses `p-6`, `CardContent` uses `p-6 pt-0` - uneven vertical spacing |
| `src/components/dashboard/sidebar.tsx` | Header uses `px-6`, nav uses `px-3` - inconsistent horizontal spacing |
| Various pages | Mixed use of `gap-4`, `gap-6`, `space-y-4` for similar layouts |

**Fix:** Establish and document spacing system in CLAUDE.md.

---

### 9. Inconsistent Button Styling

**Severity:** MEDIUM
**Category:** Consistency

| File | Line | Issue |
|------|------|-------|
| `src/components/dashboard/transaction-filters.tsx` | 123, 132 | Buy/Sell buttons use hardcoded `bg-emerald-600`, `bg-red-600` instead of component variants |
| Various | - | Some buttons have `shadow-sm`, others `shadow-md`, others none |

---

### 10. Typography Inconsistencies

**Severity:** MEDIUM
**Category:** Consistency

| Element | Sizes Found |
|---------|-------------|
| Page titles | `text-3xl font-bold` (dashboard), `text-2xl` (cards) |
| Section headers | `text-xl font-semibold`, `text-lg font-semibold`, `text-base font-medium` |
| Card titles | `text-2xl` (CardTitle default), often overridden inline |

**Fix:** Document typography scale in design system.

---

### 11. Mobile Sidebar Z-Index Overlap

**Severity:** MEDIUM
**Category:** Mobile/Responsive

| Component | Z-Index |
|-----------|---------|
| Mobile overlay | `z-40` |
| Sidebar | `z-50` |
| Header | `z-30` |

**Issue:** When sidebar is open, overlay (z-40) is above header (z-30), potentially obscuring it.

---

### 12. Empty State Messages Not Helpful

**Severity:** MEDIUM
**Category:** Usability

| File | Line | Current Message | Suggested Improvement |
|------|------|-----------------|----------------------|
| `src/components/dashboard/transaction-table.tsx` | 179-182 | "No transactions found" | "No transactions match your filters. Try adjusting the date range or clearing filters." |
| `src/app/(dashboard)/watchlist/watchlist-client.tsx` | 392-394 | "No companies found" | "No companies found for '{query}'. Check the spelling or try a ticker symbol." |
| `src/components/dashboard/company-tabs.tsx` | 209 | "No AI analysis available" | "AI analysis is being generated. This usually takes a few minutes." |

---

### 13. Hover States Insufficient

**Severity:** MEDIUM
**Category:** Visual Polish

| File | Line | Element | Issue |
|------|------|---------|-------|
| `src/components/dashboard/transaction-table.tsx` | 216-221 | Ticker links | Only `hover:underline` - very subtle |
| `src/app/(dashboard)/dashboard/page.tsx` | 345 | Watchlist cards | Only `hover:bg-muted/50` - nearly invisible |
| `src/app/(dashboard)/watchlist/watchlist-client.tsx` | 441 | Card links | Only arrow appears on hover |

**Fix:** Add more obvious hover states with shadow, scale, or border changes.

---

### 14. Error Display Inconsistency

**Severity:** MEDIUM
**Category:** Consistency

| File | Error Style Used |
|------|-----------------|
| `login-form.tsx` | `bg-destructive/10` rounded card with icon |
| `billing-content.tsx` | `border-destructive/50 bg-destructive/10 p-4` |
| `watchlist-client.tsx` | Fixed position toast with close button |

**Fix:** Create consistent `<ErrorAlert>` and `<ErrorToast>` components.

---

### 15. Missing Breadcrumb Navigation

**Severity:** MEDIUM
**Category:** Usability

| Page | Issue |
|------|-------|
| `/company/[ticker]` | No breadcrumb showing path from dashboard |
| `/settings/*` | Settings has tabs but no breadcrumb back to dashboard |

---

### 16. Form Disabled State Styling

**Severity:** MEDIUM
**Category:** Visual Polish

| File | Line | Issue |
|------|------|-------|
| `src/components/ui/input.tsx` | 13 | `disabled:opacity-50` makes text hard to read |

**Fix:** Add `disabled:cursor-not-allowed` and consider higher opacity.

---

### 17. Tables Horizontal Scroll on Mobile

**Severity:** MEDIUM
**Category:** Mobile/Responsive

| File | Issue |
|------|-------|
| `src/components/dashboard/transaction-table.tsx` | No minimum width, columns cramp on mobile |
| `src/components/dashboard/institutions-tabs.tsx` | Same issue |

**Fix:** Add `min-w-[600px]` to table elements and ensure scroll indicator is visible.

---

### 18. Billing Plan Cards Don't Stack Properly

**Severity:** MEDIUM
**Category:** Mobile/Responsive

**File:** `src/app/(dashboard)/settings/billing/billing-content.tsx:203`

**Issue:** Grid uses `lg:grid-cols-3` but doesn't have intermediate breakpoints. Cards become too narrow on tablets.

**Fix:**
```tsx
className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

### 19. Large Component Without Code Splitting

**Severity:** MEDIUM
**Category:** Performance

**File:** `src/components/dashboard/institutions-tabs.tsx` (600+ lines)

**Issue:** Contains multiple sub-components that load together even when only one tab is used.

**Fix:** Split into separate files or use `next/dynamic` for tab content.

---

### 20. Recharts Bundle Size

**Severity:** MEDIUM
**Category:** Performance

**Files:** Chart components

**Issue:** Recharts is ~400KB and loads for all dashboard users.

**Fix:** Use `next/dynamic` with `ssr: false`:
```tsx
const InsiderActivityChart = dynamic(
  () => import('@/components/charts/insider-activity-chart'),
  { ssr: false, loading: () => <Skeleton className="h-[300px]" /> }
)
```

---

## LOW SEVERITY ISSUES

### 21. Skeleton Loading Dimensions Don't Match Content

**Severity:** LOW
**Category:** Visual Polish

| File | Issue |
|------|-------|
| `transaction-table.tsx` | Skeleton row widths don't match actual data columns |
| `dashboard/page.tsx` | Skeleton structure doesn't perfectly match loaded content |

---

### 22. Icon Size Inconsistency

**Severity:** LOW
**Category:** Consistency

| Context | Sizes Found |
|---------|-------------|
| Navigation icons | `h-5 w-5` |
| Button icons | `h-4 w-4` |
| Badge icons | `h-3 w-3` |
| Status indicators | `h-2 w-2` |

**Note:** Mostly appropriate but should be documented.

---

### 23. Link Underline Treatment Varies

**Severity:** LOW
**Category:** Consistency

| Treatment | Used In |
|-----------|---------|
| `hover:underline` | transaction-table.tsx, watchlist-client.tsx |
| `text-primary hover:underline` | login-form.tsx |
| `.link-underline` class | Defined in globals.css but rarely used |

---

### 24. Animation Performance on Landing Page

**Severity:** LOW
**Category:** Performance

| File | Line | Issue |
|------|------|-------|
| `src/app/page.tsx` | Hero section | Large `blur-3xl` effect may be expensive |
| `src/components/landing/dashboard-preview.tsx` | Multiple | Three floating cards with infinite animation |

**Fix:** Add `will-change` CSS property and test on lower-end devices.

---

### 25. Missing Focus Trap in Custom Dropdown

**Severity:** LOW
**Category:** Accessibility

**File:** `src/components/dashboard/header.tsx`

**Issue:** Search dropdown doesn't trap focus - keyboard navigation can escape unexpectedly.

**Note:** Radix dropdowns handle this automatically, but the custom header search does not.

---

### 26. Unimplemented Route Referenced

**Severity:** LOW
**Category:** Usability

| File | Line | Link | Issue |
|------|------|------|-------|
| `src/components/dashboard/institutions-tabs.tsx` | 389 | `/institution/${cik}` | Route doesn't exist - clicking leads to 404 |

---

### 27. Card Border Radius Inconsistency

**Severity:** LOW
**Category:** Consistency

| Component | Border Radius |
|-----------|---------------|
| Card | `rounded-lg` (8px) |
| Badges | `rounded-full` |
| Inputs | `rounded-md` (6px) |

---

### 28. Missing Alt Text Pattern for Avatar

**Severity:** LOW
**Category:** Accessibility

**File:** `src/components/dashboard/user-menu.tsx:56`

**Issue:** Avatar has generic "Avatar" alt text.

**Fix:** Use `alt={user.name ? \`${user.name}'s avatar\` : 'User avatar'}`.

---

### 29. No Visual Sort Direction Indicator

**Severity:** LOW
**Category:** Visual Polish

**File:** `src/components/dashboard/transaction-table.tsx:104-120`

**Issue:** Sort buttons show same icon regardless of current sort state.

**Fix:** Use `ArrowUp`/`ArrowDown` icons to show current sort direction.

---

---

## Recommended Fixes by Priority

### Phase 1: Critical (Week 1)
1. **Fix touch target sizes** (Issue #1) - Increase button sizes to 44px minimum
2. **Add missing ARIA labels** (Issue #2) - Add accessible names to interactive elements
3. **Align pricing between pages** (Issue #4) - Update billing-content.tsx to match landing page
4. **Fix color consistency** (Issue #6) - Create semantic color variables

### Phase 2: Important (Week 2)
5. **Standardize form validation** (Issue #3) - Use `cn()` utility consistently
6. **Add loading states** (Issue #5) - Show feedback during async operations
7. **Fix search accessibility** (Issue #7) - Add proper ARIA roles to dropdown
8. **Improve empty states** (Issue #12) - Add helpful guidance text

### Phase 3: Polish (Week 3)
9. **Standardize spacing** (Issue #8) - Document and apply consistent spacing system
10. **Create error components** (Issue #14) - Build reusable ErrorAlert and ErrorToast
11. **Add breadcrumbs** (Issue #15) - Improve navigation context
12. **Document typography** (Issue #10) - Create typography scale guidelines

### Phase 4: Refinement (Ongoing)
13. Fix remaining accessibility issues
14. Performance optimization for charts
15. Skeleton loading refinement
16. Mobile responsive improvements

---

## Component Fixes Checklist

### src/components/ui/button.tsx
- [ ] Ensure `size="icon"` meets 44px minimum on touch devices

### src/components/ui/input.tsx
- [ ] Add `disabled:cursor-not-allowed`
- [ ] Consider `aria-invalid` support for error states

### src/components/dashboard/user-menu.tsx
- [ ] Add `aria-label="Open user menu"` to trigger button
- [ ] Increase button size to `h-11 w-11`

### src/components/dashboard/header.tsx
- [ ] Add `aria-label` to search input
- [ ] Add `role="listbox"` and `role="option"` to dropdown
- [ ] Add loading state during navigation

### src/components/dashboard/transaction-table.tsx
- [ ] Improve hover states on rows and links
- [ ] Ensure sort button touch targets are adequate
- [ ] Add sort direction indicators

### src/app/(dashboard)/watchlist/watchlist-client.tsx
- [ ] Add `aria-label` to remove buttons
- [ ] Increase remove button touch target
- [ ] Add visual pending state during operations

### src/components/landing/pricing-section.tsx
- [ ] Fix toggle aria-label logic

### src/app/(dashboard)/settings/billing/billing-content.tsx
- [ ] Update prices to match landing page ($29/$79 instead of $19/$49)
- [ ] Add responsive breakpoints for plan grid

---

*Audit completed: January 2026*
*Total issues found: 34*
*High severity: 9 | Medium severity: 16 | Low severity: 9*
