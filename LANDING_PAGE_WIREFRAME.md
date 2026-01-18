# InsiderIntel Landing Page Wireframe & Design Specification

This document provides a complete specification of the landing page design, including every element, color, button, and component. Use this as a reference for development and design consistency.

---

## Table of Contents

1. [Page Overview](#1-page-overview)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing System](#4-spacing-system)
5. [Button Styles](#5-button-styles)
6. [Section-by-Section Wireframe](#6-section-by-section-wireframe)
7. [Component Library](#7-component-library)
8. [Animation Specifications](#8-animation-specifications)
9. [Responsive Breakpoints](#9-responsive-breakpoints)
10. [Accessibility Requirements](#10-accessibility-requirements)

---

## 1. Page Overview

### Page Structure (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────┐
│                    STICKY HEADER                            │
│  [Logo]              Nav Links            [Sign In] [Sign Up]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                      HERO SECTION                            │
│           Badge · H1 · Subheading · CTA Buttons              │
│                  [Dashboard Preview]                         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                   LIVE ACTIVITY FEED                         │
│              Recent Insider Transactions                     │
├─────────────────────────────────────────────────────────────┤
│                     TRUST BADGES                             │
│         SEC EDGAR · OpenFIGI · AI-Powered · SSL              │
├─────────────────────────────────────────────────────────────┤
│                   FEATURES SECTION                           │
│           4 Feature Cards (2x2 Grid)                         │
├─────────────────────────────────────────────────────────────┤
│                  HOW IT WORKS SECTION                        │
│              3 Steps (Horizontal Flow)                       │
├─────────────────────────────────────────────────────────────┤
│                   USE CASES SECTION                          │
│              3 Use Case Cards                                │
├─────────────────────────────────────────────────────────────┤
│                   PRICING SECTION                            │
│         Free · Retail ($29) · Pro ($79)                      │
├─────────────────────────────────────────────────────────────┤
│                     FAQ SECTION                              │
│        Category Tabs + Accordion Items                       │
├─────────────────────────────────────────────────────────────┤
│                   BOTTOM CTA SECTION                         │
│              Final Conversion Message                        │
├─────────────────────────────────────────────────────────────┤
│                       FOOTER                                 │
│            Links · Legal · Copyright                         │
└─────────────────────────────────────────────────────────────┘
```

### Theme Context

- **Landing Page**: Light theme (white background, dark text)
- **Dashboard Preview**: Dark theme mockup (slate-900 background)
- **Footer**: Neutral gray background

---

## 2. Color System

### Primary Palette (CSS Variables)

#### Light Mode (Landing Page Default)

| Token | HSL Value | Hex | Usage |
|-------|-----------|-----|-------|
| `--background` | `0 0% 100%` | `#FFFFFF` | Page background |
| `--foreground` | `0 0% 9%` | `#171717` | Primary text |
| `--card` | `0 0% 100%` | `#FFFFFF` | Card backgrounds |
| `--card-foreground` | `0 0% 9%` | `#171717` | Card text |
| `--primary` | `0 0% 9%` | `#171717` | Primary buttons, links |
| `--primary-foreground` | `0 0% 98%` | `#FAFAFA` | Text on primary |
| `--secondary` | `0 0% 96%` | `#F5F5F5` | Secondary backgrounds |
| `--secondary-foreground` | `0 0% 9%` | `#171717` | Secondary text |
| `--muted` | `0 0% 96%` | `#F5F5F5` | Muted backgrounds |
| `--muted-foreground` | `0 0% 45%` | `#737373` | Muted text |
| `--border` | `0 0% 90%` | `#E5E5E5` | Border color |
| `--ring` | `0 0% 9%` | `#171717` | Focus ring |

#### Semantic Colors (All Modes)

| Token | HSL Value | Hex | Usage |
|-------|-----------|-----|-------|
| `--signal-positive` | `145 100% 39%` | `#00A651` | Buy signals, success |
| `--signal-negative` | `0 100% 66%` | `#FF5555` | Sell signals, errors |
| `--accent-amber` | `36 100% 56%` | `#FFA028` | CTA accents, highlights |

### Tailwind Color Classes Used

#### Cyan (Primary CTAs)
| Class | Hex | Usage |
|-------|-----|-------|
| `cyan-500` | `#06B6D4` | CTA button gradient start |
| `cyan-400` | `#22D3EE` | CTA button gradient end |

#### Emerald (Buy/Positive)
| Class | Hex | Usage |
|-------|-----|-------|
| `emerald-500` | `#10B981` | Buy badges, positive values |
| `emerald-400` | `#34D399` | Buy badge hover |
| `emerald-100` | `#D1FAE5` | Buy badge background (light) |
| `emerald-900/30` | `rgba(6,78,59,0.3)` | Buy badge background (dark) |

#### Red (Sell/Negative)
| Class | Hex | Usage |
|-------|-----|-------|
| `red-500` | `#EF4444` | Sell badges, negative values |
| `red-400` | `#F87171` | Sell badge hover |
| `red-100` | `#FEE2E2` | Sell badge background (light) |
| `red-900/30` | `rgba(127,29,29,0.3)` | Sell badge background (dark) |

#### Slate (Dark Mockup & Text)
| Class | Hex | Usage |
|-------|-----|-------|
| `slate-900` | `#0F172A` | Dashboard preview background |
| `slate-800` | `#1E293B` | Card backgrounds in mockup |
| `slate-700` | `#334155` | Borders in mockup |
| `slate-600` | `#475569` | Muted text in mockup |
| `slate-400` | `#94A3B8` | Secondary text |
| `slate-300` | `#CBD5E1` | Light borders |
| `slate-200` | `#E2E8F0` | Very light backgrounds |
| `slate-100` | `#F1F5F9` | Section backgrounds |
| `slate-50` | `#F8FAFC` | Subtle backgrounds |

#### Orange/Yellow (Significance)
| Class | Hex | Usage |
|-------|-----|-------|
| `orange-500` | `#F97316` | High significance |
| `yellow-500` | `#EAB308` | Medium significance |
| `amber-500` | `#F59E0B` | Accent color |

---

## 3. Typography

### Font Stack

```css
font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

### Type Scale

| Element | Size (Mobile) | Size (Desktop) | Weight | Line Height | Tracking |
|---------|---------------|----------------|--------|-------------|----------|
| H1 (Hero) | 36px | 48px → 60px | 700 (Bold) | 1.1 | -0.02em (tight) |
| H2 (Section) | 28px | 36px | 700 (Bold) | 1.2 | -0.02em (tight) |
| H3 (Card Title) | 20px | 20px | 600 (Semibold) | 1.4 | Normal |
| H4 (Subsection) | 18px | 18px | 600 (Semibold) | 1.4 | Normal |
| Body Large | 16px | 18px | 400 (Normal) | 1.6 | Normal |
| Body | 14px | 16px | 400 (Normal) | 1.5 | Normal |
| Small | 12px | 14px | 400 (Normal) | 1.4 | Normal |
| Extra Small | 11px | 12px | 500 (Medium) | 1.3 | Normal |
| Badge | 11px | 11px | 600 (Semibold) | 1 | 0.04em (wide) |

### Monospace (Pricing)

```css
font-family: 'JetBrains Mono', ui-monospace, monospace;
```

| Element | Size | Weight |
|---------|------|--------|
| Price Display | 36px | 700 (Bold) |
| Code Snippets | 14px | 400 (Normal) |

---

## 4. Spacing System

### Base Unit: 4px (0.25rem)

### Vertical Spacing

| Section | Mobile | Desktop |
|---------|--------|---------|
| Hero | `py-16` (64px) | `py-24` → `py-32` (96-128px) |
| Standard Section | `py-16` (64px) | `py-24` (96px) |
| Between Elements | `gap-4` (16px) | `gap-6` → `gap-8` (24-32px) |

### Horizontal Spacing

| Element | Mobile | Desktop |
|---------|--------|---------|
| Page Container | `px-4` (16px) | `px-6` → `px-8` (24-32px) |
| Max Width | `max-w-5xl` | `max-w-5xl` (80rem) |
| Card Padding | `p-4` → `p-6` | `p-6` → `p-8` |

### Grid Gaps

| Grid Type | Gap |
|-----------|-----|
| Feature Cards | `gap-6` (mobile), `gap-8` (desktop) |
| Pricing Cards | `gap-8` |
| How It Works | `gap-8` (mobile), `gap-12` (desktop) |
| Trust Badges | `gap-4` (mobile), `gap-8` (desktop) |

---

## 5. Button Styles

### Primary CTA Button

**Visual:**
```
┌─────────────────────────────────────┐
│     Get Started Free →              │
└─────────────────────────────────────┘
```

**Specifications:**
| Property | Value |
|----------|-------|
| Background | `linear-gradient(to right, #06B6D4, #22D3EE)` |
| Text Color | `#0F172A` (slate-900) |
| Font Weight | 600 (Semibold) |
| Padding | `12px 24px` (py-3 px-6) |
| Border Radius | `8px` (rounded-lg) |
| Shadow | `0 4px 14px rgba(34, 211, 238, 0.4)` |
| Hover Shadow | `0 6px 20px rgba(34, 211, 238, 0.5)` |
| Hover Transform | `translateY(-2px)` |
| Transition | `all 200ms ease` |

**Tailwind Classes:**
```tsx
className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold px-6 py-3 rounded-lg shadow-[0_4px_14px_rgba(34,211,238,0.4)] hover:shadow-[0_6px_20px_rgba(34,211,238,0.5)] hover:-translate-y-0.5 transition-all duration-200"
```

### Secondary Button

**Visual:**
```
┌─────────────────────────────────────┐
│     See How It Works                │
└─────────────────────────────────────┘
```

**Specifications:**
| Property | Value |
|----------|-------|
| Background | Transparent |
| Border | `2px solid #CBD5E1` (slate-300) |
| Text Color | `#334155` (slate-700) |
| Font Weight | 500 (Medium) |
| Padding | `12px 24px` |
| Border Radius | `8px` |
| Hover Background | `#0F172A` (slate-900) |
| Hover Border | `#0F172A` (slate-900) |
| Hover Text | `#FFFFFF` |

**Tailwind Classes:**
```tsx
className="inline-flex items-center justify-center border-2 border-slate-300 text-slate-700 font-medium px-6 py-3 rounded-lg hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-200"
```

### Ghost Button (Nav Links)

**Specifications:**
| Property | Value |
|----------|-------|
| Background | Transparent |
| Text Color | `#64748B` (slate-500) |
| Font Weight | 500 (Medium) |
| Hover Text | `#0F172A` (slate-900) |
| Transition | `color 150ms ease` |

### Pricing Buttons

**Free/Pro Plan:**
```tsx
className="w-full bg-white text-slate-900 font-semibold py-3 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
```

**Retail Plan (Featured):**
```tsx
className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors"
```

### Button Sizes

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| Small (sm) | 28px | `px-3 py-1.5` | 14px |
| Default | 36px | `px-4 py-2` | 14px |
| Large (lg) | 44px | `px-6 py-3` | 16px |
| Icon | 36x36px | `p-2` | N/A |

---

## 6. Section-by-Section Wireframe

### 6.1 Header (Sticky)

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo Icon] InsiderIntel    Features  Pricing  FAQ    [Sign In] [→]│
└─────────────────────────────────────────────────────────────────────┘
```

**Specifications:**

| Element | Property | Value |
|---------|----------|-------|
| Container | Background | `white/80` with backdrop blur |
| Container | Border Bottom | `1px solid var(--border)` |
| Container | Height | `64px` |
| Container | Position | `sticky top-0 z-50` |
| Logo | Size | `32px` icon + text |
| Logo | Color | Amber icon, slate-900 text |
| Nav Links | Font Size | `14px` |
| Nav Links | Color | `slate-500` → `slate-900` on hover |
| Sign In | Style | Ghost button |
| Get Started | Style | Primary CTA (small) |

**Logo Component:**
```
┌──────┐
│  ↗   │ InsiderIntel
└──────┘
```
- Icon: TrendingUp in rounded container
- Icon Background: `amber-100`
- Icon Color: `amber-600`
- Text: `font-semibold text-slate-900`

---

### 6.2 Hero Section

```
                    ┌───────────────────────────────────┐
                    │  ✦ Real SEC Data • AI Insights    │
                    └───────────────────────────────────┘

              Track Insider Trading Activity
                   Before the Market Moves

        Real-time Form 4 filings and institutional holdings
          with AI-powered context. Make informed decisions.

        ┌─────────────────────┐  ┌─────────────────────┐
        │  Get Started Free → │  │ See How It Works    │
        └─────────────────────┘  └─────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │                                                          │
    │              [Dashboard Preview - 3D Tilt]               │
    │                                                          │
    │   ┌──────┐  ┌──────────────────────────────────────┐    │
    │   │ Side │  │  Stats Cards                          │    │
    │   │ bar  │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐        │    │
    │   │      │  │  │    │ │    │ │    │ │    │        │    │
    │   │      │  │  └────┘ └────┘ └────┘ └────┘        │    │
    │   │      │  │                                       │    │
    │   │      │  │  Cluster Alert                        │    │
    │   │      │  │  ┌────────────────────────────┐      │    │
    │   │      │  │  │ 🔥 Multiple insiders...    │      │    │
    │   │      │  │  └────────────────────────────┘      │    │
    │   │      │  │                                       │    │
    │   │      │  │  Recent Transactions Table           │    │
    │   └──────┘  └──────────────────────────────────────┘    │
    │                                                          │
    └─────────────────────────────────────────────────────────┘

          ┌──────────────┐              ┌──────────────┐
          │ Notification │              │ Notification │
          │ Card Float   │              │ Card Float   │
          └──────────────┘              └──────────────┘
```

**Element Specifications:**

| Element | Property | Value |
|---------|----------|-------|
| **Badge** | Background | `slate-100` |
| **Badge** | Border | `1px solid slate-200` |
| **Badge** | Text | `slate-600`, 14px |
| **Badge** | Icon | Sparkles, 16px |
| **Badge** | Animation | `fade-in-up`, delay 100ms |
| **H1** | Size | `36px` → `48px` → `60px` |
| **H1** | Color | `slate-900` |
| **H1** | Animation | `fade-in-up`, delay 200ms |
| **Subheading** | Size | `16px` → `18px` |
| **Subheading** | Color | `slate-600` |
| **Subheading** | Max Width | `600px` |
| **Subheading** | Animation | `fade-in-up`, delay 300ms |
| **CTA Group** | Layout | `flex-col` → `flex-row` |
| **CTA Group** | Gap | `12px` |
| **CTA Group** | Animation | `fade-in-up`, delay 400ms |
| **Dashboard** | Transform | `perspective(1000px) rotateY(-5deg) rotateX(2deg)` |
| **Dashboard** | Shadow | `0 25px 50px -12px rgba(0,0,0,0.25)` |
| **Dashboard** | Animation | `fade-in-up`, delay 500ms |
| **Float Cards** | Animation | `float` (4s infinite) |

**Dashboard Preview Content:**
- Sidebar: Dark slate-800, 64px wide (hidden on mobile)
- Stats Cards: 4 cards showing metrics with icons
- Cluster Alert: Orange border, fire emoji
- Transaction Table: 3 rows minimum
- Floating Cards: 2 notification-style cards with staggered delays

---

### 6.3 Live Activity Feed

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                    Live Insider Activity                             │
│                (From SEC filings) ● ━━━━                             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ NVDA  │ Director    │ ↑ BUY  │ $2.4M  │ 2 hours ago           │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │ AAPL  │ CFO         │ ↓ SELL │ $1.8M  │ 5 hours ago           │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │ MSFT  │ CEO         │ ↑ BUY  │ $5.2M  │ 1 day ago             │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │ TSLA  │ 10% Owner   │ ↓ SELL │ $12M   │ 2 days ago            │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │ GOOGL │ Director    │ ↑ BUY  │ $890K  │ 3 days ago            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Element Specifications:**

| Element | Property | Value |
|---------|----------|-------|
| **Section** | Background | `white` |
| **Section** | Padding | `py-16` |
| **Header Badge** | Background | `emerald-100` |
| **Header Badge** | Dot | Animated pulse, `emerald-500` |
| **Activity Row** | Border | `1px solid slate-200` |
| **Activity Row** | Padding | `12px 16px` |
| **Activity Row** | Animation | Slide in from left, staggered |
| **Ticker** | Font | `font-semibold`, `slate-900` |
| **Role** | Font | `14px`, `slate-500` |
| **BUY Badge** | Background | `emerald-100` |
| **BUY Badge** | Text | `emerald-700` |
| **BUY Badge** | Icon | ArrowUpRight |
| **SELL Badge** | Background | `red-100` |
| **SELL Badge** | Text | `red-700` |
| **SELL Badge** | Icon | ArrowDownRight |
| **Value** | Font | `font-medium`, `slate-900` |
| **Time** | Font | `12px`, `slate-400` |

---

### 6.4 Trust Badges

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│   │  📊         │ │  🔗         │ │  🤖         │ │  🔒         │  │
│   │ SEC EDGAR   │ │ OpenFIGI    │ │ AI-Powered  │ │ SSL Secure  │  │
│   │ Official    │ │ CUSIP Data  │ │ Analysis    │ │ 256-bit     │  │
│   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Element Specifications:**

| Element | Property | Value |
|---------|----------|-------|
| **Container** | Background | `slate-50` |
| **Container** | Padding | `py-8` |
| **Grid** | Columns | `2` (mobile) → `4` (desktop) |
| **Grid** | Gap | `16px` → `32px` |
| **Badge Icon** | Size | `24px` |
| **Badge Icon** | Color | `slate-400` |
| **Badge Title** | Font | `14px`, `font-medium`, `slate-900` |
| **Badge Desc** | Font | `12px`, `slate-500` |

---

### 6.5 Features Section

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                    Everything you need to                            │
│                  track insider activity                              │
│                                                                      │
│   ┌─────────────────────────┐  ┌─────────────────────────┐          │
│   │ 📈 Real-Time Tracking   │  │ 🏛️ Institutional Data   │          │
│   │                         │  │                          │          │
│   │ Form 4 filings within   │  │ 13F holdings from major │          │
│   │ hours of SEC release    │  │ institutions quarterly  │          │
│   │                         │  │                          │          │
│   │ ┌─────────────────────┐ │  │ ┌────────────────────┐  │          │
│   │ │ Mini Bar Chart      │ │  │ │ Mini Pie Chart     │  │          │
│   │ │ ████ ██ ███         │ │  │ │      ◐            │  │          │
│   │ └─────────────────────┘ │  │ └────────────────────┘  │          │
│   └─────────────────────────┘  └─────────────────────────┘          │
│                                                                      │
│   ┌─────────────────────────┐  ┌─────────────────────────┐          │
│   │ 🤖 AI-Powered Context   │  │ 🔔 Smart Alerts         │          │
│   │                         │  │                          │          │
│   │ Claude AI analyzes each │  │ Get notified when       │          │
│   │ trade for significance  │  │ important trades happen │          │
│   │                         │  │                          │          │
│   │ ┌─────────────────────┐ │  │ ┌────────────────────┐  │          │
│   │ │ AI Insight Bubble   │ │  │ │ Alert List         │  │          │
│   │ │ "This purchase..."  │ │  │ │ ● NVDA ● AAPL     │  │          │
│   │ └─────────────────────┘ │  │ └────────────────────┘  │          │
│   └─────────────────────────┘  └─────────────────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Feature Card Specifications:**

| Element | Property | Value |
|---------|----------|-------|
| **Card** | Background | `white` |
| **Card** | Border | `1px solid slate-200` |
| **Card** | Border Radius | `12px` |
| **Card** | Padding | `24px` |
| **Card** | Hover Shadow | `shadow-lg` |
| **Card** | Hover Transform | `translateY(-4px)` |
| **Card** | Hover Border | `slate-300` |
| **Icon Container** | Size | `40px` |
| **Icon Container** | Background | `slate-100` |
| **Icon Container** | Border Radius | `8px` |
| **Icon** | Size | `20px` |
| **Icon** | Color | `slate-600` |
| **Title** | Font | `18px`, `font-semibold`, `slate-900` |
| **Description** | Font | `14px`, `slate-600` |
| **Mini Visual** | Background | `slate-50` |
| **Mini Visual** | Border Radius | `8px` |
| **Mini Visual** | Margin Top | `16px` |

**Mini Visualization Colors:**
- Bar Chart Bars: `emerald-500` (buy), `red-400` (sell)
- Pie Chart Segments: `cyan-500`, `emerald-500`, `amber-500`, `slate-300`
- AI Bubble: `slate-100` background, significance dots (orange/yellow/green)
- Alert List: Dot indicators matching transaction type

---

### 6.6 How It Works Section

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                       How It Works                                   │
│                                                                      │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐        │
│   │      1      │      │      2      │      │      3      │        │
│   │             │      │             │      │             │        │
│   │   Create    │ ───→ │   Track     │ ───→ │   Act on    │        │
│   │   Account   │      │   Insiders  │      │   Insights  │        │
│   │             │      │             │      │             │        │
│   │ Sign up in  │      │ Add stocks  │      │ Get AI      │        │
│   │ 30 seconds  │      │ to watchlist│      │ analysis    │        │
│   └─────────────┘      └─────────────┘      └─────────────┘        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Element Specifications:**

| Element | Property | Value |
|---------|----------|-------|
| **Container** | Background | `slate-50` |
| **Grid** | Columns | `1` (mobile) → `3` (desktop) |
| **Grid** | Gap | `32px` → `48px` |
| **Step Number** | Size | `48px` circle |
| **Step Number** | Background | `slate-900` |
| **Step Number** | Text | `white`, `20px`, `font-bold` |
| **Step Title** | Font | `18px`, `font-semibold`, `slate-900` |
| **Step Desc** | Font | `14px`, `slate-600` |
| **Connector** | Style | Dashed line (hidden on mobile) |

---

### 6.7 Use Cases Section

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                    Built for Every Investor                          │
│                                                                      │
│   ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ │
│   │ 👤 Retail Investor│ │ 📊 Day Trader     │ │ 🏢 Analyst        │ │
│   │                   │ │                   │ │                   │ │
│   │ Track insider     │ │ Get real-time     │ │ Research          │ │
│   │ activity in       │ │ alerts for        │ │ institutional     │ │
│   │ your portfolio    │ │ trading signals   │ │ ownership         │ │
│   └───────────────────┘ └───────────────────┘ └───────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Element Specifications:**

| Element | Property | Value |
|---------|----------|-------|
| **Card** | Background | `white` |
| **Card** | Border | `1px solid slate-200` |
| **Card** | Padding | `24px` |
| **Card** | Hover Shadow | `shadow-md` |
| **Card** | Hover Transform | `translateY(-2px)` |
| **Icon** | Size | `32px` |
| **Icon** | Color | `slate-600` |
| **Title** | Font | `16px`, `font-semibold`, `slate-900` |
| **Description** | Font | `14px`, `slate-600` |

---

### 6.8 Pricing Section

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                    Simple, Transparent Pricing                       │
│                                                                      │
│                    ┌──────────────────────┐                         │
│                    │ Monthly  ○───● Annual │ Save 20%               │
│                    └──────────────────────┘                         │
│                                                                      │
│  ┌─────────────────┐ ┌─────────────────────┐ ┌─────────────────┐   │
│  │      FREE       │ │ ★ MOST POPULAR ★    │ │      PRO        │   │
│  │                 │ │      RETAIL         │ │   For Teams     │   │
│  │      $0         │ │                     │ │                 │   │
│  │    /month       │ │      $29            │ │      $79        │   │
│  │                 │ │    /month           │ │    /month       │   │
│  │ ✓ Basic access  │ │                     │ │                 │   │
│  │ ✓ 10 watchlist  │ │ ✓ Everything Free   │ │ ✓ Everything    │   │
│  │ ✓ Daily digest  │ │ ✓ Unlimited watch   │ │ ✓ API access    │   │
│  │                 │ │ ✓ Instant alerts    │ │ ✓ Priority      │   │
│  │                 │ │ ✓ AI insights       │ │ ✓ Team sharing  │   │
│  │                 │ │                     │ │                 │   │
│  │ [Get Started]   │ │ [Start Free Trial]  │ │ [Contact Sales] │   │
│  └─────────────────┘ └─────────────────────┘ └─────────────────┘   │
│                                                                      │
│              💰 30-day money-back guarantee                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Pricing Card Specifications:**

| Element | Property | Free | Retail | Pro |
|---------|----------|------|--------|-----|
| **Card BG** | Background | `white` | `white` | `white` |
| **Card Border** | Border | `slate-200` | `slate-900` (2px) | `slate-200` |
| **Card Shadow** | Shadow | None | `shadow-lg` | None |
| **Badge** | Display | None | "Most Popular" | "For Teams" |
| **Badge BG** | Background | - | `slate-900` | `slate-100` |
| **Price** | Font | `36px`, mono, `slate-900` | Same | Same |
| **Period** | Font | `14px`, `slate-500` | Same | Same |
| **Features** | Icon | Check, `slate-400` | Check, `emerald-500` | Check, `slate-400` |
| **Button** | Style | Secondary | Primary (dark) | Secondary |

**Toggle Switch:**
| State | Style |
|-------|-------|
| Monthly | Default, gray background |
| Annual | Active, slate-900 background |
| Save Badge | `emerald-100` bg, `emerald-700` text |

---

### 6.9 FAQ Section

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                   Frequently Asked Questions                         │
│                                                                      │
│    ┌──────────┐  ┌──────────┐  ┌─────────────────┐                  │
│    │ Product  │  │ Billing  │  │ Data & Security │                  │
│    └──────────┘  └──────────┘  └─────────────────┘                  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ▼ How fresh is the insider trading data?                       │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │   Our data comes directly from SEC EDGAR. Form 4 filings       │ │
│  │   typically appear within hours of being submitted...          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ▶ What does the AI analysis include?                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ▶ Can I export the data?                                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│         Still have questions? Contact support →                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Element Specifications:**

| Element | Property | Value |
|---------|----------|-------|
| **Tab** | Background | `transparent` → `slate-100` (active) |
| **Tab** | Text | `slate-500` → `slate-900` (active) |
| **Tab** | Border Radius | `9999px` (full) |
| **Tab** | Padding | `8px 16px` |
| **Question** | Background | `white` |
| **Question** | Border | `1px solid slate-200` |
| **Question** | Padding | `16px 20px` |
| **Question** | Font | `15px`, `font-medium`, `slate-900` |
| **Chevron** | Size | `20px` |
| **Chevron** | Color | `slate-400` |
| **Chevron** | Rotation | `0deg` → `180deg` (open) |
| **Answer** | Font | `14px`, `slate-600` |
| **Answer** | Padding | `0 20px 16px` |
| **Answer** | Line Height | `1.6` |

---

### 6.10 Bottom CTA Section

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░                                                                  ░ │
│ ░           Ready to track insider activity?                       ░ │
│ ░                                                                  ░ │
│ ░      Join thousands of investors using InsiderIntel              ░ │
│ ░                                                                  ░ │
│ ░              ┌─────────────────────────────┐                     ░ │
│ ░              │    Get Started Free →       │                     ░ │
│ ░              └─────────────────────────────┘                     ░ │
│ ░                                                                  ░ │
│ ░                   No credit card required                        ░ │
│ ░                                                                  ░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Element Specifications:**

| Element | Property | Value |
|---------|----------|-------|
| **Container** | Background | `linear-gradient(to br, slate-900, slate-800)` |
| **Container** | Padding | `64px` → `96px` |
| **Container** | Border Radius | `24px` |
| **H2** | Font | `28px` → `36px`, `font-bold`, `white` |
| **Subtitle** | Font | `16px` → `18px`, `slate-300` |
| **CTA Button** | Style | Primary CTA (cyan gradient) |
| **Disclaimer** | Font | `14px`, `slate-400` |

---

### 6.11 Footer

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  [Logo] InsiderIntel          Product    Company    Legal           │
│                               Features   About      Terms           │
│  Track insider trading        Pricing    Contact    Privacy         │
│  with confidence              FAQ        Blog       Disclaimer      │
│                                                                      │
│ ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  © 2026 InsiderIntel. All rights reserved.                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Element Specifications:**

| Element | Property | Value |
|---------|----------|-------|
| **Container** | Background | `slate-50` |
| **Container** | Border Top | `1px solid slate-200` |
| **Container** | Padding | `48px` → `64px` |
| **Logo** | Size | `24px` icon |
| **Tagline** | Font | `14px`, `slate-500` |
| **Column Title** | Font | `14px`, `font-semibold`, `slate-900` |
| **Links** | Font | `14px`, `slate-500` |
| **Links** | Hover | `slate-900` |
| **Divider** | Border | `1px solid slate-200` |
| **Copyright** | Font | `14px`, `slate-500` |

---

## 7. Component Library

### 7.1 Badge Component

**Variants:**

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| `default` | `slate-100` | `slate-900` | None |
| `secondary` | `slate-100` | `slate-500` | None |
| `outline` | Transparent | `slate-700` | `slate-300` |
| `buy` | `emerald-100` | `emerald-700` | None |
| `sell` | `red-100` | `red-700` | None |
| `new` | `amber-100` | `amber-700` | None |
| `premium` | `gradient amber` | `amber-900` | None |

**Size:**
- Padding: `px-2.5 py-0.5`
- Font: `11px`, `font-semibold`, `uppercase`
- Border Radius: `9999px` (full)

### 7.2 Card Component

**Base Card:**
```tsx
className="bg-card text-card-foreground rounded-xl border shadow-sm"
```

**Interactive Card:**
```tsx
className="bg-card text-card-foreground rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-primary/50 cursor-pointer"
```

**Card Parts:**
| Part | Padding |
|------|---------|
| `CardHeader` | `p-6 pb-4` |
| `CardContent` | `p-6 pt-0` |
| `CardFooter` | `p-6 pt-0` |

### 7.3 Logo Component

**Sizes:**

| Size | Icon Container | Icon | Text |
|------|---------------|------|------|
| `sm` | `24px` | `14px` | `16px` |
| `md` | `32px` | `18px` | `18px` |
| `lg` | `40px` | `22px` | `20px` |

**Variants:**
| Variant | Icon BG | Icon Color | Text |
|---------|---------|------------|------|
| `default` | `amber-100` | `amber-600` | `slate-900` |
| `light` | `amber-500/20` | `amber-400` | `white` |
| `dark` | `amber-100` | `amber-600` | `slate-900` |

---

## 8. Animation Specifications

### 8.1 Keyframe Animations

**Float (Dashboard Cards):**
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
/* Duration: 4s, Timing: ease-in-out, Iteration: infinite */
```

**Fade In Up (Hero Elements):**
```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Duration: 600ms, Timing: ease-out, Fill: forwards */
```

**Scale In:**
```css
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
/* Duration: 400ms, Timing: ease-out, Fill: forwards */
```

**Pulse Glow (Activity Indicator):**
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}
/* Duration: 2s, Timing: ease-in-out, Iteration: infinite */
```

### 8.2 Animation Delays (Hero Cascade)

| Element | Delay |
|---------|-------|
| Badge | `100ms` |
| H1 | `200ms` |
| Subheading | `300ms` |
| CTA Buttons | `400ms` |
| Dashboard Preview | `500ms` |

### 8.3 Transition Defaults

```css
transition-property: color, background-color, border-color, transform, box-shadow, opacity;
transition-duration: 150ms;
transition-timing-function: ease-out;
```

### 8.4 Hover Transforms

| Element | Transform | Shadow Change |
|---------|-----------|---------------|
| CTA Button | `translateY(-2px)` | Increase glow intensity |
| Feature Card | `translateY(-4px)` | `shadow-lg` |
| Pricing Card | `translateY(-2px)` | `shadow-md` |
| Use Case Card | `translateY(-2px)` | `shadow-md` |

---

## 9. Responsive Breakpoints

### Tailwind Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| Default | `0px` | Mobile-first base styles |
| `sm:` | `640px` | Larger phones, small tablets |
| `md:` | `768px` | Tablets |
| `lg:` | `1024px` | Laptops, small desktops |
| `xl:` | `1280px` | Large desktops |

### Layout Changes by Breakpoint

**Hero Section:**
| Breakpoint | H1 Size | CTA Layout | Dashboard |
|------------|---------|------------|-----------|
| Mobile | `36px` | Stacked | Simplified |
| `sm:` | `48px` | Horizontal | Full width |
| `lg:` | `60px` | Horizontal | With sidebar |

**Features Grid:**
| Breakpoint | Columns |
|------------|---------|
| Mobile | 1 |
| `md:` | 2 |

**Pricing Grid:**
| Breakpoint | Columns |
|------------|---------|
| Mobile | 1 |
| `lg:` | 3 |

**How It Works:**
| Breakpoint | Columns |
|------------|---------|
| Mobile | 1 (stacked) |
| `sm:` | 3 (horizontal) |

**Header:**
| Breakpoint | Nav | Buttons |
|------------|-----|---------|
| Mobile | Hidden | Hamburger |
| `md:` | Visible | Both visible |

---

## 10. Accessibility Requirements

### 10.1 Color Contrast

All text meets WCAG AA standards:
| Combination | Ratio | Requirement |
|-------------|-------|-------------|
| slate-900 on white | 12.6:1 | ✓ AAA |
| slate-600 on white | 5.7:1 | ✓ AA |
| slate-500 on white | 4.6:1 | ✓ AA |
| white on slate-900 | 12.6:1 | ✓ AAA |
| white on cyan-500 | 3.1:1 | ✓ AA (large text) |

### 10.2 Focus States

All interactive elements have visible focus:
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-primary
focus-visible:ring-offset-2
```

### 10.3 Touch Targets

Minimum touch target: `44px × 44px`
- Buttons: `min-height: 36px` + padding
- Links: Adequate padding
- Icons: `44px` touch area

### 10.4 Semantic HTML

- Proper heading hierarchy (H1 → H2 → H3)
- Section elements for major sections
- Nav element for navigation
- Button elements for actions
- Link elements for navigation

### 10.5 ARIA Attributes

| Element | Attribute |
|---------|-----------|
| FAQ Accordion | `aria-expanded`, `aria-controls` |
| Toggle Switch | `aria-pressed`, `aria-label` |
| Icon Buttons | `aria-label` |
| Badges | `role="status"` |
| Loading States | `aria-busy="true"` |

### 10.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

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

*Last updated: January 18, 2026*
