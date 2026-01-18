# InsiderIntel Landing Page - Implementation Todo List

> **For:** Claude Code
> **Reference:** INSIDERINTEL_LANDING_PAGE_FINAL.md
> **Date:** January 18, 2026

---

## Instructions for Claude Code

Before starting any task:
1. Read `INSIDERINTEL_LANDING_PAGE_FINAL.md` for complete specifications
2. Check the existing file before making changes
3. Make minimal, targeted edits - don't rewrite entire files
4. Test responsive behavior at each breakpoint
5. Verify accessibility requirements

---

## Phase 1: Audit Current Implementation

### Task 1.1: File Structure Verification
- [ ] Confirm all component files exist at expected paths
- [ ] Check `src/app/page.tsx` structure matches section order
- [ ] Verify `globals.css` has required keyframe animations

**Files to check:**
```
src/app/page.tsx
src/app/globals.css
src/components/landing/dashboard-preview.tsx
src/components/landing/feature-cards.tsx
src/components/landing/pricing-section.tsx
src/components/landing/live-activity-feed.tsx
src/components/landing/trust-badges.tsx
src/components/landing/testimonials.tsx (Use Cases)
src/components/landing/faq-section.tsx
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/badge.tsx
src/components/ui/logo.tsx
```

### Task 1.2: Color System Audit
- [ ] Verify CSS variables in globals.css match spec
- [ ] Check no amber colors used outside Logo component
- [ ] Confirm semantic colors (emerald for buy, red for sell)

### Task 1.3: Typography Audit
- [ ] H1 uses `text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight`
- [ ] H2 uses `text-3xl sm:text-4xl font-bold tracking-tight`
- [ ] Body text uses correct responsive sizes

---

## Phase 2: Header Component

### Task 2.1: Header Structure
- [ ] Position: `sticky top-0 z-50`
- [ ] Background: `bg-white/80 backdrop-blur-md`
- [ ] Border: `border-b border-border`
- [ ] Height: 64px equivalent

### Task 2.2: Header Navigation
- [ ] Logo with amber-100 bg icon container
- [ ] Nav links: Features, Pricing, FAQ
- [ ] Nav hidden on mobile (`hidden md:flex`)
- [ ] Mobile menu button (if implemented)

### Task 2.3: Header Buttons
- [ ] Sign In: Ghost style (`text-slate-500 hover:text-slate-900`)
- [ ] Get Started: Cyan gradient, smaller size for header

---

## Phase 3: Hero Section

### Task 3.1: Hero Content
- [ ] Badge: "✦ Real SEC Data • AI Insights" with Sparkles icon
- [ ] Badge styling: `slate-100` bg, `slate-200` border, `slate-600` text
- [ ] H1 text matches spec exactly
- [ ] Subheading: max-width 600px, `slate-600` color

### Task 3.2: Hero CTAs
- [ ] Primary: Cyan gradient with glow shadow
- [ ] Secondary: Border style with hover fill
- [ ] Layout: Stacked on mobile, horizontal on sm+
- [ ] Gap: 12px (gap-3)

### Task 3.3: Dashboard Preview
- [ ] 3D transform: `perspective(1000px) rotateY(-5deg) rotateX(2deg)`
- [ ] Shadow: `shadow-2xl` or custom deep shadow
- [ ] Contains sidebar (hidden mobile), stats cards, cluster alert, table
- [ ] Dark theme: `slate-900` main bg, `slate-800` card bg

### Task 3.4: Floating Cards
- [ ] Two notification-style cards
- [ ] Float animation: `animate-float` (4s infinite)
- [ ] Staggered animation delays

### Task 3.5: Hero Animations
- [ ] Add fade-in-up keyframe to globals.css
- [ ] Apply cascading delays: Badge 100ms, H1 200ms, etc.
- [ ] Ensure `animation-fill-mode: forwards` with initial opacity 0

---

## Phase 4: Live Activity Feed

### Task 4.1: Section Setup
- [ ] Background: white
- [ ] Padding: `py-16`
- [ ] Max-width container centered

### Task 4.2: Activity Header
- [ ] Title: "Live Insider Activity"
- [ ] Subtitle: "(From SEC filings)"
- [ ] Pulsing green dot with `pulse-glow` animation
- [ ] Add pulse-glow keyframe to globals.css

### Task 4.3: Activity Table
- [ ] 5 transaction rows
- [ ] Columns: Ticker | Role | Type Badge | Value | Time
- [ ] BUY badge: `emerald-100` bg, `emerald-700` text, ArrowUpRight icon
- [ ] SELL badge: `red-100` bg, `red-700` text, ArrowDownRight icon
- [ ] Row borders: `border-b border-slate-200`

### Task 4.4: Activity Animations
- [ ] Rows slide in from left
- [ ] Staggered delays (50-100ms per row)

---

## Phase 5: Trust Badges

### Task 5.1: Section Setup
- [ ] Background: `slate-50`
- [ ] Padding: `py-8`

### Task 5.2: Badge Grid
- [ ] Grid: 2 cols mobile, 4 cols desktop
- [ ] Gap: 16px mobile, 32px desktop
- [ ] Badges: SEC EDGAR, OpenFIGI, AI-Powered, SSL Secure

### Task 5.3: Badge Styling
- [ ] Icon: 24px, `slate-400` color
- [ ] Title: 14px, `font-medium`, `slate-900`
- [ ] Description: 12px, `slate-500`

---

## Phase 6: Features Section

### Task 6.1: Section Setup
- [ ] Padding: `py-16 sm:py-24`
- [ ] Title: "Everything you need to track insider activity"

### Task 6.2: Feature Cards Grid
- [ ] 1 column mobile, 2 columns md+
- [ ] Gap: 24px mobile, 32px desktop

### Task 6.3: Individual Feature Cards
- [ ] Card 1: Real-Time Tracking + mini bar chart visualization
- [ ] Card 2: Institutional Data + mini pie chart visualization
- [ ] Card 3: AI-Powered Context + AI insight bubble
- [ ] Card 4: Smart Alerts + alert list preview

### Task 6.4: Card Styling
- [ ] Background: white
- [ ] Border: `slate-200`
- [ ] Border radius: 12px
- [ ] Padding: 24px
- [ ] Hover: `translateY(-4px)` + `shadow-lg` + `border-slate-300`

### Task 6.5: Mini Visualizations
- [ ] Each card has unique visualization in `slate-50` container
- [ ] Bar chart uses emerald/red bars
- [ ] Pie chart uses cyan/emerald/amber/slate segments

---

## Phase 7: How It Works Section

### Task 7.1: Section Setup
- [ ] Background: `slate-50`
- [ ] Padding: `py-16 sm:py-24`

### Task 7.2: Steps Grid
- [ ] 1 column mobile, 3 columns sm+
- [ ] Gap: 32px mobile, 48px desktop

### Task 7.3: Step Components
- [ ] Step number: 48px circle, `slate-900` bg, white bold text
- [ ] Title: 18px, `font-semibold`, `slate-900`
- [ ] Description: 14px, `slate-600`

### Task 7.4: Connectors
- [ ] Dashed lines between steps
- [ ] Hidden on mobile (`hidden sm:block`)

---

## Phase 8: Use Cases Section

### Task 8.1: Section Setup
- [ ] Padding: `py-16 sm:py-24`
- [ ] Title: "Built for Every Investor"

### Task 8.2: Cards Grid
- [ ] 1 column mobile, 3 columns md+
- [ ] Gap: 24px

### Task 8.3: Use Case Cards
- [ ] Card 1: Retail Investor
- [ ] Card 2: Day Trader
- [ ] Card 3: Analyst
- [ ] Each has icon, title, description
- [ ] Hover: `translateY(-2px)` + `shadow-md`

---

## Phase 9: Pricing Section

### Task 9.1: Section Setup
- [ ] Padding: `py-16 sm:py-24`
- [ ] Title: "Simple, Transparent Pricing"

### Task 9.2: Toggle Switch
- [ ] Monthly/Annual toggle
- [ ] "Save 20%" badge (emerald) appears when Annual selected
- [ ] Toggle uses `aria-pressed` for accessibility

### Task 9.3: Pricing Cards Grid
- [ ] 1 column mobile, 3 columns lg+
- [ ] Gap: 32px
- [ ] Center card (Retail) is featured

### Task 9.4: Free Plan Card ($0)
- [ ] Standard border (`slate-200`)
- [ ] Features: Basic access, 10 watchlist, Daily digest
- [ ] Secondary button style

### Task 9.5: Retail Plan Card ($29) - Featured
- [ ] "Most Popular" badge at top
- [ ] Thicker border: 2px `slate-900`
- [ ] Shadow: `shadow-lg`
- [ ] Features: Everything Free+, Unlimited, Instant alerts, AI insights
- [ ] Primary dark button

### Task 9.6: Pro Plan Card ($79)
- [ ] "For Teams" badge
- [ ] Standard border
- [ ] Features: Everything+, API access, Priority, Team sharing
- [ ] Secondary button style

### Task 9.7: Pricing Footer
- [ ] "💰 30-day money-back guarantee" text
- [ ] Centered, muted color

---

## Phase 10: FAQ Section

### Task 10.1: Section Setup
- [ ] Padding: `py-16 sm:py-24`
- [ ] Title: "Frequently Asked Questions"

### Task 10.2: Category Tabs
- [ ] Tabs: Product, Billing, Data & Security
- [ ] Pill style: rounded-full
- [ ] Active: `slate-100` bg, `slate-900` text
- [ ] Inactive: transparent, `slate-500` text

### Task 10.3: Accordion Items
- [ ] Question: 15px, `font-medium`, `slate-900`
- [ ] Chevron icon rotates on expand (0° → 180°)
- [ ] Answer: 14px, `slate-600`, line-height 1.6
- [ ] Border between items

### Task 10.4: FAQ Accessibility
- [ ] `aria-expanded` on trigger
- [ ] `aria-controls` linking to content
- [ ] Keyboard navigation support

### Task 10.5: Contact Link
- [ ] "Still have questions? Contact support →"
- [ ] Centered below accordion

---

## Phase 11: Bottom CTA Section

### Task 11.1: Container
- [ ] Margin: `mx-4 sm:mx-6 lg:mx-8`
- [ ] Padding: `py-16 sm:py-24`
- [ ] Background: `bg-gradient-to-br from-slate-900 to-slate-800`
- [ ] Border radius: `rounded-3xl`

### Task 11.2: Content
- [ ] Title: "Ready to track insider activity?" - white, centered
- [ ] Subtitle: "Join thousands of investors using InsiderIntel" - `slate-300`
- [ ] CTA: Cyan gradient button
- [ ] Disclaimer: "No credit card required" - `slate-400`

---

## Phase 12: Footer

### Task 12.1: Section Setup
- [ ] Background: `slate-50`
- [ ] Border top: `slate-200`
- [ ] Padding: `py-12 sm:py-16`

### Task 12.2: Footer Layout
- [ ] Logo section with tagline
- [ ] Product links column
- [ ] Company links column
- [ ] Legal links column
- [ ] Responsive: stack on mobile, row on md+

### Task 12.3: Footer Links
- [ ] Color: `slate-500`
- [ ] Hover: `slate-900`
- [ ] Column titles: `font-semibold`, `slate-900`

### Task 12.4: Copyright
- [ ] Divider line above
- [ ] "© 2026 InsiderIntel. All rights reserved."
- [ ] Muted color (`slate-500`)

---

## Phase 13: Global Styles & Animations

### Task 13.1: Keyframes in globals.css
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}
```

### Task 13.2: Animation Utility Classes
- [ ] `.animate-float` - float animation
- [ ] `.animate-fade-in-up` - with variants for delays
- [ ] `.animate-pulse-glow` - for live indicator

### Task 13.3: Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Phase 14: Final QA

### Task 14.1: Responsive Testing
- [ ] Mobile (320px-639px)
- [ ] Tablet (640px-1023px)
- [ ] Desktop (1024px+)

### Task 14.2: Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Screen reader compatibility
- [ ] Color contrast passes WCAG AA

### Task 14.3: Performance
- [ ] Images optimized
- [ ] Animations performant (no jank)
- [ ] No layout shifts

### Task 14.4: Cross-Browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Completion Checklist

- [ ] Phase 1: Audit Complete
- [ ] Phase 2: Header Complete
- [ ] Phase 3: Hero Complete
- [ ] Phase 4: Live Activity Complete
- [ ] Phase 5: Trust Badges Complete
- [ ] Phase 6: Features Complete
- [ ] Phase 7: How It Works Complete
- [ ] Phase 8: Use Cases Complete
- [ ] Phase 9: Pricing Complete
- [ ] Phase 10: FAQ Complete
- [ ] Phase 11: Bottom CTA Complete
- [ ] Phase 12: Footer Complete
- [ ] Phase 13: Global Styles Complete
- [ ] Phase 14: Final QA Complete

---

*Reference INSIDERINTEL_LANDING_PAGE_FINAL.md for detailed specifications on any item.*
