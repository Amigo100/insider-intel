# InsiderIntel Landing Page - Final Design Specification

> **Version:** 2.0 Final (Aligned with INSIDERINTEL_UI_GUIDE.md)
> **Last Updated:** January 18, 2026
> **Purpose:** Single source of truth for landing page development

---

## ⚠️ CRITICAL: Brand Color Rules

Before making ANY changes, remember the **Five Golden Rules** from INSIDERINTEL_UI_GUIDE.md:

1. **Amber Rule:** `#FFA028` for interactive elements ONLY (CTAs, active states, focus rings)
2. **Density Rule:** Support comfortable and compact modes where applicable
3. **Loading Rule:** No spinners - skeleton screens only
4. **Keyboard Rule:** Every mouse action must work with keyboard
5. **Alignment Rule:** Numbers right-aligned with tabular figures

**FORBIDDEN on Landing Page:**
- ❌ `slate-*` colors (has blue tint) → use neutral grays
- ❌ `cyan-*` colors (old accent) → use amber `#FFA028`
- ❌ `emerald-*` colors → use green `#00C853`
- ❌ `red-500` (#EF4444) → use red `#FF5252`
- ❌ Hardcoded hex in components → use CSS variables

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
| UI Components | `src/components/ui/*.tsx` |

---

## 1. Page Structure

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
│    4 Feature Cards (2×2 Grid with mini visualizations)      │
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
│     Dark card with final conversion message                 │
├─────────────────────────────────────────────────────────────┤
│ 11. FOOTER                                                  │
│     Logo · Link Columns · Copyright                         │
└─────────────────────────────────────────────────────────────┘
```

### Theme Context (From UI Guide Section 1.2)
| Context | Theme | Notes |
|---------|-------|-------|
| **Landing Page (`/`)** | Light | Professional, welcoming |
| **Auth Pages** | Light | Clean, trustworthy |
| **Dashboard Preview (mockup)** | Dark | Shows "Modernized Bloomberg" aesthetic |
| **Bottom CTA** | Dark | Contrast section using `#0D0D0D` |
| **Footer** | Light | Neutral `#F5F5F5` |

---

## 2. Color System

### 2.1 Light Theme Colors (Landing Page)

**CRITICAL:** All grays must have **0° hue and 0% saturation** (pure neutral, no blue tint).

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-page` | `#FFFFFF` | Main page background |
| `--bg-section-alt` | `#F5F5F5` | Alternating section backgrounds |
| `--bg-card` | `#FFFFFF` | Card backgrounds |
| `--bg-card-hover` | `#FAFAFA` | Card hover state |
| `--text-primary` | `#171717` | Headlines, primary text |
| `--text-secondary` | `#525252` | Body text, descriptions |
| `--text-muted` | `#737373` | Labels, captions, metadata |
| `--border-default` | `#E5E5E5` | Standard borders |
| `--border-subtle` | `#F0F0F0` | Subtle separators |

### 2.2 Accent Colors (Brand)

| Token | Hex | Usage | Rules |
|-------|-----|-------|-------|
| `--accent-primary` | `#FFA028` | **Primary CTAs, active tabs, toggles, focus rings** | **ACTIONS ONLY** |
| `--accent-primary-hover` | `#FFB04D` | Hover state for amber buttons | — |
| `--accent-primary-muted` | `rgba(255,160,40,0.15)` | Subtle backgrounds for active states | — |
| `--accent-secondary` | `#D4AF37` | Premium badges (sparingly) | — |

### 2.3 Semantic Colors (Financial)

| Token | Hex | Light BG (12% opacity) | Usage |
|-------|-----|------------------------|-------|
| `--signal-positive` | `#00C853` | `rgba(0,200,83,0.12)` | BUY badges, gains, success, uptrends |
| `--signal-negative` | `#FF5252` | `rgba(255,82,82,0.12)` | SELL badges, losses, errors, downtrends |

### 2.4 Dark Theme Colors (Dashboard Preview & Bottom CTA Only)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-app` | `#0D0D0D` | Main dark background |
| `--bg-card` | `#1A1A1A` | Cards in dark context |
| `--bg-elevated` | `#222222` | Elevated surfaces |
| `--bg-hover` | `#262626` | Hover states in dark |
| `--text-primary-dark` | `#F5F5F5` | Light text on dark |
| `--text-secondary-dark` | `#D4D4D4` | Secondary light text |
| `--border-dark` | `#333333` | Borders on dark bg |

### 2.5 Tailwind Class Mapping

**DO USE:**
```tsx
// Primary CTA (amber)
className="bg-[#FFA028] hover:bg-[#FFB04D] text-[#171717]"

// BUY badge
className="bg-[rgba(0,200,83,0.12)] text-[#00C853]"

// SELL badge
className="bg-[rgba(255,82,82,0.12)] text-[#FF5252]"

// Neutral backgrounds (light)
className="bg-white" or "bg-[#F5F5F5]"

// Neutral text (light theme)
className="text-[#171717]" // primary
className="text-[#525252]" // secondary
className="text-[#737373]" // muted

// Focus rings (always amber)
className="focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2"
```

**DO NOT USE:**
```tsx
// ❌ FORBIDDEN - Blue-tinted slate
className="bg-slate-900" // → use bg-[#0D0D0D]
className="text-slate-600" // → use text-[#525252]

// ❌ FORBIDDEN - Old cyan accent
className="bg-cyan-500" // → use bg-[#FFA028]
className="from-cyan-500 to-cyan-400" // → use bg-[#FFA028]

// ❌ FORBIDDEN - Wrong greens/reds
className="text-emerald-500" // → use text-[#00C853]
className="bg-emerald-100" // → use bg-[rgba(0,200,83,0.12)]
className="text-red-500" // → use text-[#FF5252]
```

---

## 3. Typography

### Font Stack
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
```

### Type Scale

| Element | Mobile | Desktop | Weight | Line Height |
|---------|--------|---------|--------|-------------|
| H1 (Hero) | 36px | 48px → 60px | 700 | 1.1 |
| H2 (Section) | 28px | 36px | 700 | 1.2 |
| H3 (Card Title) | 20px | 20px | 600 | 1.4 |
| Body Large | 16px | 18px | 400 | 1.5 |
| Body | 14px | 16px | 400 | 1.5 |
| Caption | 12px | 12px | 400 | 1.4 |
| Badge | 11px | 11px | 600 | 1.3 |

### Data/Numbers (Always Monospace)
```css
.financial-data {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  text-align: right; /* Per Golden Rule #5 */
}
```

---

## 4. Button Specifications

### Primary CTA Button (Amber)
```tsx
className="bg-[#FFA028] hover:bg-[#FFB04D] text-[#171717] font-semibold px-6 py-3 rounded-lg shadow-[0_4px_14px_rgba(255,160,40,0.4)] hover:shadow-[0_6px_20px_rgba(255,160,40,0.5)] hover:-translate-y-0.5 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2"
```

**Visual:**
```
┌─────────────────────────────────┐
│   Get Started Free →            │  ← Amber #FFA028 bg, dark text
└─────────────────────────────────┘
```

### Secondary Button (Outline)
```tsx
className="inline-flex items-center justify-center border-2 border-[#E5E5E5] text-[#525252] font-medium px-6 py-3 rounded-lg hover:border-[#171717] hover:bg-[#171717] hover:text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2"
```

### Ghost Button (Nav Links)
```tsx
className="text-[#737373] font-medium hover:text-[#171717] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2"
```

### Pricing Buttons
```tsx
// Free/Pro Plan (secondary style)
className="w-full bg-white text-[#171717] font-semibold py-3 rounded-lg border border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors focus-visible:ring-2 focus-visible:ring-[#FFA028]"

// Retail Plan - Featured (dark with amber focus)
className="w-full bg-[#171717] text-white font-semibold py-3 rounded-lg hover:bg-[#2D2D2D] transition-colors focus-visible:ring-2 focus-visible:ring-[#FFA028]"
```

### Button Sizes

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| Small (sm) | 28px | `px-3 py-1.5` | 14px |
| Default (md) | 36px | `px-4 py-2` | 14px |
| Large (lg) | 44px | `px-6 py-3` | 16px |

---

## 5. Section Specifications

### 5.1 Header (Sticky)
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo Icon] InsiderIntel    Features  Pricing  FAQ    [Sign In] [→]│
└─────────────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|--------------|
| **Container** | `sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5]` |
| **Height** | 64px |
| **Logo Icon** | Amber bg (`#FFA028` at 15% opacity), amber icon (`#FFA028`) |
| **Logo Text** | `font-semibold text-[#171717]` |
| **Nav Links** | `text-[#737373] hover:text-[#171717]` - hidden on mobile |
| **Sign In** | Ghost button style |
| **Get Started** | Primary CTA (amber) - small size |

### 5.2 Hero Section

| Element | Specification |
|---------|--------------|
| **Padding** | `py-16 sm:py-24 lg:py-32` |
| **Badge** | "✦ Real SEC Data • AI Insights" - `bg-[#F5F5F5] border-[#E5E5E5] text-[#525252]` |
| **H1** | `text-[#171717]` - "Track Insider Trading Activity Before the Market Moves" |
| **Subheading** | `text-[#525252]` max-width 600px |
| **Primary CTA** | Amber button with glow shadow |
| **Secondary CTA** | Outline button |
| **Dashboard Preview** | 3D transform with dark theme mockup |

**Dashboard Preview Specifications:**
- Transform: `perspective(1000px) rotateY(-5deg) rotateX(2deg)`
- Background: `#0D0D0D` (dark theme mockup)
- Card backgrounds inside: `#1A1A1A`
- Border: `#333333`
- Contains: Sidebar, Stats Cards, Cluster Alert, Transaction Table
- Floating cards with `animation: float 4s ease-in-out infinite`

### 5.3 Live Activity Feed

| Element | Specification |
|---------|--------------|
| **Background** | `#FFFFFF` |
| **Padding** | `py-16` |
| **Title** | "Live Insider Activity" - `text-[#171717]` |
| **Subtitle** | "(From SEC filings)" - `text-[#737373]` |
| **Live Dot** | Green `#00C853` with pulse animation |
| **Table Rows** | 5 transactions |
| **BUY Badge** | `bg-[rgba(0,200,83,0.12)] text-[#00C853]` |
| **SELL Badge** | `bg-[rgba(255,82,82,0.12)] text-[#FF5252]` |
| **Ticker** | `font-semibold text-[#171717]` |
| **Value** | `font-mono text-[#171717]` (right-aligned) |
| **Time** | `text-[#737373]` |

### 5.4 Trust Badges

| Element | Specification |
|---------|--------------|
| **Background** | `#F5F5F5` |
| **Padding** | `py-8` |
| **Grid** | 2 cols mobile, 4 cols desktop |
| **Icon** | 24px, `text-[#737373]` |
| **Title** | `font-medium text-[#171717]` |
| **Description** | `text-xs text-[#737373]` |

### 5.5 Features Section

| Element | Specification |
|---------|--------------|
| **Background** | `#FFFFFF` |
| **Padding** | `py-16 sm:py-24` |
| **Grid** | 1 col mobile, 2 cols md+ |
| **Card BG** | `#FFFFFF` |
| **Card Border** | `border-[#E5E5E5]` |
| **Card Hover** | `hover:-translate-y-1 hover:shadow-lg hover:border-[#D4D4D4]` |
| **Icon Container** | `bg-[#F5F5F5]` rounded, icon in `text-[#525252]` |
| **Mini Visualizations** | `bg-[#F5F5F5]` container |

**Feature Card Mini Visualizations:**
- Bar Chart: `#00C853` (positive), `#FF5252` (negative)
- Pie Chart: `#FFA028`, `#00C853`, `#4A90D9`, `#E5E5E5`
- AI Bubble: Shows significance dots

### 5.6 How It Works

| Element | Specification |
|---------|--------------|
| **Background** | `#F5F5F5` |
| **Padding** | `py-16 sm:py-24` |
| **Grid** | 1 col mobile, 3 cols sm+ |
| **Step Circle** | 48px, `bg-[#171717] text-white` |
| **Connectors** | Dashed `border-[#E5E5E5]` - hidden on mobile |

### 5.7 Use Cases

| Element | Specification |
|---------|--------------|
| **Background** | `#FFFFFF` |
| **Padding** | `py-16 sm:py-24` |
| **Grid** | 1 col mobile, 3 cols md+ |
| **Card Hover** | `hover:-translate-y-0.5 hover:shadow-md` |

### 5.8 Pricing Section

| Element | Specification |
|---------|--------------|
| **Background** | `#FFFFFF` |
| **Padding** | `py-16 sm:py-24` |
| **Toggle** | `bg-[#F5F5F5]` track, `bg-[#171717]` indicator |
| **Save Badge** | `bg-[rgba(0,200,83,0.12)] text-[#00C853]` |
| **Featured Card (Retail)** | `border-2 border-[#171717] shadow-lg` |
| **Featured Badge** | "Most Popular" - `bg-[#171717] text-white` |
| **Price** | `font-mono text-4xl text-[#171717]` |
| **Features Check (Featured)** | `text-[#00C853]` |
| **Features Check (Other)** | `text-[#737373]` |

### 5.9 FAQ Section

| Element | Specification |
|---------|--------------|
| **Background** | `#FFFFFF` |
| **Padding** | `py-16 sm:py-24` |
| **Tab (Active)** | `bg-[#F5F5F5] text-[#171717]` rounded-full |
| **Tab (Inactive)** | `text-[#737373]` |
| **Accordion Question** | `font-medium text-[#171717]` |
| **Accordion Chevron** | `text-[#737373]` - rotates on expand |
| **Accordion Answer** | `text-[#525252]` leading-relaxed |

### 5.10 Bottom CTA

| Element | Specification |
|---------|--------------|
| **Container** | `mx-4 sm:mx-6 lg:mx-8` |
| **Padding** | `py-16 sm:py-24` |
| **Background** | `bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A]` |
| **Border Radius** | `rounded-3xl` |
| **Title** | `text-white font-bold` |
| **Subtitle** | `text-[#D4D4D4]` |
| **CTA** | Amber button (primary) |
| **Disclaimer** | `text-[#737373]` |

### 5.11 Footer

| Element | Specification |
|---------|--------------|
| **Background** | `#F5F5F5` |
| **Border Top** | `border-[#E5E5E5]` |
| **Padding** | `py-12 sm:py-16` |
| **Logo** | Same as header (smaller) |
| **Tagline** | `text-[#737373]` |
| **Column Titles** | `font-semibold text-[#171717]` |
| **Links** | `text-[#737373] hover:text-[#171717]` |
| **Copyright** | `text-[#737373]` |

---

## 6. Animation Specifications

### Keyframes (globals.css)
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
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Responsive Breakpoints

| Breakpoint | Min Width | Key Changes |
|------------|-----------|-------------|
| Default | 0px | Single column, stacked CTAs |
| `sm:` | 640px | Horizontal CTAs, 3-col How It Works |
| `md:` | 768px | Nav visible, 2-col Features |
| `lg:` | 1024px | Full dashboard preview, 3-col Pricing |
| `xl:` | 1280px | Max-width containers |

---

## 8. Accessibility Checklist

- [ ] All focus rings use amber (`#FFA028`)
- [ ] Color is never the only indicator (text + icons)
- [ ] Minimum touch target 44×44px
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] FAQ accordion has `aria-expanded` and `aria-controls`
- [ ] Icon-only buttons have `aria-label`
- [ ] All interactive elements keyboard accessible
- [ ] Reduced motion media query implemented

---

## 9. Implementation Checklist

### Header
- [ ] Sticky with backdrop blur
- [ ] Logo with amber (#FFA028) icon
- [ ] Nav links hidden on mobile
- [ ] Sign In (ghost) + Get Started (amber) buttons
- [ ] Focus rings use amber

### Hero
- [ ] Cascading fade-in-up animations
- [ ] Badge with sparkle icon (neutral colors)
- [ ] Primary CTA uses amber (#FFA028)
- [ ] Dashboard preview with dark theme mockup (#0D0D0D)
- [ ] Floating notification cards

### Live Activity
- [ ] Pulsing green dot (#00C853)
- [ ] BUY badges use green (#00C853)
- [ ] SELL badges use red (#FF5252)
- [ ] Numbers right-aligned, monospace

### Features
- [ ] Cards use neutral grays (no slate)
- [ ] Mini visualizations use brand colors
- [ ] Hover uses amber focus ring

### Pricing
- [ ] Toggle indicator is dark (#171717), not amber
- [ ] Featured card has dark border (#171717)
- [ ] Save badge uses green (#00C853)
- [ ] All focus rings use amber

### Bottom CTA
- [ ] Uses dark theme colors (#0D0D0D)
- [ ] CTA button is amber (#FFA028)

### Global
- [ ] No slate-* colors anywhere
- [ ] No cyan-* colors anywhere
- [ ] All grays are neutral (0° hue)
- [ ] Inter font for UI, JetBrains Mono for data
- [ ] All focus-visible rings use amber

---

## Quick Color Reference Card

```
LIGHT THEME BACKGROUNDS:
  Page:     #FFFFFF
  Section:  #F5F5F5
  Card:     #FFFFFF
  Hover:    #FAFAFA

DARK THEME (Dashboard Preview / Bottom CTA):
  Main:     #0D0D0D
  Card:     #1A1A1A
  Elevated: #222222

TEXT (Light Theme):
  Primary:   #171717
  Secondary: #525252
  Muted:     #737373

ACCENT (Actions Only):
  Amber:       #FFA028
  Amber Hover: #FFB04D

SEMANTIC:
  Positive/BUY:  #00C853
  Negative/SELL: #FF5252

BORDERS (Light):
  Default: #E5E5E5
  Subtle:  #F0F0F0

BORDERS (Dark):
  Default: #333333
```

---

*This specification is aligned with INSIDERINTEL_UI_GUIDE.md and must be used as the reference for all landing page development.*
