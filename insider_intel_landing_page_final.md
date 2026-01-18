# InsiderIntel Landing Page - Final Design Specification

> **Version:** 1.0 Final (Consolidated from Wireframe + Spec v2)
> **Last Updated:** January 18, 2026
> **Purpose:** Single source of truth for landing page development

---

## Quick Reference: File Locations

| Component | Path |
|-----------|------|
| Landing Page | `src/app/page.tsx` |
| Global Styles | `src/app/globals.css` |
| Dashboard Preview | `src/components/landing/dashboard-preview.tsx` |
| Feature Cards | `src/components/landing/feature-cards.tsx` |
| Pricing Section | `src/components/landing/pricing-section.tsx` |
| Live Activity | `src/components/landing/live-activity-feed.tsx` |
| Trust Badges | `src/components/landing/trust-badges.tsx` |
| Use Cases | `src/components/landing/testimonials.tsx` |
| FAQ Section | `src/components/landing/faq-section.tsx` |
| Button Component | `src/components/ui/button.tsx` |
| Card Component | `src/components/ui/card.tsx` |
| Badge Component | `src/components/ui/badge.tsx` |
| Logo Component | `src/components/ui/logo.tsx` |

---

## 1. Page Structure (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. STICKY HEADER                                            │
│    [Logo]         Nav Links         [Sign In] [Get Started] │
├─────────────────────────────────────────────────────────────┤
│ 2. HERO SECTION                                             │
│    Badge · H1 · Subheading · CTA Buttons                    │
│    [Dashboard Preview with 3D tilt + floating cards]        │
├─────────────────────────────────────────────────────────────┤
│ 3. LIVE ACTIVITY FEED                                       │
│    Recent Insider Transactions (5 rows)                     │
├─────────────────────────────────────────────────────────────┤
│ 4. TRUST BADGES                                             │
│    SEC EDGAR · OpenFIGI · AI-Powered · SSL Secure           │
├─────────────────────────────────────────────────────────────┤
│ 5. FEATURES SECTION                                         │
│    4 Feature Cards (2x2 Grid with mini visualizations)      │
├─────────────────────────────────────────────────────────────┤
│ 6. HOW IT WORKS SECTION                                     │
│    3 Steps (Numbered circles with connectors)               │
├─────────────────────────────────────────────────────────────┤
│ 7. USE CASES SECTION                                        │
│    3 Use Case Cards (Retail · Day Trader · Analyst)         │
├─────────────────────────────────────────────────────────────┤
│ 8. PRICING SECTION                                          │
│    Toggle (Monthly/Annual) + 3 Cards (Free/$29/$79)         │
├─────────────────────────────────────────────────────────────┤
│ 9. FAQ SECTION                                              │
│    Category Tabs + Accordion Items                          │
├─────────────────────────────────────────────────────────────┤
│ 10. BOTTOM CTA SECTION                                      │
│     Dark gradient card with final conversion message        │
├─────────────────────────────────────────────────────────────┤
│ 11. FOOTER                                                  │
│     Logo · Link Columns · Copyright                         │
└─────────────────────────────────────────────────────────────┘
```

### Theme Context
- **Landing Page:** Light theme (white background, dark text)
- **Dashboard Preview:** Dark theme mockup (slate-900 background)
- **Bottom CTA:** Dark gradient (slate-900 to slate-800)
- **Footer:** Neutral gray (slate-50)

---

## 2. Color System

### CSS Variables (Light Mode - Landing Page Default)

```css
:root {
  --background: 0 0% 100%;        /* #FFFFFF */
  --foreground: 0 0% 9%;          /* #171717 */
  --card: 0 0% 100%;              /* #FFFFFF */
  --card-foreground: 0 0% 9%;     /* #171717 */
  --primary: 0 0% 9%;             /* #171717 */
  --primary-foreground: 0 0% 98%; /* #FAFAFA */
  --secondary: 0 0% 96%;          /* #F5F5F5 */
  --muted: 0 0% 96%;              /* #F5F5F5 */
  --muted-foreground: 0 0% 45%;   /* #737373 */
  --border: 0 0% 90%;             /* #E5E5E5 */
  --ring: 0 0% 9%;                /* #171717 */
  
  /* Semantic Colors */
  --signal-positive: 145 100% 39%; /* #00A651 - Buy/Success */
  --signal-negative: 0 100% 66%;   /* #FF5555 - Sell/Error */
  --accent-amber: 36 100% 56%;     /* #FFA028 - Highlights */
}
```

### Tailwind Classes Reference

| Purpose | Classes |
|---------|---------|
| **Primary CTA** | `from-cyan-500 to-cyan-400` gradient |
| **Buy/Positive** | `emerald-500`, `emerald-100` bg, `emerald-700` text |
| **Sell/Negative** | `red-500`, `red-100` bg, `red-700` text |
| **Dark Backgrounds** | `slate-900`, `slate-800` |
| **Text Hierarchy** | `slate-900` primary, `slate-600` secondary, `slate-400` muted |
| **Borders** | `slate-200` light, `slate-300` medium |
| **Section Backgrounds** | `white`, `slate-50`, `slate-100` |
| **Significance** | `orange-500` high, `yellow-500` medium, `green-500` low |

---

## 3. Typography

### Font Stack
```css
font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

### Type Scale

| Element | Mobile | Desktop | Weight | Tailwind |
|---------|--------|---------|--------|----------|
| H1 (Hero) | 36px | 48px → 60px | 700 | `text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight` |
| H2 (Section) | 28px | 36px | 700 | `text-3xl sm:text-4xl font-bold tracking-tight` |
| H3 (Card Title) | 20px | 20px | 600 | `text-xl font-semibold` |
| Body Large | 16px | 18px | 400 | `text-base sm:text-lg` |
| Body | 14px | 16px | 400 | `text-sm sm:text-base` |
| Small | 12px | 14px | 400 | `text-xs sm:text-sm` |
| Badge | 11px | 11px | 600 | `text-xs font-semibold uppercase tracking-wide` |

### Monospace (Pricing)
```css
font-family: 'JetBrains Mono', ui-monospace, monospace;
```

---

## 4. Button Specifications

### Primary CTA Button
```tsx
className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold px-6 py-3 rounded-lg shadow-[0_4px_14px_rgba(34,211,238,0.4)] hover:shadow-[0_6px_20px_rgba(34,211,238,0.5)] hover:-translate-y-0.5 transition-all duration-200"
```

### Secondary Button
```tsx
className="inline-flex items-center justify-center border-2 border-slate-300 text-slate-700 font-medium px-6 py-3 rounded-lg hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-200"
```

### Ghost Button (Nav)
```tsx
className="text-slate-500 font-medium hover:text-slate-900 transition-colors duration-150"
```

### Pricing Buttons
```tsx
// Free/Pro (secondary)
className="w-full bg-white text-slate-900 font-semibold py-3 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"

// Retail (featured - dark)
className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors"
```

---

## 5. Section Specifications

### 5.1 Header (Sticky)
- **Height:** 64px
- **Background:** `white/80` with `backdrop-blur-md`
- **Position:** `sticky top-0 z-50`
- **Border:** `border-b border-border`
- **Logo:** Amber icon (`amber-100` bg, `amber-600` icon) + "InsiderIntel" text
- **Nav Links:** Features, Pricing, FAQ (hidden mobile, visible md+)
- **Buttons:** Sign In (ghost), Get Started (primary CTA small)

### 5.2 Hero Section
- **Padding:** `py-16 sm:py-24 lg:py-32`
- **Badge:** "✦ Real SEC Data • AI Insights" - `slate-100` bg, `slate-200` border
- **H1:** "Track Insider Trading Activity Before the Market Moves"
- **Subheading:** "Real-time Form 4 filings and institutional holdings with AI-powered context."
- **CTAs:** Primary "Get Started Free →" + Secondary "See How It Works"
- **Dashboard Preview:**
  - 3D transform: `perspective(1000px) rotateY(-5deg) rotateX(2deg)`
  - Shadow: `shadow-2xl`
  - Contains: Sidebar, Stats Cards, Cluster Alert, Transaction Table
  - Floating notification cards with `animation: float 4s ease-in-out infinite`

### 5.3 Live Activity Feed
- **Background:** `white`
- **Padding:** `py-16`
- **Header:** "Live Insider Activity" with pulsing green dot
- **Subtext:** "(From SEC filings)"
- **Table:** 5 rows with Ticker | Role | BUY/SELL Badge | Value | Time
- **Row Animation:** Slide in from left, staggered

### 5.4 Trust Badges
- **Background:** `slate-50`
- **Padding:** `py-8`
- **Grid:** 2 cols mobile → 4 cols desktop
- **Badges:** SEC EDGAR, OpenFIGI, AI-Powered, SSL Secure
- **Icon:** 24px, `slate-400`

### 5.5 Features Section
- **Padding:** `py-16 sm:py-24`
- **Title:** "Everything you need to track insider activity"
- **Grid:** 1 col mobile → 2 cols md+
- **Cards:** 
  1. Real-Time Tracking (mini bar chart)
  2. Institutional Data (mini pie chart)
  3. AI-Powered Context (AI insight bubble)
  4. Smart Alerts (alert list)
- **Card Hover:** `translateY(-4px)` + `shadow-lg`

### 5.6 How It Works
- **Background:** `slate-50`
- **Padding:** `py-16 sm:py-24`
- **Grid:** 1 col mobile → 3 cols sm+
- **Steps:**
  1. Create Account (30 seconds)
  2. Track Insiders (add to watchlist)
  3. Act on Insights (get AI analysis)
- **Step Number:** 48px circle, `slate-900` bg, white text
- **Connectors:** Dashed lines (hidden mobile)

### 5.7 Use Cases
- **Padding:** `py-16 sm:py-24`
- **Title:** "Built for Every Investor"
- **Grid:** 1 col mobile → 3 cols md+
- **Cards:** Retail Investor, Day Trader, Analyst
- **Card Hover:** `translateY(-2px)` + `shadow-md`

### 5.8 Pricing Section
- **Padding:** `py-16 sm:py-24`
- **Title:** "Simple, Transparent Pricing"
- **Toggle:** Monthly/Annual with "Save 20%" badge
- **Grid:** 1 col mobile → 3 cols lg+
- **Plans:**
  - Free: $0/month - Basic access, 10 watchlist, Daily digest
  - Retail (Featured): $29/month - Everything Free +, Unlimited, Instant alerts, AI insights
  - Pro: $79/month - Everything +, API access, Priority support, Team sharing
- **Featured Card:** 2px `slate-900` border, "Most Popular" badge, `shadow-lg`
- **Footer:** "💰 30-day money-back guarantee"

### 5.9 FAQ Section
- **Padding:** `py-16 sm:py-24`
- **Title:** "Frequently Asked Questions"
- **Tabs:** Product, Billing, Data & Security
- **Tab Style:** Pill buttons, `slate-100` active bg
- **Accordion:** Chevron rotation on expand
- **Footer Link:** "Still have questions? Contact support →"

### 5.10 Bottom CTA
- **Margin:** `mx-4 sm:mx-6 lg:mx-8`
- **Padding:** `py-16 sm:py-24`
- **Background:** `bg-gradient-to-br from-slate-900 to-slate-800`
- **Border Radius:** `rounded-3xl`
- **Title:** "Ready to track insider activity?" (white)
- **Subtitle:** "Join thousands of investors using InsiderIntel" (slate-300)
- **CTA:** Primary button (cyan gradient)
- **Disclaimer:** "No credit card required" (slate-400)

### 5.11 Footer
- **Background:** `slate-50`
- **Border Top:** `slate-200`
- **Padding:** `py-12 sm:py-16`
- **Layout:** Logo + tagline | Product links | Company links | Legal links
- **Divider:** `border-t border-slate-200`
- **Copyright:** "© 2026 InsiderIntel. All rights reserved."

---

## 6. Animation Specifications

### Keyframes (add to globals.css)

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

### Hero Animation Delays
| Element | Delay |
|---------|-------|
| Badge | 100ms |
| H1 | 200ms |
| Subheading | 300ms |
| CTA Buttons | 400ms |
| Dashboard | 500ms |

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Responsive Breakpoints

| Breakpoint | Min Width | Key Changes |
|------------|-----------|-------------|
| Default | 0px | Single column, stacked CTAs, simplified dashboard |
| `sm:` | 640px | Horizontal CTAs, 3-col How It Works |
| `md:` | 768px | Nav visible, 2-col Features |
| `lg:` | 1024px | Full dashboard with sidebar, 3-col Pricing |
| `xl:` | 1280px | Max-width containers |

---

## 8. Accessibility Checklist

- [ ] Color contrast meets WCAG AA (4.5:1 for body, 3:1 for large text)
- [ ] All interactive elements have visible focus states
- [ ] Minimum touch target 44×44px
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] FAQ accordion has `aria-expanded` and `aria-controls`
- [ ] Toggle switch has `aria-pressed` and `aria-label`
- [ ] Icon-only buttons have `aria-label`
- [ ] Reduced motion media query implemented

---

## 9. Implementation Checklist

Use this checklist to verify the landing page matches spec:

### Header
- [ ] Sticky with backdrop blur
- [ ] Logo with amber icon
- [ ] Nav links hidden on mobile
- [ ] Sign In (ghost) + Get Started (cyan gradient) buttons

### Hero
- [ ] Cascading fade-in-up animations
- [ ] Badge with sparkle icon
- [ ] H1 with tracking-tight
- [ ] Dashboard preview with 3D transform
- [ ] Floating notification cards

### Live Activity
- [ ] Pulsing green dot indicator
- [ ] 5 transaction rows
- [ ] BUY (emerald) / SELL (red) badges
- [ ] Staggered slide-in animation

### Trust Badges
- [ ] slate-50 background
- [ ] 4 badges in row (2 on mobile)

### Features
- [ ] 4 cards in 2×2 grid
- [ ] Each card has mini visualization
- [ ] Hover lift effect

### How It Works
- [ ] slate-50 background
- [ ] 3 numbered steps
- [ ] Dashed connectors (desktop only)

### Use Cases
- [ ] 3 persona cards
- [ ] Hover lift effect

### Pricing
- [ ] Monthly/Annual toggle
- [ ] "Most Popular" badge on Retail
- [ ] Featured card has dark border
- [ ] Money-back guarantee footer

### FAQ
- [ ] 3 category tabs (pill style)
- [ ] Accordion with chevron rotation
- [ ] Contact support link

### Bottom CTA
- [ ] Dark gradient background
- [ ] Rounded-3xl corners
- [ ] Cyan CTA button

### Footer
- [ ] slate-50 background
- [ ] 4-column layout
- [ ] Copyright with current year

---

*This specification is the authoritative reference for all landing page development.*
