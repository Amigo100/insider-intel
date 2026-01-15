# InsiderIntel - External Services Setup Guide

This guide covers the setup of external services required for InsiderIntel to function fully in production.

---

## Table of Contents

1. [Stripe Payments](#1-stripe-payments)
2. [Resend Email Service](#2-resend-email-service)
3. [OpenFIGI API](#3-openfigi-api)
4. [Vercel Cron Jobs](#4-vercel-cron-jobs)
5. [Supabase Configuration](#5-supabase-configuration)
6. [Sentry Error Tracking](#6-sentry-error-tracking)
7. [Environment Variables Checklist](#7-environment-variables-checklist)

---

## 1. Stripe Payments

### 1.1 Create Stripe Account

- [ ] Sign up at [stripe.com](https://stripe.com)
- [ ] Complete business verification
- [ ] Enable test mode for development

### 1.2 Create Products and Prices

In the Stripe Dashboard, create subscription products:

**Retail Plan ($19/month)**
- [ ] Go to Products → Add Product
- [ ] Name: "Retail Plan"
- [ ] Description: "Perfect for active individual investors"
- [ ] Add Price: $19.00 USD, Recurring, Monthly
- [ ] Copy the Price ID (starts with `price_`)

**Pro Plan ($49/month)**
- [ ] Go to Products → Add Product
- [ ] Name: "Pro Plan"
- [ ] Description: "For professionals who need comprehensive data"
- [ ] Add Price: $49.00 USD, Recurring, Monthly
- [ ] Copy the Price ID (starts with `price_`)

### 1.3 Get API Keys

- [ ] Go to Developers → API Keys
- [ ] Copy **Secret key** (starts with `sk_test_` or `sk_live_`)
- [ ] Add to environment: `STRIPE_SECRET_KEY`

### 1.4 Configure Webhook

- [ ] Go to Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] Endpoint URL: `https://your-domain.com/api/stripe/webhook`
- [ ] Select events to listen to:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- [ ] Click "Add endpoint"
- [ ] Copy **Signing secret** (starts with `whsec_`)
- [ ] Add to environment: `STRIPE_WEBHOOK_SECRET`

### 1.5 Configure Customer Portal

- [ ] Go to Settings → Billing → Customer Portal
- [ ] Enable the customer portal
- [ ] Configure allowed actions:
  - [ ] Allow customers to update payment methods
  - [ ] Allow customers to view invoice history
  - [ ] Allow customers to cancel subscriptions
- [ ] Set cancellation options (immediate or end of period)
- [ ] Save changes

### 1.6 Environment Variables for Stripe

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_RETAIL_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
```

---

## 2. Resend Email Service

### 2.1 Create Resend Account

- [ ] Sign up at [resend.com](https://resend.com)
- [ ] Verify your email address

### 2.2 Add and Verify Domain

- [ ] Go to Domains → Add Domain
- [ ] Enter your domain (e.g., `insiderintel.com`)
- [ ] Add the DNS records provided:
  - [ ] SPF record (TXT)
  - [ ] DKIM record (TXT)
  - [ ] DMARC record (TXT) - optional but recommended
- [ ] Wait for domain verification (can take up to 48 hours)

### 2.3 Get API Key

- [ ] Go to API Keys → Create API Key
- [ ] Name: "InsiderIntel Production"
- [ ] Permissions: Full access (or Sending access only)
- [ ] Copy the API key (starts with `re_`)
- [ ] Add to environment: `RESEND_API_KEY`

### 2.4 Configure From Address

Choose a from address using your verified domain:
- Recommended: `notifications@insiderintel.com`
- Alternative: `noreply@insiderintel.com`

### 2.5 Environment Variables for Resend

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=InsiderIntel <notifications@insiderintel.com>
```

---

## 3. OpenFIGI API

OpenFIGI provides CUSIP to ticker symbol mapping for 13F institutional holdings data.

### 3.1 Create OpenFIGI Account (Optional but Recommended)

The API works without an account, but with lower rate limits.

**Without API key:**
- 25 requests per minute
- 5 CUSIP lookups per request

**With API key (free):**
- 250 requests per minute
- 100 CUSIP lookups per request

### 3.2 Get API Key

- [ ] Go to [openfigi.com/api](https://www.openfigi.com/api)
- [ ] Click "Get API Key"
- [ ] Create a free account
- [ ] Copy your API key
- [ ] Add to environment: `OPENFIGI_API_KEY`

### 3.3 Environment Variables for OpenFIGI

```env
# Optional but recommended for better rate limits
OPENFIGI_API_KEY=your-api-key-here
```

### 3.4 How It Works

The system uses a multi-layer approach for CUSIP to ticker mapping:

1. **Hardcoded fallback** - ~60 common securities for instant lookup
2. **OpenFIGI API** - Dynamic lookup for unknown CUSIPs
3. **In-memory cache** - 7-day TTL to minimize API calls

---

## 4. Vercel Cron Jobs

### 3.1 Configure Cron Jobs in vercel.json

Create or update `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-daily-digest",
      "schedule": "0 13 * * *"
    },
    {
      "path": "/api/cron/send-weekly-summary",
      "schedule": "0 14 * * 1"
    },
    {
      "path": "/api/cron/generate-context",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Schedule explanations:**
- Daily digest: 8:00 AM EST (13:00 UTC) every day
- Weekly summary: 9:00 AM EST (14:00 UTC) every Monday
- AI context generation: Every 6 hours

### 3.2 Secure Cron Endpoints

- [ ] Generate a secure random string for `CRON_SECRET`:
  ```bash
  openssl rand -hex 32
  ```
- [ ] Add to Vercel environment variables
- [ ] Vercel automatically sends this in the `Authorization` header

### 3.3 Environment Variables for Cron

```env
CRON_SECRET=your-secure-random-string
INTERNAL_API_SECRET=another-secure-random-string
```

---

## 5. Supabase Configuration

### 4.1 Verify Database Schema

Ensure these tables exist with correct columns:

**profiles table:**
- [ ] `stripe_customer_id` (text, nullable)
- [ ] `subscription_tier` (text, default: 'free')
- [ ] `notification_daily_digest` (boolean, default: false)
- [ ] `notification_instant_alerts` (boolean, default: false)
- [ ] `notification_weekly_summary` (boolean, default: false)

### 4.2 Row Level Security (RLS)

Verify RLS policies allow:
- [ ] Users can read/update their own profile
- [ ] Service role can update any profile (for webhooks)

### 4.3 Environment Variables for Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

---

## 6. Sentry Error Tracking

Sentry provides real-time error tracking and performance monitoring.

### 6.1 Create Sentry Account

- [ ] Sign up at [sentry.io](https://sentry.io)
- [ ] Create a new organization (or use existing)
- [ ] Create a new project with platform: **Next.js**

### 6.2 Get Project DSN

- [ ] Go to **Settings → Projects → [Your Project] → Client Keys (DSN)**
- [ ] Copy the DSN (looks like `https://xxx@xxx.ingest.sentry.io/xxx`)
- [ ] Add to environment: `NEXT_PUBLIC_SENTRY_DSN`

### 6.3 Configure Source Maps (Optional - for CI/CD)

For better stack traces in production:

- [ ] Go to **Settings → Auth Tokens**
- [ ] Create a new token with `project:releases` and `org:read` scopes
- [ ] Add to CI environment: `SENTRY_AUTH_TOKEN`
- [ ] Add organization slug: `SENTRY_ORG`
- [ ] Add project slug: `SENTRY_PROJECT`

### 6.4 Environment Variables for Sentry

```env
# Required
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Optional - for source map uploads
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=sntrys_xxxxx
```

### 6.5 Features Included

- **Client-side error tracking** - Catches React errors, unhandled rejections
- **Server-side error tracking** - API route errors, server component errors
- **Session Replay** - Record user sessions for debugging (10% sample in prod)
- **Performance monitoring** - Track slow transactions (10% sample in prod)
- **Cron job monitoring** - Automatic Vercel cron monitoring

### 6.6 Verify Setup

1. [ ] Deploy to production
2. [ ] Trigger a test error (e.g., visit `/debug-sentry` in development)
3. [ ] Check Sentry dashboard for the error
4. [ ] Verify source maps are working (stack traces show original code)

---

## 7. Environment Variables Checklist

### Required for Production

| Variable | Source | Required |
|----------|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard | Yes |
| `STRIPE_SECRET_KEY` | Stripe Dashboard | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhooks | Yes |
| `STRIPE_RETAIL_PRICE_ID` | Stripe Products | Yes |
| `STRIPE_PRO_PRICE_ID` | Stripe Products | Yes |
| `RESEND_API_KEY` | Resend Dashboard | Yes |
| `EMAIL_FROM` | Your verified domain | Yes |
| `CRON_SECRET` | Self-generated | Yes |
| `NEXT_PUBLIC_APP_URL` | Your domain | Yes |
| `ANTHROPIC_API_KEY` | Anthropic Console | Yes |

### Optional

| Variable | Source | Purpose |
|----------|--------|---------|
| `INTERNAL_API_SECRET` | Self-generated | Internal API auth |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry Dashboard | Error tracking |
| `SENTRY_ORG` | Sentry Dashboard | Source map uploads |
| `SENTRY_PROJECT` | Sentry Dashboard | Source map uploads |
| `SENTRY_AUTH_TOKEN` | Sentry Dashboard | Source map uploads |
| `LOG_LEVEL` | N/A | Override default log level |

### Complete .env.local Template

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_RETAIL_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx

# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=InsiderIntel <notifications@insiderintel.com>

# Cron/Internal API Security
CRON_SECRET=your-secure-random-string
INTERNAL_API_SECRET=another-secure-random-string

# Sentry Error Tracking (optional but recommended)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug

# Application Configuration
NEXT_PUBLIC_APP_URL=https://insiderintel.com
```

---

## Post-Setup Verification

### Test Stripe Integration

1. [ ] Create a test user account
2. [ ] Navigate to Settings → Billing
3. [ ] Click "Upgrade to Retail"
4. [ ] Complete checkout with test card: `4242 4242 4242 4242`
5. [ ] Verify subscription tier updates in database
6. [ ] Test "Manage Billing" portal access

### Test Email Service

1. [ ] Enable daily digest in notification settings
2. [ ] Manually trigger: `GET /api/cron/send-daily-digest` with auth header
3. [ ] Verify email received
4. [ ] Check Resend dashboard for delivery status

### Test Cron Jobs

1. [ ] Deploy to Vercel
2. [ ] Check Vercel dashboard → Cron Jobs
3. [ ] Verify jobs are scheduled
4. [ ] Monitor first executions in logs

---

## Troubleshooting

### Stripe Webhook Not Receiving Events

- Verify webhook URL is correct and publicly accessible
- Check webhook signing secret matches
- Review Stripe webhook logs for errors

### Emails Not Sending

- Verify domain is fully verified in Resend
- Check API key has sending permissions
- Review Resend logs for bounce/error details

### Cron Jobs Not Running

- Ensure `vercel.json` is in project root
- Verify `CRON_SECRET` matches Vercel's auto-generated header
- Check Vercel deployment logs

---

*Last updated: January 15, 2026*
