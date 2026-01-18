# InsiderIntel Landing Page - Visual Enhancements TODO

> **For:** Claude Code
> **Purpose:** Add grid background, scrolling ticker, and enhanced dashboard mockup
> **Date:** January 18, 2026
> **Priority:** High (visual polish)

---

## Summary of Enhancements

These three features are from the original HTML prototype and add significant visual polish:

| Feature | What It Does | Location |
|---------|--------------|----------|
| **Grid Background** | Technical graph-paper style grid that fades out | Hero section |
| **Ticker Tape** | Horizontally scrolling insider transactions | Below hero, above Trust Badges |
| **Dashboard Mockup** | Enhanced 3D preview with stats, table, and floating cards | Hero section |

---

## ⚠️ Brand Color Reminder

| Element | Correct Color | Notes |
|---------|---------------|-------|
| BUY Badge | `bg-[rgba(0,200,83,0.12)] text-[#00C853]` | NOT emerald |
| SELL Badge | `bg-[rgba(255,82,82,0.12)] text-[#FF5252]` | NOT red-500 |
| Dashboard BG | `#0D0D0D` | NOT slate-900 |
| Dashboard Card | `#1A1A1A` | NOT slate-800 |
| Dashboard Border | `#333333` | Neutral gray |
| Amber Accent | `#FFA028` | Actions/interactive ONLY |
| Light Border | `#E5E5E5` | For ticker items, grid |

---

## Phase 1: Grid Background

### Task 1.1: Add Grid CSS
**File:** `src/app/globals.css`

Add this CSS:
```css
.hero-grid-bg {
  position: relative;
  background-color: #FFFFFF;
  background-image: 
    linear-gradient(#E5E5E5 1px, transparent 1px),
    linear-gradient(90deg, #E5E5E5 1px, transparent 1px);
  background-size: 40px 40px;
}

.hero-grid-bg::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to bottom, transparent, #FFFFFF);
  pointer-events: none;
}

.hero-grid-bg > * {
  position: relative;
  z-index: 1;
}
```

- [ ] Add CSS to globals.css
- [ ] Verify no visual conflicts

### Task 1.2: Apply to Hero Section
**File:** `src/app/page.tsx` (or hero component)

- [ ] Add `hero-grid-bg` class to hero section container
- [ ] Ensure content has `relative z-10` to appear above fade
- [ ] Test on multiple screen sizes

---

## Phase 2: Ticker Tape

### Task 2.1: Add Animation CSS
**File:** `src/app/globals.css`

Add this CSS:
```css
@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.ticker-track {
  display: flex;
  gap: 24px;
  animation: ticker-scroll 30s linear infinite;
  width: max-content;
  will-change: transform;
}

.ticker-track:hover {
  animation-play-state: paused;
}
```

- [ ] Add animation CSS to globals.css

### Task 2.2: Create Component
**File:** `src/components/landing/ticker-tape.tsx`

Component should include:
- [ ] Array of ticker data (10+ items)
- [ ] Items duplicated for seamless loop
- [ ] BUY badges: `bg-[rgba(0,200,83,0.12)] text-[#00C853]`
- [ ] SELL badges: `bg-[rgba(255,82,82,0.12)] text-[#FF5252]`
- [ ] Live indicator with pulsing green dot
- [ ] Container: `bg-[#F5F5F5] border-y border-[#E5E5E5]`
- [ ] Items: `bg-white border border-[#E5E5E5]`

### Task 2.3: Add to Page
**File:** `src/app/page.tsx`

- [ ] Import TickerTape component
- [ ] Place after hero section, before Trust Badges
- [ ] Verify positioning is correct

### Task 2.4: Mobile Responsive
- [ ] Animation speed OK on mobile (consider 20s)
- [ ] Items readable on small screens
- [ ] Pauses on hover/touch

---

## Phase 3: Dashboard Mockup

### Task 3.1: Add Dashboard CSS
**File:** `src/app/globals.css`

Add this CSS:
```css
.dashboard-preview {
  background: #0D0D0D;
  border: 1px solid #333333;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  transform: perspective(1000px) rotateX(2deg);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.dashboard-preview:hover {
  transform: perspective(1000px) rotateX(0deg);
}
```

- [ ] Add dashboard CSS to globals.css

### Task 3.2: Create/Update Dashboard Component
**File:** `src/components/landing/dashboard-preview.tsx`

Component structure:
- [ ] Header with logo icon and "LIVE" indicator
- [ ] 4 Stat Cards in grid (2x2 on mobile, 4 cols on desktop)
- [ ] Transaction table with 3 sample rows
- [ ] All using correct dark theme colors

**Stat Cards:**
| Card | Label | Value | Change |
|------|-------|-------|--------|
| 1 | Insider Buys (24h) | $24.5M | +12.3% (green) |
| 2 | Insider Sells (24h) | $18.2M | -5.1% (red) |
| 3 | Cluster Alerts | 3 | High Significance (amber) |
| 4 | Watchlist Activity | 12 | 4 New Trades (green) |

**Transaction Rows:**
| Name | Role | Ticker | Type | Value | Time |
|------|------|--------|------|-------|------|
| Tim Cook | CEO | AAPL | BUY | $2,450,000 | 2m ago |
| Jensen Huang | CEO | NVDA | SELL | $890,120 | 14m ago |
| Satya Nadella | CEO | MSFT | BUY | $1,200,000 | 28m ago |

- [ ] Create component with header
- [ ] Add 4 stat cards
- [ ] Add transaction table
- [ ] Verify all colors correct

### Task 3.3: Add Float Animation
**File:** `src/app/globals.css`

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
  will-change: transform;
}
```

- [ ] Add float animation CSS

### Task 3.4: Add Floating Cards
**File:** Hero section in `src/app/page.tsx`

Add floating notification cards around dashboard:
- [ ] Top-left card: "New Cluster Alert - NVDA • 3 Insiders"
- [ ] Top-right card: "Alert Triggered - AAPL • $2.4M Buy"
- [ ] Bottom-left card: BUY badge + "TSLA $5.6M"
- [ ] All with `animate-float` and staggered delays
- [ ] Hidden on mobile (`hidden sm:block`)

### Task 3.5: Mobile Responsive
- [ ] Stats grid: 2 cols tablet, 1 col mobile (if needed)
- [ ] Transaction table: horizontal scroll on mobile
- [ ] 3D tilt: reduce or remove on mobile
- [ ] Floating cards: hide on mobile

---

## Phase 4: Reduced Motion & Performance

### Task 4.1: Add Reduced Motion Support
**File:** `src/app/globals.css`

```css
@media (prefers-reduced-motion: reduce) {
  .ticker-track,
  .animate-float,
  .dashboard-preview {
    animation: none !important;
    transition: none !important;
  }
  
  .dashboard-preview {
    transform: none !important;
  }
}
```

- [ ] Add reduced motion media query
- [ ] Test with system preference enabled

### Task 4.2: Performance Check
- [ ] Animations use transform/opacity only (GPU accelerated)
- [ ] will-change added to animated elements
- [ ] No layout thrashing during animations

---

## Phase 5: Final Verification

### Task 5.1: Visual Check
- [ ] Grid background visible in hero
- [ ] Grid fades out at bottom
- [ ] Ticker scrolls smoothly
- [ ] Ticker pauses on hover
- [ ] Dashboard has 3D tilt
- [ ] Dashboard flattens on hover
- [ ] Floating cards animate

### Task 5.2: Color Compliance
- [ ] No slate-* colors used
- [ ] No emerald-* colors used
- [ ] BUY uses #00C853
- [ ] SELL uses #FF5252
- [ ] Dashboard uses #0D0D0D, #1A1A1A, #333333
- [ ] Amber only on interactive elements

### Task 5.3: Responsive Check
- [ ] Mobile (375px): Grid visible, ticker scrolls, dashboard stacks
- [ ] Tablet (768px): Floating cards visible, 2-col stats
- [ ] Desktop (1024px+): Full experience

### Task 5.4: Accessibility Check
- [ ] Reduced motion respected
- [ ] Ticker pauses on hover (for readability)
- [ ] Dashboard is decorative (aria-hidden="true" acceptable)
- [ ] Floating cards decorative (aria-hidden="true")

---

## Files to Create/Modify

| File | Action | Priority |
|------|--------|----------|
| `src/app/globals.css` | Add grid, ticker, dashboard, float CSS | High |
| `src/components/landing/ticker-tape.tsx` | Create new component | High |
| `src/components/landing/dashboard-preview.tsx` | Create/update component | High |
| `src/app/page.tsx` | Add grid class, ticker, floating cards | High |

---

## Completion Checklist

- [ ] **Phase 1:** Grid Background added
- [ ] **Phase 2:** Ticker Tape working
- [ ] **Phase 3:** Dashboard Mockup enhanced
- [ ] **Phase 4:** Reduced motion support
- [ ] **Phase 5:** Final verification passed

---

## Quick CSS Reference

```css
/* All new CSS for globals.css */

/* Grid Background */
.hero-grid-bg {
  position: relative;
  background-color: #FFFFFF;
  background-image: 
    linear-gradient(#E5E5E5 1px, transparent 1px),
    linear-gradient(90deg, #E5E5E5 1px, transparent 1px);
  background-size: 40px 40px;
}
.hero-grid-bg::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 120px;
  background: linear-gradient(to bottom, transparent, #FFFFFF);
  pointer-events: none;
}
.hero-grid-bg > * { position: relative; z-index: 1; }

/* Ticker Animation */
@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.ticker-track {
  display: flex;
  gap: 24px;
  animation: ticker-scroll 30s linear infinite;
  width: max-content;
  will-change: transform;
}
.ticker-track:hover { animation-play-state: paused; }

/* Dashboard Preview */
.dashboard-preview {
  background: #0D0D0D;
  border: 1px solid #333333;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  transform: perspective(1000px) rotateX(2deg);
  transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
  will-change: transform;
}
.dashboard-preview:hover {
  transform: perspective(1000px) rotateX(0deg);
}

/* Float Animation */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
  will-change: transform;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .ticker-track, .animate-float, .dashboard-preview {
    animation: none !important;
    transition: none !important;
  }
  .dashboard-preview { transform: none !important; }
}
```

---

*Use with LANDING_PAGE_ENHANCEMENTS_PROMPTS.md for detailed implementation.*
