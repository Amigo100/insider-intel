# InsiderIntel - External Services Setup Guide

This guide covers the setup of external services required for InsiderIntel to function fully in production.

---

## Table of Contents

1. [Supabase Configuration](#1-supabase-configuration)
2. [Google OAuth Setup](#2-google-oauth-setup)
3. [Anthropic Claude API](#3-anthropic-claude-api)
4. [Stripe Payments](#4-stripe-payments)
5. [Resend Email Service](#5-resend-email-service)
6. [OpenFIGI API](#6-openfigi-api)
7. [Vercel Cron Jobs](#7-vercel-cron-jobs)
8. [Sentry Error Tracking](#8-sentry-error-tracking)
9. [Environment Variables Checklist](#9-environment-variables-checklist)

---

## 1. Supabase Configuration

Supabase provides the PostgreSQL database and authentication for InsiderIntel.

### 1.1 Create Supabase Project

- [ ] Sign up at [supabase.com](https://supabase.com)
- [ ] Create a new project
- [ ] Choose a region close to your users
- [ ] Set a strong database password (save it securely)
- [ ] Wait for project to provision (~2 minutes)

### 1.2 Get API Keys

- [ ] Go to **Settings → API**
- [ ] Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 1.3 Configure Database Schema

Run the following SQL in the **SQL Editor** to create required tables:

```sql
-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  notification_daily_digest BOOLEAN DEFAULT false,
  notification_instant_alerts BOOLEAN DEFAULT false,
  notification_weekly_summary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  cik TEXT,
  sector TEXT,
  industry TEXT,
  market_cap BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insiders table
CREATE TABLE IF NOT EXISTS public.insiders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cik TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cik)
);

-- Insider transactions table
CREATE TABLE IF NOT EXISTS public.insider_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  insider_id UUID REFERENCES public.insiders(id),
  accession_number TEXT UNIQUE NOT NULL,
  filed_at TIMESTAMPTZ,
  transaction_date DATE,
  transaction_type TEXT,
  shares BIGINT,
  price_per_share NUMERIC,
  total_value NUMERIC,
  insider_title TEXT,
  is_director BOOLEAN DEFAULT false,
  is_officer BOOLEAN DEFAULT false,
  ai_context TEXT,
  ai_significance_score NUMERIC,
  ai_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Institutions table
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cik TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  institution_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Institutional holdings table
CREATE TABLE IF NOT EXISTS public.institutional_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID,
  institution_id UUID REFERENCES public.institutions(id),
  company_id UUID REFERENCES public.companies(id),
  report_date DATE,
  shares BIGINT,
  value BIGINT,
  shares_change BIGINT,
  is_new_position BOOLEAN DEFAULT false,
  is_closed_position BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlist table
CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_insider_transactions_company ON public.insider_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_insider_transactions_filed_at ON public.insider_transactions(filed_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON public.watchlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON public.companies(ticker);
```

### 1.4 Configure Row Level Security (RLS)

```sql
-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Watchlist: Users can manage their own watchlist
CREATE POLICY "Users can view own watchlist" ON public.watchlist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist" ON public.watchlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist" ON public.watchlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- Public read access for companies, transactions (no user data)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT USING (true);

ALTER TABLE public.insider_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view transactions" ON public.insider_transactions FOR SELECT USING (true);

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view institutions" ON public.institutions FOR SELECT USING (true);

ALTER TABLE public.institutional_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view holdings" ON public.institutional_holdings FOR SELECT USING (true);
```

### 1.5 Create Profile Trigger

Auto-create a profile when a user signs up:

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 1.6 Environment Variables for Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

---

## 2. Google OAuth Setup

Google OAuth is configured through Supabase for "Sign in with Google" functionality.

### 2.1 Create Google Cloud Project

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Create a new project (or select existing)
- [ ] Enable the **Google+ API** (or **Google Identity Services**)

### 2.2 Configure OAuth Consent Screen

- [ ] Go to **APIs & Services → OAuth consent screen**
- [ ] Choose **External** user type
- [ ] Fill in app information:
  - App name: `InsiderIntel`
  - User support email: your email
  - App logo: (optional)
  - App domain: `https://insiderintel.com`
  - Authorized domains: `insiderintel.com`, `supabase.co`
  - Developer contact: your email
- [ ] Add scopes: `email`, `profile`, `openid`
- [ ] Add test users (if in testing mode)
- [ ] Save and continue

### 2.3 Create OAuth Credentials

- [ ] Go to **APIs & Services → Credentials**
- [ ] Click **Create Credentials → OAuth client ID**
- [ ] Application type: **Web application**
- [ ] Name: `InsiderIntel Supabase`
- [ ] Add **Authorized JavaScript origins**:
  - `https://your-project.supabase.co`
- [ ] Add **Authorized redirect URIs**:
  - `https://your-project.supabase.co/auth/v1/callback`
- [ ] Click **Create**
- [ ] Copy **Client ID** and **Client Secret**

### 2.4 Configure Supabase Auth Provider

- [ ] Go to Supabase Dashboard → **Authentication → Providers**
- [ ] Find **Google** and enable it
- [ ] Paste your **Client ID**
- [ ] Paste your **Client Secret**
- [ ] Save

### 2.5 Configure Redirect URLs

In Supabase Dashboard → **Authentication → URL Configuration**:

- [ ] Set **Site URL**: `https://insiderintel.com`
- [ ] Add **Redirect URLs**:
  - `https://insiderintel.com/auth/callback`
  - `http://localhost:3000/auth/callback` (for development)

### 2.6 Verify Setup

1. [ ] Start your dev server
2. [ ] Click "Sign in with Google" on login page
3. [ ] Complete Google OAuth flow
4. [ ] Verify redirect to `/dashboard`
5. [ ] Check `profiles` table for new user

---

## 3. Anthropic Claude API

Claude AI generates contextual analysis for insider transactions.

### 3.1 Create Anthropic Account

- [ ] Sign up at [console.anthropic.com](https://console.anthropic.com)
- [ ] Complete account verification
- [ ] Add payment method (usage-based billing)

### 3.2 Get API Key

- [ ] Go to **API Keys** in the console
- [ ] Click **Create Key**
- [ ] Name: `InsiderIntel Production`
- [ ] Copy the key (starts with `sk-ant-`)
- [ ] Add to environment: `ANTHROPIC_API_KEY`

### 3.3 Usage Information

**Model used:** `claude-3-5-sonnet-20241022`

**Features:**
- Generates contextual analysis for insider transactions
- Produces significance scores (0.0 - 1.0)
- Batch processing with concurrency control
- Company-level aggregate insights

**Rate limiting (built-in):**
- 100ms delay between requests
- Max 5 concurrent API calls
- Exponential backoff on errors

**Cost considerations:**
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens
- Each transaction analysis uses ~500-1000 tokens

### 3.4 Environment Variables for Anthropic

```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

---

## 4. Stripe Payments

### 4.1 Create Stripe Account

- [ ] Sign up at [stripe.com](https://stripe.com)
- [ ] Complete business verification
- [ ] Enable test mode for development

### 4.2 Create Products and Prices

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

### 4.3 Get API Keys

- [ ] Go to Developers → API Keys
- [ ] Copy **Secret key** (starts with `sk_test_` or `sk_live_`)
- [ ] Add to environment: `STRIPE_SECRET_KEY`

### 4.4 Configure Webhook

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

### 4.5 Configure Customer Portal

- [ ] Go to Settings → Billing → Customer Portal
- [ ] Enable the customer portal
- [ ] Configure allowed actions:
  - [ ] Allow customers to update payment methods
  - [ ] Allow customers to view invoice history
  - [ ] Allow customers to cancel subscriptions
- [ ] Set cancellation options (immediate or end of period)
- [ ] Save changes

### 4.6 Environment Variables for Stripe

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_RETAIL_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
```

---

## 5. Resend Email Service

### 5.1 Create Resend Account

- [ ] Sign up at [resend.com](https://resend.com)
- [ ] Verify your email address

### 5.2 Add and Verify Domain

- [ ] Go to Domains → Add Domain
- [ ] Enter your domain (e.g., `insiderintel.com`)
- [ ] Add the DNS records provided:
  - [ ] SPF record (TXT)
  - [ ] DKIM record (TXT)
  - [ ] DMARC record (TXT) - optional but recommended
- [ ] Wait for domain verification (can take up to 48 hours)

### 5.3 Get API Key

- [ ] Go to API Keys → Create API Key
- [ ] Name: "InsiderIntel Production"
- [ ] Permissions: Full access (or Sending access only)
- [ ] Copy the API key (starts with `re_`)
- [ ] Add to environment: `RESEND_API_KEY`

### 5.4 Configure From Address

Choose a from address using your verified domain:
- Recommended: `notifications@insiderintel.com`
- Alternative: `noreply@insiderintel.com`

### 5.5 Environment Variables for Resend

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=InsiderIntel <notifications@insiderintel.com>
```

---

## 6. OpenFIGI API

OpenFIGI provides CUSIP to ticker symbol mapping for 13F institutional holdings data.

### 6.1 Create OpenFIGI Account (Optional but Recommended)

The API works without an account, but with lower rate limits.

**Without API key:**
- 25 requests per minute
- 5 CUSIP lookups per request

**With API key (free):**
- 250 requests per minute
- 100 CUSIP lookups per request

### 6.2 Get API Key

- [ ] Go to [openfigi.com/api](https://www.openfigi.com/api)
- [ ] Click "Get API Key"
- [ ] Create a free account
- [ ] Copy your API key
- [ ] Add to environment: `OPENFIGI_API_KEY`

### 6.3 Environment Variables for OpenFIGI

```env
# Optional but recommended for better rate limits
OPENFIGI_API_KEY=your-api-key-here
```

### 6.4 How It Works

The system uses a multi-layer approach for CUSIP to ticker mapping:

1. **Hardcoded fallback** - ~60 common securities for instant lookup
2. **OpenFIGI API** - Dynamic lookup for unknown CUSIPs
3. **In-memory cache** - 7-day TTL to minimize API calls

---

## 7. Vercel Cron Jobs

### 7.1 Configure Cron Jobs in vercel.json

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

### 7.2 Secure Cron Endpoints

- [ ] Generate a secure random string for `CRON_SECRET`:
  ```bash
  openssl rand -hex 32
  ```
- [ ] Add to Vercel environment variables
- [ ] Vercel automatically sends this in the `Authorization` header

### 7.3 Environment Variables for Cron

```env
CRON_SECRET=your-secure-random-string
INTERNAL_API_SECRET=another-secure-random-string
```

---

## 8. Sentry Error Tracking

Sentry provides real-time error tracking and performance monitoring.

### 8.1 Create Sentry Account

- [ ] Sign up at [sentry.io](https://sentry.io)
- [ ] Create a new organization (or use existing)
- [ ] Create a new project with platform: **Next.js**

### 8.2 Get Project DSN

- [ ] Go to **Settings → Projects → [Your Project] → Client Keys (DSN)**
- [ ] Copy the DSN (looks like `https://xxx@xxx.ingest.sentry.io/xxx`)
- [ ] Add to environment: `NEXT_PUBLIC_SENTRY_DSN`

### 8.3 Configure Source Maps (Optional - for CI/CD)

For better stack traces in production:

- [ ] Go to **Settings → Auth Tokens**
- [ ] Create a new token with `project:releases` and `org:read` scopes
- [ ] Add to CI environment: `SENTRY_AUTH_TOKEN`
- [ ] Add organization slug: `SENTRY_ORG`
- [ ] Add project slug: `SENTRY_PROJECT`

### 8.4 Environment Variables for Sentry

```env
# Required
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Optional - for source map uploads
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=sntrys_xxxxx
```

### 8.5 Features Included

- **Client-side error tracking** - Catches React errors, unhandled rejections
- **Server-side error tracking** - API route errors, server component errors
- **Session Replay** - Record user sessions for debugging (10% sample in prod)
- **Performance monitoring** - Track slow transactions (10% sample in prod)
- **Cron job monitoring** - Automatic Vercel cron monitoring

### 8.6 Verify Setup

1. [ ] Deploy to production
2. [ ] Trigger a test error (e.g., visit `/debug-sentry` in development)
3. [ ] Check Sentry dashboard for the error
4. [ ] Verify source maps are working (stack traces show original code)

---

## 9. Environment Variables Checklist

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
| `OPENFIGI_API_KEY` | OpenFIGI Dashboard | Higher rate limits for CUSIP lookups |
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

# OpenFIGI API (optional - for better rate limits)
OPENFIGI_API_KEY=your-api-key-here

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
