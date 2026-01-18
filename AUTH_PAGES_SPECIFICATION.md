# InsiderIntel Authentication Pages Specification

## Overview

The authentication pages (Login, Signup, Forgot Password, Reset Password) share a common layout with a split-panel design optimized for both desktop and mobile experiences.

---

## 1. Page Layout Structure

### Split-Panel Design

```
┌─────────────────────────────────────────────────────────────┐
│                     DESKTOP (lg+)                           │
├─────────────────────────┬───────────────────────────────────┤
│                         │                                   │
│    LEFT PANEL (50%)     │      RIGHT PANEL (50%)            │
│    Dark Gradient        │      Light Background             │
│    Marketing Content    │      Form Card                    │
│                         │                                   │
│    • Logo (light)       │      • Mobile Header (hidden)     │
│    • Feature Stats      │      • Form Card (centered)       │
│    • Value Prop Quote   │      • Footer                     │
│    • Footer             │                                   │
│                         │                                   │
└─────────────────────────┴───────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     MOBILE (<lg)                            │
├─────────────────────────────────────────────────────────────┤
│    • Logo (dark variant, top)                               │
│    • Form Card (centered)                                   │
│    • Footer (bottom)                                        │
│                                                             │
│    [Left panel completely hidden on mobile]                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Color Scheme

### Left Panel (Desktop Only) - Dark Theme

| Element | Color | HSL/Hex | Notes |
|---------|-------|---------|-------|
| Background Base | Slate gradient | `from-slate-900 via-slate-800 to-slate-900` | Dark gradient |
| Grid Pattern | White 8% opacity | `#ffffff08` | 24x24px grid |
| Gradient Orb 1 | Primary 20% | `bg-primary/20` | Top-left, blurred |
| Gradient Orb 2 | Emerald 10% | `bg-emerald-500/10` | Bottom-right, blurred |
| Text Primary | White | `text-white` | Headings, values |
| Text Muted | White 60% | `text-white/60` | Labels, secondary |
| Text Footer | White 40% | `text-white/40` | Footer text |

### Left Panel - Stat Cards

| Element | Color | Notes |
|---------|-------|-------|
| Card Background | White 5% | `bg-white/5` |
| Card Border | White 10% | `border-white/10` |
| Icon | Primary | `text-primary` (CSS variable) |
| Value | White | Large bold text |
| Label | White 60% | Small text |

### Left Panel - Value Proposition Card

| Element | Color | Notes |
|---------|-------|-------|
| Card Background | White 5% | `bg-white/5 backdrop-blur` |
| Card Border | White 10% | `border-white/10` |
| Quote Icon | Primary 60% | `text-primary/60` |
| Quote Text | White 90% | `text-white/90` |
| Description | White 60% | `text-white/60` |

### Right Panel - Light Theme

| Element | CSS Variable | Light Mode Value | Description |
|---------|--------------|------------------|-------------|
| Background | `--background` | `0 0% 100%` (#FFFFFF) | White |
| Foreground | `--foreground` | `0 0% 9%` (#171717) | Near black |
| Card | `--card` | `0 0% 100%` (#FFFFFF) | White |
| Card Foreground | `--card-foreground` | `0 0% 9%` | Dark text |
| Muted | `--muted` | `0 0% 96%` (#F5F5F5) | Light gray |
| Muted Foreground | `--muted-foreground` | `0 0% 45%` (#737373) | Medium gray |
| Border | `--border` | `0 0% 90%` (#E5E5E5) | Light border |
| Input | `--input` | `0 0% 90%` (#E5E5E5) | Input border |
| Primary | `--primary` | `0 0% 9%` (#171717) | Dark primary |
| Destructive | `--destructive` | `0 84% 60%` (#FF5252) | Error red |

### Accent Colors (Amber - Actions Only)

| Element | CSS Variable | HSL | Hex |
|---------|--------------|-----|-----|
| Accent Amber | `--accent-amber` | `36 100% 56%` | #FFA028 |
| Accent Amber Hover | `--accent-amber-hover` | `36 100% 65%` | #FFB04D |
| Focus Ring | `--ring` (dark) | `36 100% 56%` | #FFA028 |

### Semantic Colors

| Purpose | Color | Hex | Usage |
|---------|-------|-----|-------|
| Success/Buy | `--signal-positive` | #00C853 | Success states, confirmations |
| Error/Sell | `--signal-negative` | #FF5252 | Error states, validation |
| Warning | `--signal-warning` | #FFB300 | Warnings |

---

## 3. Typography

### Font Stack

```css
--font-sans: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace;
```

### Text Styles

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Card Title | `text-2xl` (24px) | Bold | `foreground` |
| Card Description | `text-sm` (14px) | Normal | `muted-foreground` |
| Labels | `text-sm` (14px) | Medium | `foreground` |
| Input Text | `text-sm` (14px) | Normal | `foreground` |
| Input Placeholder | `text-sm` (14px) | Normal | `muted-foreground` |
| Error Text | `text-xs` (12px) | Normal | `destructive` |
| Help Text | `text-xs` (12px) | Normal | `muted-foreground` |
| Footer | `text-sm` (14px) | Normal | `muted-foreground` |

---

## 4. Component Specifications

### Form Card

```
Border: 1px solid (border color) - hidden on mobile, visible sm+
Background: bg-card (white)
Border Radius: rounded-lg (8px)
Shadow: shadow-lg (0 10px 15px -3px rgba(0, 0, 0, 0.1))
Padding: p-5 (20px) for CardHeader and CardContent
```

### Input Fields

```
Height: h-11 (44px) - touch-friendly
Border Radius: rounded-[6px]
Border: 1px solid (border color)
Padding: px-3 py-2 (with pl-10 for icon inputs)
Icon Size: h-4 w-4 (16px)
Icon Position: absolute left-3, vertically centered
Focus State:
  - Border: amber accent (#FFA028)
  - Shadow: 0 0 0 3px rgba(255, 160, 40, 0.15)
Error State:
  - Border: destructive (#FF5252)
  - Ring: destructive color
```

### Primary Button

```
Height: h-11 (44px) for lg size
Background: amber accent (#FFA028)
Text: bg-app color (#0D0D0D) - dark text on amber
Border Radius: rounded-[6px]
Font: semibold
Shadow: sm, hover: md
Active: scale(0.98)
Focus: 2px ring, amber color, 2px offset
Disabled: opacity-50, pointer-events-none
```

### Outline/Secondary Button (Google Sign-In)

```
Height: h-11 (44px) for lg size
Background: transparent
Border: 2px solid (border color)
Text: foreground
Border Radius: rounded-[6px]
Hover: bg-accent, text-accent-foreground
```

### Checkbox

```
Size: Standard Radix checkbox
Focus Ring: amber accent
Checked State: primary background
```

### Links

```
Color: text-primary (inherits from theme)
Hover: underline
Transition: colors
```

---

## 5. Login Form Elements

### Form Structure

1. **Error Alert** (conditional)
   - Background: `destructive/10`
   - Icon: AlertCircle (destructive color)
   - Text: Error message + action suggestion

2. **Email Field**
   - Label: "Email"
   - Icon: Mail (left)
   - Placeholder: "name@example.com"
   - Autocomplete: email
   - Validation: Required, valid email format

3. **Password Field**
   - Label: "Password" + "Forgot password?" link
   - Icon: Lock (left), Eye/EyeOff toggle (right)
   - Placeholder: "Enter your password"
   - Autocomplete: current-password
   - Validation: Required, min 6 characters

4. **Remember Me Checkbox**
   - Label: "Remember my email"
   - Stores email in localStorage

5. **Submit Button**
   - Text: "Sign in" / "Signing in..." (loading)
   - Loading: Loader2 spinner
   - Full width

6. **Divider**
   - Text: "Or continue with"
   - Line with text overlay

7. **Google Sign-In Button**
   - Google logo SVG (branded colors)
   - Text: "Continue with Google"
   - Outline variant

8. **Sign Up Link**
   - Text: "Don't have an account? Sign up for free"

---

## 6. Signup Form Elements

### Form Structure

1. **Error Alert** (same as login)

2. **Full Name Field**
   - Label: "Full Name"
   - Icon: User (left)
   - Placeholder: "John Doe"
   - Autocomplete: name
   - Validation: Required

3. **Email Field** (same as login)

4. **Password Field**
   - Same structure as login
   - Autocomplete: new-password
   - Validation: Min 8 chars, uppercase, lowercase, number
   - **Password Strength Indicator** (see below)

5. **Confirm Password Field**
   - Icon: Lock (left), Eye/EyeOff toggle (right)
   - Validation: Must match password
   - Success indicator when passwords match

6. **Terms Checkbox**
   - Required
   - Links to Terms of Service and Privacy Policy
   - External link icons

7. **Submit Button**
   - Text: "Create account" / "Creating account..."

8. **Divider + Google Sign-Up**

9. **Sign In Link**
   - Text: "Already have an account? Sign in"

### Password Strength Indicator

```
┌──────────────────────────────────────┐
│ [====] [====] [====] [====]          │  ← 4 bars
│ Strong                                │  ← Label
├──────────────────────────────────────┤
│ ✓ At least 8 characters    ✓ One uppercase │
│ ✓ One lowercase            ✓ One number    │
└──────────────────────────────────────┘
```

**Strength Levels:**
| Level | Met Count | Label | Bar Color | Text Color |
|-------|-----------|-------|-----------|------------|
| 0 | 0 | (none) | muted | - |
| 1 | 1 | Weak | bg-red-500 | text-red-500 |
| 2 | 2 | Fair | bg-orange-500 | text-orange-500 |
| 3 | 3 | Good | bg-yellow-500 | text-yellow-600 |
| 4 | 4 | Strong | bg-emerald-500 | text-emerald-500 |

**Requirements Checklist:**
- At least 8 characters
- One uppercase letter
- One lowercase letter
- One number

---

## 7. Success State (Signup)

When email confirmation is required:

```
┌─────────────────────────────────────────┐
│                                         │
│           [✓ Green Circle]              │
│                                         │
│        Check your email                 │
│                                         │
│   We've sent a confirmation link to     │
│        user@example.com                 │
│   Click the link to activate account.   │
│                                         │
│        [Back to sign in]                │
│                                         │
│   Didn't receive? Check spam folder.    │
│                                         │
└─────────────────────────────────────────┘
```

- Success icon: `bg-emerald-100` / `dark:bg-emerald-900/30`
- Icon: CheckCircle2, `text-emerald-600` / `dark:text-emerald-400`

---

## 8. Accessibility Features

### Skip Link
```html
<a href="#auth-form" class="sr-only focus:not-sr-only ...">
  Skip to form
</a>
```

### ARIA Attributes

| Element | Attribute | Value |
|---------|-----------|-------|
| Error Alert | `role` | "alert" |
| Error Alert | `aria-live` | "polite" |
| Input (invalid) | `aria-invalid` | true |
| Input (with error) | `aria-describedby` | error element ID |
| Password Toggle | `aria-label` | "Show/Hide password" |
| Decorative Icons | `aria-hidden` | "true" |
| Left Panel | `aria-hidden` | "true" (decorative) |

### Focus Management
- Focus ring: 2px amber (#FFA028) with 2px offset
- Focus visible only on keyboard navigation
- Tab order follows logical flow

### Touch Targets
- All buttons: min 44px height
- All inputs: 44px height (h-11)
- Checkboxes: standard Radix size with padding

---

## 9. Responsive Behavior

### Breakpoints

| Breakpoint | Layout Changes |
|------------|----------------|
| < 640px (default) | Single column, no card border |
| sm: (640px+) | Card border visible |
| lg: (1024px+) | Split panel layout, left panel visible |

### Mobile-Specific Styles

- Card: `border-0 shadow-lg sm:border`
- Mobile header with logo (dark variant)
- Full-width form elements
- Stacked button groups

---

## 10. Animation & Transitions

### Interactive Elements

```css
transition: color 150ms ease-out,
            background-color 150ms ease-out,
            border-color 150ms ease-out,
            transform 100ms ease-out,
            box-shadow 150ms ease-out;
```

### Button Active State
```css
active:scale-[0.98]
```

### Loading Spinners
- Icon: Loader2 from lucide-react
- Animation: `animate-spin`

### Reduced Motion
All animations disabled when user prefers reduced motion.

---

## 11. Error States & Validation

### Field-Level Errors

```
┌─────────────────────────────────────────┐
│ Email                                   │
│ ┌─────────────────────────────────────┐ │
│ │ [✉] invalid-email                   │ │  ← Red border
│ └─────────────────────────────────────┘ │
│ ⓘ Please enter a valid email address   │  ← Error text
└─────────────────────────────────────────┘
```

- Border: `border-destructive`
- Focus ring: `focus-visible:ring-destructive`
- Error text: `text-xs text-destructive`
- Icon: Info (h-3 w-3)

### General Errors (Alert Box)

```
┌─────────────────────────────────────────┐
│ ⚠ The email or password is incorrect.  │
│   Please check and try again.           │
└─────────────────────────────────────────┘
```

- Background: `bg-destructive/10`
- Icon: AlertCircle
- Text: `text-destructive` (bold) + action text (80% opacity)

### Error Message Mappings

| Error Code | Message | Action |
|------------|---------|--------|
| Invalid credentials | "The email or password is incorrect." | "Please check and try again." |
| Email not confirmed | "Your email has not been verified." | "Check inbox for verification." |
| Too many requests | "Too many login attempts." | "Wait a few minutes." |
| User not found | "No account with this email." | "Create a new account?" |
| Already registered | "This email is already registered." | "Try signing in instead." |
| Network error | "Unable to connect to server." | "Check internet connection." |

---

## 12. Security Considerations

### Password Visibility Toggle
- Eye/EyeOff icon toggle
- Changes input type between "password" and "text"
- Proper aria-label for accessibility

### Remember Me
- Only stores email (not password)
- Uses localStorage with key: `insiderintel_remembered_email`

### OAuth Flow
- Google OAuth via Supabase
- Redirect URL includes original destination parameter
- Proper error handling for OAuth failures

### Form Validation
- Client-side validation before submission
- Server-side validation via Supabase
- Rate limiting handled by Supabase

---

## 13. File Structure

```
src/app/(auth)/
├── layout.tsx              # Shared auth layout (split-panel)
├── login/
│   ├── page.tsx            # Login page wrapper
│   └── login-form.tsx      # Login form component
├── signup/
│   ├── page.tsx            # Signup page wrapper
│   └── signup-form.tsx     # Signup form component
├── forgot-password/
│   └── ...
└── reset-password/
    └── ...

src/components/
├── ui/
│   ├── button.tsx          # Button variants
│   ├── card.tsx            # Card components
│   ├── input.tsx           # Input component
│   ├── label.tsx           # Form labels
│   └── checkbox.tsx        # Checkbox component
├── auth/
│   └── password-strength.tsx  # Password strength indicator
└── ui/
    └── logo.tsx            # Logo component (light/dark variants)
```

---

## 14. Left Panel Content (Desktop)

### Logo
- Component: `<Logo variant="light" size="lg" />`
- Position: Top of panel

### Stat Cards Grid (2x2)

| Card | Icon | Value | Label |
|------|------|-------|-------|
| 1 | DollarSign | "Form 4" | "Insider transaction filings" |
| 2 | Users | "13F" | "Institutional holdings" |
| 3 | TrendingUp | "SEC" | "Official data source" |
| 4 | TrendingDown | "AI" | "Powered analysis" |

### Value Proposition Quote Box

> Track what company insiders are doing with their own money. When executives and directors buy or sell shares, it can signal their confidence in the company's future.

_InsiderIntel aggregates SEC Form 4 and 13F filings to help you spot trends in insider and institutional trading activity._

### Footer
- Text: "Data sourced from official SEC EDGAR filings"
- Color: `text-white/40`

---

*Document generated: January 2026*
*Last updated: Based on current codebase analysis*
