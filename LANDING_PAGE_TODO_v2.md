# InsiderIntel Landing Page - Implementation Todo List

> **For:** Claude Code
> **Reference:** INSIDERINTEL_LANDING_PAGE_FINAL_v2.md + INSIDERINTEL_UI_GUIDE.md
> **Date:** January 18, 2026
> **Version:** 2.0 (Brand-Aligned)

---

## ⚠️ CRITICAL COLOR RULES - Read Before Any Work

**The Five Golden Rules from UI Guide:**
1. **Amber Rule:** `#FFA028` for interactive elements ONLY
2. **Density Rule:** Support comfortable/compact modes
3. **Loading Rule:** No spinners - skeleton screens only
4. **Keyboard Rule:** Every mouse action works with keyboard
5. **Alignment Rule:** Numbers right-aligned with tabular figures

**FORBIDDEN Colors (Must Replace):**
| ❌ WRONG | ✅ CORRECT | Notes |
|----------|-----------|-------|
| `slate-*` | Neutral grays | Slate has blue tint |
| `cyan-*` | `#FFA028` (amber) | Old accent color |
| `emerald-*` | `#00C853` | Wrong green |
| `red-500` (#EF4444) | `#FF5252` | Wrong red |

---

## Instructions for Claude Code

Before starting any task:
1. Read `INSIDERINTEL_UI_GUIDE.md` sections 2-3 (Golden Rules, Colors)
2. Read `INSIDERINTEL_LANDING_PAGE_FINAL_v2.md` for landing page specifics
3. Check existing file before making changes
4. Make minimal, targeted edits
5. Verify no slate/cyan colors remain after changes

---

## Phase 1: Color System Audit & Fix

### Task 1.1: Audit globals.css
- [ ] Check CSS variables match UI Guide specification
- [ ] Verify no slate-* or cyan-* variables exist
- [ ] Add missing brand color variables if needed

**Required CSS Variables:**
```css
/* Light Theme (Landing Page) */
--bg-page: #FFFFFF;
--bg-section-alt: #F5F5F5;
--text-primary: #171717;
--text-secondary: #525252;
--text-muted: #737373;
--border-default: #E5E5E5;

/* Accent (Brand) */
--accent-primary: #FFA028;
--accent-primary-hover: #FFB04D;

/* Semantic */
--signal-positive: #00C853;
--signal-negative: #FF5252;

/* Dark Theme (Dashboard Preview) */
--bg-app: #0D0D0D;
--bg-card-dark: #1A1A1A;
--bg-elevated: #222222;
```

### Task 1.2: Search & Replace Forbidden Colors
- [ ] Search entire codebase for `slate-` (replace with neutral grays)
- [ ] Search for `cyan-` (replace with amber #FFA028)
- [ ] Search for `emerald-` (replace with #00C853)
- [ ] Search for `#10B981` (replace with #00C853)
- [ ] Search for `#EF4444` (replace with #FF5252)

### Task 1.3: Add Brand Keyframe Animations
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
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(0, 200, 83, 0); }
}
```

---

## Phase 2: Header Component

### Task 2.1: Header Structure
- [ ] Position: `sticky top-0 z-50`
- [ ] Background: `bg-white/80 backdrop-blur-md`
- [ ] Border: `border-b border-[#E5E5E5]`
- [ ] Height: 64px

### Task 2.2: Header Logo
- [ ] Icon container: `bg-[rgba(255,160,40,0.15)]` (amber at 15%)
- [ ] Icon color: `text-[#FFA028]`
- [ ] Text: `font-semibold text-[#171717]`

### Task 2.3: Header Navigation
- [ ] Nav links: `text-[#737373] hover:text-[#171717]`
- [ ] Hidden on mobile (`hidden md:flex`)

### Task 2.4: Header Buttons
- [ ] Sign In: Ghost style (`text-[#737373] hover:text-[#171717]`)
- [ ] Get Started: Amber CTA (`bg-[#FFA028] hover:bg-[#FFB04D]`)
- [ ] Both have amber focus rings

---

## Phase 3: Hero Section

### Task 3.1: Hero Badge
- [ ] Background: `bg-[#F5F5F5]`
- [ ] Border: `border border-[#E5E5E5]`
- [ ] Text: `text-[#525252]`
- [ ] **NOT amber** (amber is for actions only)

### Task 3.2: Hero Content
- [ ] H1: `text-[#171717] font-bold tracking-tight`
- [ ] Subheading: `text-[#525252]` max-width 600px

### Task 3.3: Hero CTAs
- [ ] Primary: `bg-[#FFA028] hover:bg-[#FFB04D] text-[#171717]`
- [ ] Shadow: `shadow-[0_4px_14px_rgba(255,160,40,0.4)]`
- [ ] Secondary: `border-2 border-[#E5E5E5] text-[#525252]` → dark on hover
- [ ] Focus rings: `focus-visible:ring-2 focus-visible:ring-[#FFA028]`

### Task 3.4: Dashboard Preview
- [ ] Background: `#0D0D0D` (dark theme mockup)
- [ ] Card backgrounds: `#1A1A1A`
- [ ] Borders: `#333333`
- [ ] Transform: `perspective(1000px) rotateY(-5deg) rotateX(2deg)`

### Task 3.5: Floating Cards
- [ ] Float animation applied
- [ ] Staggered delays (0s, 0.5s)

### Task 3.6: Hero Animations
- [ ] Badge: delay 100ms
- [ ] H1: delay 200ms
- [ ] Subheading: delay 300ms
- [ ] CTAs: delay 400ms
- [ ] Dashboard: delay 500ms

---

## Phase 4: Live Activity Feed

### Task 4.1: Section Setup
- [ ] Background: `#FFFFFF`
- [ ] Padding: `py-16`

### Task 4.2: Activity Header
- [ ] Title: `text-[#171717]`
- [ ] Subtitle: `text-[#737373]`
- [ ] Pulsing dot: `bg-[#00C853]` with pulse-glow animation

### Task 4.3: Transaction Badges
- [ ] BUY: `bg-[rgba(0,200,83,0.12)] text-[#00C853]`
- [ ] SELL: `bg-[rgba(255,82,82,0.12)] text-[#FF5252]`
- [ ] **DO NOT use emerald or red-500**

### Task 4.4: Table Styling
- [ ] Ticker: `font-semibold text-[#171717]`
- [ ] Role: `text-[#737373]`
- [ ] Value: `font-mono text-[#171717]` (right-aligned)
- [ ] Time: `text-[#737373]`
- [ ] Row borders: `border-b border-[#E5E5E5]`

---

## Phase 5: Trust Badges

### Task 5.1: Section Setup
- [ ] Background: `#F5F5F5`
- [ ] Padding: `py-8`
- [ ] Grid: 2 cols mobile, 4 cols desktop

### Task 5.2: Badge Styling
- [ ] Icon: `text-[#737373]` (NOT amber - static icons)
- [ ] Title: `font-medium text-[#171717]`
- [ ] Description: `text-xs text-[#737373]`

---

## Phase 6: Features Section

### Task 6.1: Section Setup
- [ ] Background: `#FFFFFF`
- [ ] Padding: `py-16 sm:py-24`
- [ ] Grid: 1 col mobile, 2 cols md+

### Task 6.2: Feature Cards
- [ ] Background: `#FFFFFF`
- [ ] Border: `border border-[#E5E5E5]`
- [ ] Hover: `-translate-y-1 shadow-lg border-[#D4D4D4]`
- [ ] Focus: `focus-visible:ring-2 focus-visible:ring-[#FFA028]`

### Task 6.3: Card Icons
- [ ] Container: `bg-[#F5F5F5]`
- [ ] Icon: `text-[#525252]` (NOT amber - static icons)

### Task 6.4: Mini Visualizations
- [ ] Container: `bg-[#F5F5F5]`
- [ ] Bar chart colors: `#00C853` (positive), `#FF5252` (negative)
- [ ] Pie chart colors: `#FFA028`, `#00C853`, `#4A90D9`, `#E5E5E5`

---

## Phase 7: How It Works

### Task 7.1: Section Setup
- [ ] Background: `#F5F5F5`
- [ ] Padding: `py-16 sm:py-24`
- [ ] Grid: 1 col mobile, 3 cols sm+

### Task 7.2: Step Numbers
- [ ] Circle: 48px, `bg-[#171717] text-white`
- [ ] **NOT amber** (not an action)

### Task 7.3: Connectors
- [ ] Dashed line: `border-[#E5E5E5]`
- [ ] Hidden on mobile

---

## Phase 8: Use Cases

### Task 8.1: Section Setup
- [ ] Background: `#FFFFFF`
- [ ] Padding: `py-16 sm:py-24`
- [ ] Grid: 1 col mobile, 3 cols md+

### Task 8.2: Use Case Cards
- [ ] Background: `#FFFFFF`
- [ ] Border: `border border-[#E5E5E5]`
- [ ] Icon: `text-[#525252]` (NOT amber)
- [ ] Hover: `-translate-y-0.5 shadow-md`

---

## Phase 9: Pricing Section

### Task 9.1: Toggle Switch
- [ ] Track: `bg-[#F5F5F5]`
- [ ] Active indicator: `bg-[#171717]` (NOT amber)
- [ ] Save badge: `bg-[rgba(0,200,83,0.12)] text-[#00C853]`

### Task 9.2: Standard Cards (Free, Pro)
- [ ] Background: `#FFFFFF`
- [ ] Border: `border border-[#E5E5E5]`
- [ ] Button: Secondary style
- [ ] Check icons: `text-[#737373]`

### Task 9.3: Featured Card (Retail)
- [ ] Border: `border-2 border-[#171717]`
- [ ] Shadow: `shadow-lg`
- [ ] Badge: "Most Popular" - `bg-[#171717] text-white`
- [ ] Button: `bg-[#171717] text-white`
- [ ] Check icons: `text-[#00C853]`

### Task 9.4: Pricing Data
- [ ] Price: `font-mono text-4xl text-[#171717]`
- [ ] Period: `text-[#737373]`

---

## Phase 10: FAQ Section

### Task 10.1: Category Tabs
- [ ] Active: `bg-[#F5F5F5] text-[#171717]`
- [ ] Inactive: `text-[#737373]`
- [ ] **Focus ring uses amber**

### Task 10.2: Accordion
- [ ] Question: `font-medium text-[#171717]`
- [ ] Chevron: `text-[#737373]`
- [ ] Answer: `text-[#525252] leading-relaxed`
- [ ] Border: `border-b border-[#E5E5E5]`

### Task 10.3: FAQ Accessibility
- [ ] `aria-expanded` on triggers
- [ ] `aria-controls` linking to content
- [ ] Keyboard navigation

---

## Phase 11: Bottom CTA

### Task 11.1: Container
- [ ] Margin: `mx-4 sm:mx-6 lg:mx-8`
- [ ] Padding: `py-16 sm:py-24`
- [ ] Background: `bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A]`
- [ ] Border radius: `rounded-3xl`

### Task 11.2: Content
- [ ] Title: `text-white font-bold`
- [ ] Subtitle: `text-[#D4D4D4]`
- [ ] CTA: Amber button (`bg-[#FFA028]`)
- [ ] Disclaimer: `text-[#737373]`

---

## Phase 12: Footer

### Task 12.1: Section Setup
- [ ] Background: `#F5F5F5`
- [ ] Border top: `border-t border-[#E5E5E5]`
- [ ] Padding: `py-12 sm:py-16`

### Task 12.2: Footer Content
- [ ] Logo: Same as header (amber icon)
- [ ] Tagline: `text-[#737373]`
- [ ] Column titles: `font-semibold text-[#171717]`
- [ ] Links: `text-[#737373] hover:text-[#171717]`
- [ ] Copyright: `text-[#737373]`

---

## Phase 13: Final QA

### Task 13.1: Color Compliance Audit
- [ ] Search for any remaining `slate-` classes
- [ ] Search for any remaining `cyan-` classes
- [ ] Search for any remaining `emerald-` classes
- [ ] Verify all focus rings use amber
- [ ] Verify amber only used for interactive elements

### Task 13.2: Accessibility Check
- [ ] All interactive elements have amber focus rings
- [ ] Color is not the only indicator (BUY/SELL have text labels)
- [ ] Keyboard navigation works throughout
- [ ] Proper heading hierarchy

### Task 13.3: Responsive Check
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px+)

---

## Completion Checklist

- [ ] Phase 1: Color System Fixed
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
- [ ] Phase 13: Final QA Complete

---

## Quick Color Reference

```
ACTIONS ONLY (Amber):
  Primary:    #FFA028
  Hover:      #FFB04D
  Focus Ring: ring-[#FFA028]

SEMANTIC:
  Positive:   #00C853 (BUY, gains)
  Negative:   #FF5252 (SELL, losses)

LIGHT THEME:
  Background: #FFFFFF
  Section:    #F5F5F5
  Text:       #171717 / #525252 / #737373
  Border:     #E5E5E5

DARK THEME (Preview/CTA):
  Background: #0D0D0D
  Card:       #1A1A1A
  Border:     #333333
  Text:       #F5F5F5 / #D4D4D4
```

---

*Reference INSIDERINTEL_LANDING_PAGE_FINAL_v2.md and INSIDERINTEL_UI_GUIDE.md for detailed specifications.*
