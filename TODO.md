# InsiderIntel - Development TODO

This document tracks incomplete features, missing implementations, and integration gaps in the codebase.

---

## 1. Incomplete Features

### Stripe/Payment Integration (COMPLETED)

| File | Status |
|------|--------|
| `src/app/api/stripe/checkout/route.ts` | ✅ Created - Creates Stripe Checkout Sessions |
| `src/app/api/stripe/webhook/route.ts` | ✅ Created - Handles subscription events |
| `src/app/api/stripe/portal/route.ts` | ✅ Created - Customer Portal sessions |
| `src/app/(dashboard)/settings/billing/billing-content.tsx` | ✅ Updated - Uses real Stripe API |

**Environment variables required:**
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- `STRIPE_RETAIL_PRICE_ID` - Price ID for Retail plan
- `STRIPE_PRO_PRICE_ID` - Price ID for Pro plan

### Email/Notification Service (COMPLETED)

| File | Status |
|------|--------|
| `lib/email/resend-client.ts` | ✅ Created - Resend email client |
| `lib/email/send-email.ts` | ✅ Created - Email sending functions |
| `lib/email/templates/daily-digest.ts` | ✅ Created - Daily digest HTML/text templates |
| `lib/email/templates/instant-alert.ts` | ✅ Created - Instant alert HTML/text templates |
| `lib/email/templates/weekly-summary.ts` | ✅ Created - Weekly summary HTML/text templates |
| `src/app/api/cron/send-daily-digest/route.ts` | ✅ Created - Cron job for daily emails |
| `src/app/api/cron/send-weekly-summary/route.ts` | ✅ Created - Cron job for weekly emails |
| `src/app/api/notifications/instant-alert/route.ts` | ✅ Created - Trigger instant alerts |

**Environment variables required:**
- `RESEND_API_KEY` - Resend API key
- `EMAIL_FROM` - From address for emails
- `CRON_SECRET` - Secret for cron job authentication
- `INTERNAL_API_SECRET` - Secret for internal API calls

### CUSIP to Ticker Mapping (COMPLETED)

| File | Status |
|------|--------|
| `lib/openfigi/client.ts` | ✅ Created - OpenFIGI API client with batch support |
| `lib/edgar/13f-client.ts` | ✅ Updated - Dynamic lookup with hardcoded fallback |

**Features implemented:**
- OpenFIGI API integration for dynamic CUSIP → ticker lookup
- In-memory cache with 7-day TTL to reduce API calls
- Batch lookup support (up to 100 CUSIPs per request with API key)
- Hardcoded fallback for ~60 common securities
- Rate limiting to respect OpenFIGI limits
- Prefers US exchanges and common stock for best matches

**Environment variables:**
- `OPENFIGI_API_KEY` - Optional but recommended for higher rate limits

---

## 2. Missing Implementations

### Authentication Edge Cases

| File | Line | Issue | Priority |
|------|------|-------|----------|
| ✅ FIXED | `src/app/(auth)/reset-password/reset-password-form.tsx` | Expired link detection, session timeout monitoring | - |
| ✅ FIXED | `middleware.ts` | Redirects authenticated users from `/forgot-password` and `/reset-password` | - |
| `src/app/(auth)/login/login-form.tsx` | - | `redirectTo` query param not implemented | LOW |

**What needs to be done:**
- [x] Add timeout detection for password recovery sessions
- [x] Redirect authenticated users away from all auth pages
- [ ] Implement post-login redirect to original URL

### Missing API Routes

| Route | Purpose | Priority |
|-------|---------|----------|
| `/api/stripe/checkout` | ✅ COMPLETED | - |
| `/api/stripe/webhook` | ✅ COMPLETED | - |
| `/api/stripe/portal` | ✅ COMPLETED | - |
| `/api/user/subscription` | Check/update subscription tier | MEDIUM |

---

## 3. Code Quality Issues

### Structured Logging (COMPLETED)

| File | Status |
|------|--------|
| `lib/logger.ts` | ✅ Created - Pino logger with module-specific loggers |
| `src/app/api/**/*.ts` | ✅ Updated - All console.log/error replaced with logger |
| `lib/ai/claude-client.ts` | ✅ Updated - Using logger.ai |
| `lib/db/insider-transactions.ts` | ✅ Updated - Using logger.db |
| `lib/db/institutional-holdings.ts` | ✅ Updated - Using logger.db |
| `lib/openfigi/client.ts` | ✅ Updated - Using logger.openfigi |
| `lib/edgar/13f-client.ts` | ✅ Updated - Using logger.edgar |

**Features implemented:**
- Pino structured logging with JSON output
- Module-specific loggers (api, db, ai, cron, stripe, email, edgar, openfigi)
- Log levels: trace, debug, info, warn, error, fatal
- Environment-based defaults (debug in dev, info in production)
- Request ID support via createRequestLogger()

**Environment variables:**
- `LOG_LEVEL` - Optional, overrides default log level

### TODO Comments in Code

| File | Line | Comment | Status |
|------|------|---------|--------|
| `lib/edgar/13f-client.ts` | 90 | `// TODO: Replace with proper CUSIP lookup service` | ✅ RESOLVED |

---

## 4. Integration Gaps

### Error Tracking & Monitoring

| Status | What's Missing | Priority |
|--------|----------------|----------|
| ✅ COMPLETED | Error tracking service (Sentry) | - |
| ✅ COMPLETED | Application performance monitoring (Sentry) | - |
| ✅ COMPLETED | Structured logging service (Pino) | - |

**What needs to be done:**
- [x] Integrate Sentry for error tracking
- [x] Add APM for performance monitoring (Sentry traces)
- [ ] Implement health check endpoint

### Security Concerns

| File | Line | Issue | Priority |
|------|------|-------|----------|
| ✅ FIXED | `lib/auth/cron.ts` | `CRON_SECRET` now required in production | - |
| Environment | - | No rate limiting on public API routes | MEDIUM |

**What needs to be done:**
- [x] Make CRON_SECRET required in production
- [ ] Implement rate limiting middleware
- [ ] Add API key authentication for external API access

---

## 5. UI/UX Incomplete Items

### Placeholder UI Text

| File | Line | Issue | Priority |
|------|------|-------|----------|
| `src/app/(dashboard)/settings/billing/billing-content.tsx` | Various | ✅ FIXED - Upgrade buttons now work | - |
| `src/app/(dashboard)/settings/notifications/notifications-form.tsx` | 164-170 | States "Instant alerts are only available for Retail and Pro" but no enforcement | LOW |

---

## 6. Database/Schema Considerations

### Unused Columns

| Table | Column | Purpose | Status |
|-------|--------|---------|--------|
| `profiles` | `stripe_customer_id` | Store Stripe customer ID | ✅ Now populated by Stripe integration |
| `profiles` | `notification_daily_digest` | Daily email preference | ✅ Now used by email service |
| `profiles` | `notification_instant_alerts` | Instant alert preference | ✅ Now used by email service |
| `profiles` | `notification_weekly_summary` | Weekly summary preference | ✅ Now used by email service |

---

## Priority Summary

### Critical (Must fix before launch)
1. ~~Stripe payment integration~~ ✅ COMPLETED
2. ~~Stripe webhook handling~~ ✅ COMPLETED

### High Priority
3. ~~Email notification service~~ ✅ COMPLETED
4. ~~Stripe Customer Portal integration~~ ✅ COMPLETED
5. Subscription tier enforcement

### Medium Priority
6. ~~CUSIP lookup service integration~~ ✅ COMPLETED
7. ~~Structured logging implementation~~ ✅ COMPLETED
8. ~~Error tracking service~~ ✅ COMPLETED
9. ~~Cron job security (required secrets)~~ ✅ COMPLETED
10. ~~Authentication edge cases~~ ✅ COMPLETED

### Low Priority
11. Post-login redirect implementation
12. ~~Console.log cleanup~~ ✅ COMPLETED (part of structured logging)
13. APM integration

---

## Implementation Order Recommendation

1. **Phase 1: Payments** - ✅ COMPLETED - Stripe integration (checkout, webhooks, portal)
2. **Phase 2: Notifications** - ✅ COMPLETED - Email service setup (Resend)
3. **Phase 3: Observability** - ✅ COMPLETED - Structured logging (Pino), Error tracking (Sentry)
4. **Phase 4: Polish** - Auth edge cases, CUSIP service ✅, cleanup

---

*Last updated: January 15, 2026*
