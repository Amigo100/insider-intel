# InsiderIntel Authentication Pages - Implementation Todo List

> **For:** Claude Code
> **Reference:** INSIDERINTEL_UI_GUIDE.md + AUTH_PAGES_SPECIFICATION.md
> **Date:** January 18, 2026
> **Purpose:** Update auth pages to align with brand guidelines and improve UI/UX

---

## ⚠️ CRITICAL: Brand Color Rules

**The Five Golden Rules:**
1. **Amber Rule:** `#FFA028` for interactive elements ONLY
2. **Density Rule:** N/A for auth pages
3. **Loading Rule:** No spinners for page loads - skeleton screens only (button spinners OK)
4. **Keyboard Rule:** Every mouse action works with keyboard
5. **Alignment Rule:** Numbers right-aligned with tabular figures

**FORBIDDEN Colors (Must Replace):**
| ❌ WRONG | ✅ CORRECT | Location |
|----------|-----------|----------|
| `slate-900` | `#0D0D0D` | Left panel background |
| `slate-800` | `#1A1A1A` | Left panel gradient |
| `emerald-500` | `#00C853` | Success states, password strength |
| `emerald-100` | `rgba(0,200,83,0.12)` | Success backgrounds |
| `red-500` | `#FF5252` | Error states |
| `orange-500` | `#FFB300` | Warning/fair password |

---

## Summary of Required Changes

### Color Fixes (Priority 1)
- Replace all slate-* with neutral grays
- Replace emerald-* with brand green (#00C853)
- Replace red-500 with brand red (#FF5252)
- Verify amber (#FFA028) usage is correct

### UI Improvements (Priority 2)
- Enhance glassmorphism effect on left panel
- Improve visual hierarchy and spacing
- Add subtle animations for premium feel
- Skeleton loading for initial page load

### Accessibility Improvements (Priority 3)
- Verify all focus rings use amber
- Ensure color is not the only indicator
- Test keyboard navigation flow

---

## Phase 1: Color System Audit & Fix

### Task 1.1: Audit Auth Layout File
**File:** `src/app/(auth)/layout.tsx`

- [ ] Search for `slate-` classes
- [ ] Search for `emerald-` classes
- [ ] List all color classes used

### Task 1.2: Fix Left Panel Gradient
**Current:**
```tsx
className="from-slate-900 via-slate-800 to-slate-900"
```

**Replace with:**
```tsx
className="from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D]"
```

### Task 1.3: Fix Gradient Orbs
**Current:**
```tsx
// Orb 1
className="bg-primary/20"  // This is OK if primary = amber

// Orb 2
className="bg-emerald-500/10"
```

**Replace Orb 2 with:**
```tsx
className="bg-[rgba(0,200,83,0.1)]"
```

### Task 1.4: Fix Grid Pattern
**Current:** `#ffffff08` - This is OK (white at 8% opacity)

### Task 1.5: Fix Stat Card Colors
**Current:**
```tsx
className="bg-white/5 border-white/10"
```
**Status:** ✅ OK - No changes needed

### Task 1.6: Fix Value Prop Card Colors
**Current:**
```tsx
className="bg-white/5 backdrop-blur border-white/10"
```
**Status:** ✅ OK - No changes needed

---

## Phase 2: Login Form Updates

### Task 2.1: Audit Login Form
**File:** `src/app/(auth)/login/login-form.tsx`

- [ ] Verify primary button uses amber (`#FFA028`)
- [ ] Verify focus rings use amber
- [ ] Check error states use `#FF5252`

### Task 2.2: Fix Primary Button (if needed)
**Correct specification:**
```tsx
className="w-full h-11 bg-[#FFA028] hover:bg-[#FFB04D] text-[#171717] font-semibold rounded-[6px] shadow-sm hover:shadow-md active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2"
```

### Task 2.3: Fix Error Alert
**Current:** `bg-destructive/10` - Verify destructive = `#FF5252`

**Correct specification:**
```tsx
// Alert container
className="bg-[rgba(255,82,82,0.1)] border border-[rgba(255,82,82,0.2)] rounded-lg p-4"

// Alert icon
className="text-[#FF5252]"

// Alert text
className="text-[#FF5252] font-medium"
```

### Task 2.4: Fix Input Focus States
**Correct specification:**
```tsx
className="h-11 rounded-[6px] border-[#E5E5E5] focus:border-[#FFA028] focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-0"
```

### Task 2.5: Fix Input Error States
**Correct specification:**
```tsx
// When invalid
className="border-[#FF5252] focus-visible:ring-[#FF5252]"

// Error message
className="text-xs text-[#FF5252] mt-1"
```

### Task 2.6: Fix "Forgot Password" Link
**Correct specification:**
```tsx
// Should be interactive, can use amber or stay neutral
className="text-[#737373] hover:text-[#171717] text-sm underline-offset-4 hover:underline transition-colors"
```

### Task 2.7: Fix Divider
**Correct specification:**
```tsx
// Line
className="border-t border-[#E5E5E5]"

// Text
className="text-[#737373] text-xs bg-white px-2"
```

### Task 2.8: Fix Google Button
**Correct specification:**
```tsx
className="w-full h-11 bg-white border-2 border-[#E5E5E5] text-[#171717] font-medium rounded-[6px] hover:bg-[#F5F5F5] transition-colors focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2"
```

### Task 2.9: Fix Sign Up Link
**Correct specification:**
```tsx
// "Don't have an account?" 
className="text-[#737373]"

// "Sign up for free" (interactive link)
className="text-[#FFA028] hover:text-[#FFB04D] font-medium hover:underline transition-colors"
```

---

## Phase 3: Signup Form Updates

### Task 3.1: Audit Signup Form
**File:** `src/app/(auth)/signup/signup-form.tsx`

- [ ] Same checks as login form
- [ ] Additional: Password strength indicator colors

### Task 3.2: Fix Password Strength Indicator
**File:** `src/components/auth/password-strength.tsx`

**Current Color Mapping:**
| Level | Current | Correct |
|-------|---------|---------|
| Weak (1) | `bg-red-500` | `bg-[#FF5252]` |
| Fair (2) | `bg-orange-500` | `bg-[#FFB300]` |
| Good (3) | `bg-yellow-500` | `bg-[#FFB300]` or keep |
| Strong (4) | `bg-emerald-500` | `bg-[#00C853]` |

**Text Color Mapping:**
| Level | Current | Correct |
|-------|---------|---------|
| Weak | `text-red-500` | `text-[#FF5252]` |
| Fair | `text-orange-500` | `text-[#FFB300]` |
| Good | `text-yellow-600` | `text-[#FFB300]` |
| Strong | `text-emerald-500` | `text-[#00C853]` |

**Correct implementation:**
```tsx
const strengthColors = {
  0: { bar: 'bg-[#E5E5E5]', text: 'text-[#737373]' },
  1: { bar: 'bg-[#FF5252]', text: 'text-[#FF5252]', label: 'Weak' },
  2: { bar: 'bg-[#FFB300]', text: 'text-[#FFB300]', label: 'Fair' },
  3: { bar: 'bg-[#FFB300]', text: 'text-[#FFB300]', label: 'Good' },
  4: { bar: 'bg-[#00C853]', text: 'text-[#00C853]', label: 'Strong' },
};
```

### Task 3.3: Fix Requirements Checklist
**Correct specification:**
```tsx
// Unmet requirement
className="text-[#737373]"

// Met requirement (with checkmark)
className="text-[#00C853]"

// Checkmark icon
className="w-4 h-4 text-[#00C853]"
```

### Task 3.4: Fix Terms Checkbox
**Correct specification:**
```tsx
// Checkbox focus
className="focus-visible:ring-2 focus-visible:ring-[#FFA028]"

// Checkbox checked
className="data-[state=checked]:bg-[#171717] data-[state=checked]:border-[#171717]"

// Links in terms text
className="text-[#FFA028] hover:text-[#FFB04D] underline"
```

### Task 3.5: Fix Password Match Indicator
**Correct specification:**
```tsx
// Passwords match
className="text-[#00C853]"

// Passwords don't match
className="text-[#FF5252]"
```

---

## Phase 4: Success State Updates

### Task 4.1: Fix Email Confirmation Success State
**File:** `src/app/(auth)/signup/signup-form.tsx` (or separate component)

**Current:**
```tsx
// Icon background
className="bg-emerald-100 dark:bg-emerald-900/30"

// Icon
className="text-emerald-600 dark:text-emerald-400"
```

**Replace with:**
```tsx
// Icon background (light theme)
className="bg-[rgba(0,200,83,0.12)]"

// Icon
className="text-[#00C853]"
```

### Task 4.2: Fix Success Message Styling
**Correct specification:**
```tsx
// Container
className="text-center p-8"

// Icon container
className="w-16 h-16 mx-auto mb-6 rounded-full bg-[rgba(0,200,83,0.12)] flex items-center justify-center"

// CheckCircle icon
className="w-8 h-8 text-[#00C853]"

// Title
className="text-2xl font-bold text-[#171717] mb-2"

// Description
className="text-[#525252] mb-6"

// Email highlight
className="font-medium text-[#171717]"

// Back to sign in button
className="bg-[#FFA028] hover:bg-[#FFB04D] text-[#171717]"
```

---

## Phase 5: Forgot/Reset Password Pages

### Task 5.1: Audit Forgot Password
**File:** `src/app/(auth)/forgot-password/page.tsx`

- [ ] Apply same color fixes as login form
- [ ] Verify success state uses brand green

### Task 5.2: Audit Reset Password
**File:** `src/app/(auth)/reset-password/page.tsx`

- [ ] Apply same color fixes
- [ ] Include password strength indicator

### Task 5.3: Fix Success States
Both pages should use:
```tsx
// Success icon
className="text-[#00C853]"

// Success background
className="bg-[rgba(0,200,83,0.12)]"
```

---

## Phase 6: UI Enhancements

### Task 6.1: Enhance Left Panel Glassmorphism
**Current:** Basic gradient with orbs

**Improved specification:**
```tsx
// Main container
className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] overflow-hidden"

// Grid pattern overlay
className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]"

// Gradient orb 1 (amber glow - top left)
className="absolute -top-24 -left-24 w-96 h-96 bg-[rgba(255,160,40,0.15)] rounded-full blur-[100px]"

// Gradient orb 2 (green glow - bottom right)
className="absolute -bottom-24 -right-24 w-96 h-96 bg-[rgba(0,200,83,0.08)] rounded-full blur-[100px]"
```

### Task 6.2: Improve Stat Cards
**Enhanced specification:**
```tsx
// Card
className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] rounded-xl p-5 hover:bg-[rgba(255,255,255,0.08)] transition-colors"

// Icon container
className="w-10 h-10 rounded-lg bg-[rgba(255,160,40,0.15)] flex items-center justify-center mb-3"

// Icon
className="w-5 h-5 text-[#FFA028]"

// Value
className="text-2xl font-bold text-white tracking-tight"

// Label
className="text-sm text-[rgba(255,255,255,0.6)]"
```

### Task 6.3: Improve Value Prop Quote Box
**Enhanced specification:**
```tsx
// Container
className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] rounded-xl p-6"

// Quote icon
className="text-[rgba(255,160,40,0.6)] mb-4"

// Quote text
className="text-lg text-[rgba(255,255,255,0.9)] font-medium leading-relaxed mb-4"

// Description
className="text-sm text-[rgba(255,255,255,0.6)] leading-relaxed"
```

### Task 6.4: Add Subtle Entrance Animation
**Add to form card:**
```tsx
// Animation class
className="animate-fade-in-up"

// Or with inline style for delay
style={{ animationDelay: '100ms' }}
```

**Ensure this keyframe exists in globals.css:**
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 400ms ease-out forwards;
}
```

### Task 6.5: Improve Form Card Styling
**Enhanced specification:**
```tsx
// Card container
className="w-full max-w-md bg-white border border-[#E5E5E5] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] sm:border lg:shadow-xl"

// Card header
className="p-6 pb-2"

// Card title
className="text-2xl font-bold text-[#171717] tracking-tight"

// Card description
className="text-sm text-[#737373] mt-1"

// Card content
className="p-6 pt-4"
```

### Task 6.6: Add Loading Skeleton (Initial Page Load)
**Per the Loading Rule - no spinners for page loads:**

```tsx
// Skeleton for form card (show while auth state loading)
const FormSkeleton = () => (
  <div className="w-full max-w-md bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4">
    {/* Title skeleton */}
    <div className="h-8 w-32 bg-[#F5F5F5] rounded animate-pulse" />
    {/* Description skeleton */}
    <div className="h-4 w-48 bg-[#F5F5F5] rounded animate-pulse" />
    {/* Input skeletons */}
    <div className="space-y-4 pt-4">
      <div className="h-11 bg-[#F5F5F5] rounded-[6px] animate-pulse" />
      <div className="h-11 bg-[#F5F5F5] rounded-[6px] animate-pulse" />
    </div>
    {/* Button skeleton */}
    <div className="h-11 bg-[#F5F5F5] rounded-[6px] animate-pulse mt-6" />
  </div>
);
```

---

## Phase 7: Accessibility Verification

### Task 7.1: Verify Focus States
- [ ] All inputs have amber focus ring (`ring-[#FFA028]`)
- [ ] All buttons have amber focus ring
- [ ] Checkbox has amber focus ring
- [ ] Links have visible focus state

### Task 7.2: Verify Color Independence
- [ ] Error states have text + icon (not just red color)
- [ ] Success states have text + icon (not just green color)
- [ ] Password strength has labels + bars (not just color)

### Task 7.3: Verify ARIA Attributes
- [ ] Error alerts have `role="alert"` and `aria-live="polite"`
- [ ] Invalid inputs have `aria-invalid="true"`
- [ ] Password toggle has `aria-label`
- [ ] Decorative elements have `aria-hidden="true"`

### Task 7.4: Test Keyboard Navigation
- [ ] Tab through all elements in logical order
- [ ] Enter submits forms
- [ ] Escape closes any modals
- [ ] Password toggle works with Enter/Space

---

## Phase 8: Final QA

### Task 8.1: Color Compliance Check
```
Search entire auth directory for:
- [ ] Any slate-* classes remaining
- [ ] Any emerald-* classes remaining  
- [ ] Any red-500 classes remaining
- [ ] Any cyan-* classes remaining
```

### Task 8.2: Visual Regression Check
- [ ] Login page renders correctly on mobile
- [ ] Login page renders correctly on desktop (split panel)
- [ ] Signup page renders correctly
- [ ] Forgot password page renders correctly
- [ ] Reset password page renders correctly

### Task 8.3: Interaction Check
- [ ] Form validation works
- [ ] Error messages display correctly
- [ ] Success states display correctly
- [ ] Google OAuth flow works
- [ ] Loading states work (button spinner OK)

### Task 8.4: Cross-Browser Check
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Completion Checklist

### Phase Completion
- [ ] Phase 1: Color System Audit & Fix
- [ ] Phase 2: Login Form Updates
- [ ] Phase 3: Signup Form Updates
- [ ] Phase 4: Success State Updates
- [ ] Phase 5: Forgot/Reset Password
- [ ] Phase 6: UI Enhancements
- [ ] Phase 7: Accessibility Verification
- [ ] Phase 8: Final QA

### Brand Compliance
- [ ] No slate-* colors
- [ ] No emerald-* colors (use #00C853)
- [ ] No red-500 (use #FF5252)
- [ ] Amber (#FFA028) only for interactive elements
- [ ] All focus rings use amber
- [ ] Neutral grays for backgrounds (0° hue)

---

## Quick Color Reference

```
═══════════════════════════════════════════════════════
INTERACTIVE (Amber - Buttons, Focus, Active Links)
═══════════════════════════════════════════════════════
  Primary:     #FFA028
  Hover:       #FFB04D
  Focus Ring:  ring-[#FFA028]
  Muted BG:    rgba(255,160,40,0.15)

═══════════════════════════════════════════════════════
SEMANTIC
═══════════════════════════════════════════════════════
  Success:     #00C853
  Success BG:  rgba(0,200,83,0.12)
  
  Error:       #FF5252
  Error BG:    rgba(255,82,82,0.1)
  
  Warning:     #FFB300

═══════════════════════════════════════════════════════
LIGHT THEME (Auth Pages)
═══════════════════════════════════════════════════════
  Page BG:     #FFFFFF
  Card BG:     #FFFFFF
  Input BG:    #FFFFFF
  
  Text 1:      #171717
  Text 2:      #525252
  Text Muted:  #737373
  
  Border:      #E5E5E5
  Input Border:#E5E5E5

═══════════════════════════════════════════════════════
DARK THEME (Left Panel - Desktop Only)
═══════════════════════════════════════════════════════
  Main BG:     #0D0D0D
  Card BG:     rgba(255,255,255,0.05)
  
  Text:        #FFFFFF
  Text Muted:  rgba(255,255,255,0.6)
  
  Border:      rgba(255,255,255,0.1)
═══════════════════════════════════════════════════════
```

---

## Files to Modify

| File | Priority | Changes |
|------|----------|---------|
| `src/app/(auth)/layout.tsx` | High | Fix slate colors, enhance glassmorphism |
| `src/app/(auth)/login/login-form.tsx` | High | Fix colors, verify focus states |
| `src/app/(auth)/signup/signup-form.tsx` | High | Fix colors, success state |
| `src/components/auth/password-strength.tsx` | High | Fix emerald/red colors |
| `src/app/(auth)/forgot-password/page.tsx` | Medium | Apply same fixes |
| `src/app/(auth)/reset-password/page.tsx` | Medium | Apply same fixes |
| `src/app/globals.css` | Low | Add animation if missing |

---

*Reference INSIDERINTEL_UI_GUIDE.md for complete design system specifications.*
