# InsiderIntel - Development TODO

This document tracks incomplete features, missing implementations, and integration gaps in the codebase.

---

## 1. Incomplete Features

### Stripe/Payment Integration (CRITICAL)

| File | Line | Issue | Priority |
|------|------|-------|----------|
| `src/app/(dashboard)/settings/billing/billing-content.tsx` | 88-94 | `handleUpgrade()` shows alert instead of redirecting to Stripe Checkout | HIGH |
| `src/app/(dashboard)/settings/billing/billing-content.tsx` | 96-101 | `handleManageBilling()` shows alert instead of opening Stripe Customer Portal | HIGH |
| `middleware.ts` | 8 | References `/api/stripe/webhook` route that doesn't exist | HIGH |

**What needs to be done:**
- [ ] Create `src/app/api/stripe/checkout/route.ts` - Create Checkout Session
- [ ] Create `src/app/api/stripe/webhook/route.ts` - Handle Stripe webhooks
- [ ] Create `src/app/api/stripe/portal/route.ts` - Create Customer Portal session
- [ ] Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to environment
- [ ] Implement subscription tier updates on successful payment

### Email/Notification Service (HIGH)

| File | Line | Issue | Priority |
|------|------|-------|----------|
| `src/app/(dashboard)/settings/notifications/notifications-form.tsx` | 86-114 | Notification toggles save to DB but no email service sends them | HIGH |
| Database | - | `notification_daily_digest`, `notification_instant_alerts`, `notification_weekly_summary` columns exist but unused | HIGH |

**What needs to be done:**
- [ ] Choose email provider (SendGrid, Mailgun, AWS SES, Resend)
- [ ] Create email templates for daily digest, instant alerts, weekly summary
- [ ] Implement cron job for daily/weekly email sending
- [ ] Create real-time alert trigger system
- [ ] Add email service credentials to environment

### CUSIP to Ticker Mapping (MEDIUM)

| File | Line | Issue | Priority |
|------|------|-------|----------|
| `lib/edgar/13f-client.ts` | 90-151 | Hardcoded CUSIP_TO_TICKER mapping only covers ~60 stocks | MEDIUM |

**What needs to be done:**
- [ ] Integrate with OpenFIGI API or similar CUSIP lookup service
- [ ] Implement caching for CUSIP lookups
- [ ] Gracefully handle unmapped CUSIPs

---

## 2. Missing Implementations

### Authentication Edge Cases

| File | Line | Issue | Priority |
|------|------|-------|----------|
| `src/app/(auth)/reset-password/reset-password-form.tsx` | 36-61 | No handling for expired password recovery links | MEDIUM |
| `middleware.ts` | 52 | Missing redirect for `/forgot-password` and `/reset-password` for authenticated users | LOW |
| `src/app/(auth)/login/login-form.tsx` | - | `redirectTo` query param not implemented | LOW |

**What needs to be done:**
- [ ] Add timeout detection for password recovery sessions
- [ ] Redirect authenticated users away from all auth pages
- [ ] Implement post-login redirect to original URL

### Missing API Routes

| Route | Purpose | Priority |
|-------|---------|----------|
| `/api/stripe/checkout` | Create Stripe Checkout Session | HIGH |
| `/api/stripe/webhook` | Handle Stripe payment events | HIGH |
| `/api/stripe/portal` | Create Stripe Customer Portal session | HIGH |
| `/api/user/subscription` | Check/update subscription tier | MEDIUM |

---

## 3. Code Quality Issues

### Console.log Statements to Remove/Replace

These should be replaced with a proper logging service (e.g., Pino, Winston) in production:

| File | Approximate Lines | Count |
|------|-------------------|-------|
| `src/app/api/cron/generate-context/route.ts` | 27, 38, 56, 74, 120 | 5 |
| `lib/ai/claude-client.ts` | 132, 156, 182, 194, 198, 320 | 6 |
| `lib/db/insider-transactions.ts` | Multiple | 14 |
| `lib/db/institutional-holdings.ts` | Multiple | 16 |

**What needs to be done:**
- [ ] Implement structured logging with log levels
- [ ] Replace console.error/log with proper logger
- [ ] Add request ID tracing

### TODO Comments in Code

| File | Line | Comment | Priority |
|------|------|---------|----------|
| `lib/edgar/13f-client.ts` | 90 | `// TODO: Replace with proper CUSIP lookup service` | MEDIUM |

---

## 4. Integration Gaps

### Error Tracking & Monitoring

| Status | What's Missing | Priority |
|--------|----------------|----------|
| Not Implemented | No error tracking service (Sentry, DataDog, etc.) | MEDIUM |
| Not Implemented | No application performance monitoring | LOW |
| Not Implemented | No structured logging service | MEDIUM |

**What needs to be done:**
- [ ] Integrate Sentry or similar for error tracking
- [ ] Add APM for performance monitoring
- [ ] Implement health check endpoint

### Security Concerns

| File | Line | Issue | Priority |
|------|------|-------|----------|
| `src/app/api/cron/generate-context/route.ts` | 22-25 | `CRON_SECRET` is optional - should be required in production | MEDIUM |
| Environment | - | No rate limiting on public API routes | MEDIUM |

**What needs to be done:**
- [ ] Make CRON_SECRET required
- [ ] Implement rate limiting middleware
- [ ] Add API key authentication for external API access

---

## 5. UI/UX Incomplete Items

### Placeholder UI Text

| File | Line | Issue | Priority |
|------|------|-------|----------|
| `src/app/(dashboard)/settings/billing/billing-content.tsx` | Various | Upgrade buttons don't work | HIGH |
| `src/app/(dashboard)/settings/notifications/notifications-form.tsx` | 164-170 | States "Instant alerts are only available for Retail and Pro" but no enforcement | LOW |

---

## 6. Database/Schema Considerations

### Unused Columns

| Table | Column | Purpose | Status |
|-------|--------|---------|--------|
| `profiles` | `stripe_customer_id` | Store Stripe customer ID | Column exists, not populated |
| `profiles` | `notification_daily_digest` | Daily email preference | Column exists, not used |
| `profiles` | `notification_instant_alerts` | Instant alert preference | Column exists, not used |
| `profiles` | `notification_weekly_summary` | Weekly summary preference | Column exists, not used |

---

## Priority Summary

### Critical (Must fix before launch)
1. Stripe payment integration
2. Stripe webhook handling

### High Priority
3. Email notification service
4. Stripe Customer Portal integration
5. Subscription tier enforcement

### Medium Priority
6. CUSIP lookup service integration
7. Structured logging implementation
8. Error tracking service
9. Cron job security (required secrets)
10. Authentication edge cases

### Low Priority
11. Post-login redirect implementation
12. Console.log cleanup
13. APM integration

---

## Implementation Order Recommendation

1. **Phase 1: Payments** - Stripe integration (checkout, webhooks, portal)
2. **Phase 2: Notifications** - Email service setup (SendGrid/Resend)
3. **Phase 3: Observability** - Logging, error tracking, monitoring
4. **Phase 4: Polish** - Auth edge cases, CUSIP service, cleanup

---

*Last updated: January 15, 2026*
