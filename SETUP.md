# InsiderIntel - External Services Setup Guide

This guide covers **all external actions required** to make InsiderIntel fully functional in production. Follow each section in order for a complete setup.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Supabase Configuration](#2-supabase-configuration)
3. [Supabase Authentication & Email Setup](#3-supabase-authentication--email-setup)
4. [Google OAuth Setup](#4-google-oauth-setup)
5. [Stripe Payments](#5-stripe-payments)
6. [Resend Email Service](#6-resend-email-service)
7. [Anthropic Claude API](#7-anthropic-claude-api)
8. [OpenFIGI API](#8-openfigi-api)
9. [Sentry Error Tracking](#9-sentry-error-tracking)
10. [Vercel Deployment](#10-vercel-deployment)
11. [Vercel Cron Jobs](#11-vercel-cron-jobs)
12. [Environment Variables Reference](#12-environment-variables-reference)
13. [Production Launch Checklist](#13-production-launch-checklist)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed locally
- [ ] Git repository set up (GitHub recommended for Vercel integration)
- [ ] A domain name for production (e.g., `insiderintel.com`)
- [ ] Access to DNS settings for your domain
- [ ] Credit card for paid services (Stripe, Anthropic, etc.)

### Accounts to Create

You will need accounts on these platforms:

| Service | Purpose | Pricing |
|---------|---------|---------|
| [Supabase](https://supabase.com) | Database & Auth | Free tier available |
| [Stripe](https://stripe.com) | Payments | Transaction fees only |
| [Resend](https://resend.com) | Transactional email | Free tier: 3k emails/month |
| [Anthropic](https://console.anthropic.com) | AI context generation | Pay-per-use |
| [Vercel](https://vercel.com) | Hosting & Cron | Free tier available |
| [Google Cloud](https://console.cloud.google.com) | OAuth provider | Free |
| [OpenFIGI](https://openfigi.com) | CUSIP lookups | Free |
| [Sentry](https://sentry.io) | Error tracking | Free tier available |

---

## 2. Supabase Configuration

Supabase provides the PostgreSQL database and authentication for InsiderIntel.

### 2.1 Create Supabase Project

- [ ] Sign up at [supabase.com](https://supabase.com)
- [ ] Create a new project
- [ ] Choose a region close to your users (e.g., `us-east-1` for US users)
- [ ] Set a strong database password (save it securely - you'll need it for direct DB access)
- [ ] Wait for project to provision (~2 minutes)

### 2.2 Get API Keys

- [ ] Go to **Settings → API**
- [ ] Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

> **Security Warning**: The `service_role` key bypasses Row Level Security. Never expose it to the client.

### 2.3 Configure Database Schema

Run the following SQL in the **SQL Editor** (Project → SQL Editor → New Query):

```sql
-- ============================================
-- PART 1: Core Tables
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'retail', 'pro')),
  stripe_customer_id TEXT,
  notification_daily_digest BOOLEAN DEFAULT true,
  notification_instant_alerts BOOLEAN DEFAULT false,
  notification_weekly_summary BOOLEAN DEFAULT true,
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
  cik TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insider transactions table
CREATE TABLE IF NOT EXISTS public.insider_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  insider_id UUID REFERENCES public.insiders(id),
  accession_number TEXT UNIQUE NOT NULL,
  filed_at TIMESTAMPTZ,
  transaction_date DATE,
  transaction_type TEXT CHECK (transaction_type IN ('P', 'S', 'A', 'D', 'G', 'M', 'F', 'C', 'E', 'H', 'I', 'L', 'O', 'U', 'W', 'Z')),
  shares BIGINT,
  price_per_share NUMERIC(12, 4),
  total_value NUMERIC(16, 2),
  insider_title TEXT,
  is_director BOOLEAN DEFAULT false,
  is_officer BOOLEAN DEFAULT false,
  is_ten_percent_owner BOOLEAN DEFAULT false,
  ai_context TEXT,
  ai_significance_score NUMERIC(3, 2) CHECK (ai_significance_score >= 0 AND ai_significance_score <= 1),
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

-- Institutional filings table (13F filings)
CREATE TABLE IF NOT EXISTS public.institutional_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  accession_number TEXT UNIQUE NOT NULL,
  report_date DATE NOT NULL,
  filed_at TIMESTAMPTZ,
  total_value BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Institutional holdings table
CREATE TABLE IF NOT EXISTS public.institutional_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID REFERENCES public.institutional_filings(id) ON DELETE CASCADE,
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

-- ============================================
-- PART 2: Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_insider_transactions_company ON public.insider_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_insider_transactions_filed_at ON public.insider_transactions(filed_at DESC);
CREATE INDEX IF NOT EXISTS idx_insider_transactions_type ON public.insider_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_insider_transactions_ai_score ON public.insider_transactions(ai_significance_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON public.watchlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_company ON public.watchlist_items(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON public.companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_cik ON public.companies(cik);
CREATE INDEX IF NOT EXISTS idx_institutional_holdings_company ON public.institutional_holdings(company_id);
CREATE INDEX IF NOT EXISTS idx_institutional_holdings_institution ON public.institutional_holdings(institution_id);
CREATE INDEX IF NOT EXISTS idx_institutional_holdings_report_date ON public.institutional_holdings(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

-- ============================================
-- PART 3: Views
-- ============================================

-- Drop existing views first (required if columns changed)
DROP VIEW IF EXISTS public.v_recent_insider_transactions;
DROP VIEW IF EXISTS public.v_institutional_holdings;

-- View for recent insider transactions with company and insider details
CREATE VIEW public.v_recent_insider_transactions AS
SELECT
  it.id,
  it.company_id,
  it.insider_id,
  it.accession_number,
  it.filed_at,
  it.transaction_date,
  it.transaction_type,
  it.shares,
  it.price_per_share,
  it.total_value,
  it.insider_title,
  it.is_director,
  it.is_officer,
  it.is_ten_percent_owner,
  it.ai_context,
  it.ai_significance_score,
  it.ai_generated_at,
  it.created_at,
  c.ticker,
  c.name AS company_name,
  i.name AS insider_name
FROM public.insider_transactions it
JOIN public.companies c ON it.company_id = c.id
JOIN public.insiders i ON it.insider_id = i.id
ORDER BY it.filed_at DESC;

-- View for institutional holdings with company and institution details
CREATE VIEW public.v_institutional_holdings AS
SELECT
  ih.id,
  ih.filing_id,
  ih.institution_id,
  ih.company_id,
  ih.report_date,
  ih.shares,
  ih.value,
  ih.shares_change,
  ih.is_new_position,
  ih.is_closed_position,
  ih.created_at,
  c.ticker,
  c.name AS company_name,
  inst.name AS institution_name,
  inst.institution_type
FROM public.institutional_holdings ih
JOIN public.companies c ON ih.company_id = c.id
JOIN public.institutions inst ON ih.institution_id = inst.id
ORDER BY ih.report_date DESC;
```

### 2.4 Configure Row Level Security (RLS)

Run this SQL to enable RLS policies:

```sql
-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insiders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insider_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_holdings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Service role can insert profiles (for trigger)
CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Watchlist: Users can manage their own watchlist
CREATE POLICY "Users can view own watchlist" ON public.watchlist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist" ON public.watchlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist" ON public.watchlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- Public read access for market data (no user data)
CREATE POLICY "Anyone can view companies" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view insiders" ON public.insiders
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view transactions" ON public.insider_transactions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view institutions" ON public.institutions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view filings" ON public.institutional_filings
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view holdings" ON public.institutional_holdings
  FOR SELECT USING (true);
```

### 2.5 Create Profile Trigger

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
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 3. Supabase Authentication & Email Setup

### 3.1 Configure Site URL and Redirect URLs

**This is critical for authentication to work correctly.**

- [ ] Go to **Authentication → URL Configuration**
- [ ] Set **Site URL**: `https://yourdomain.com` (your production domain)
- [ ] Add **Redirect URLs** (one per line):
  ```
  https://yourdomain.com/auth/callback
  https://yourdomain.com/reset-password
  http://localhost:3000/auth/callback
  http://localhost:3000/reset-password
  ```

> **Note**: The `Site URL` is used as the base URL for email confirmation links. It must match your production domain.

### 3.2 Configure Email Templates

Supabase sends authentication emails (confirmation, password reset, magic links). You should customize these templates.

- [ ] Go to **Authentication → Email Templates**
- [ ] Customize each template:

#### Confirm Signup Template

```html
<h2>Confirm your email</h2>

<p>Follow this link to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
```

#### Reset Password Template

```html
<h2>Reset Your Password</h2>

<p>Follow this link to reset the password for your account:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't request a password reset, you can ignore this email.</p>
```

#### Magic Link Template

```html
<h2>Your Magic Link</h2>

<p>Follow this link to sign in:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 1 hour.</p>
```

### 3.3 Configure Email Sender Settings

**Option A: Use Supabase Default SMTP (Development/Testing)**

For development, Supabase's built-in email works but has limitations:
- Rate limited to 4 emails per hour
- From address cannot be customized
- May end up in spam folders

**Option B: Use Custom SMTP (Production - Recommended)**

For production, configure a custom SMTP server:

- [ ] Go to **Project Settings → Auth → SMTP Settings**
- [ ] Enable **Custom SMTP**
- [ ] Configure settings (using Resend as example):

| Setting | Value |
|---------|-------|
| Host | `smtp.resend.com` |
| Port | `465` |
| User | `resend` |
| Password | Your Resend API key |
| Sender email | `noreply@yourdomain.com` |
| Sender name | `InsiderIntel` |

> **Alternative SMTP providers**: AWS SES, SendGrid, Mailgun, Postmark

### 3.4 Configure Auth Settings

- [ ] Go to **Authentication → Settings**
- [ ] **Email Auth**: Enable
- [ ] **Confirm email**: Enable (recommended for production)
  - Users will receive a confirmation email after signup
  - They cannot sign in until email is confirmed
- [ ] **Secure email change**: Enable
  - Users must confirm both old and new email when changing
- [ ] **Enable manual linking**: Disable (security)
- [ ] **Minimum password length**: 8 (or higher)

### 3.5 Test Email Configuration

1. [ ] Create a test account via signup
2. [ ] Check that confirmation email is received
3. [ ] Click confirmation link - should redirect to your app
4. [ ] Test password reset flow
5. [ ] Verify email lands in inbox (not spam)

---

## 4. Google OAuth Setup

Google OAuth allows users to sign in with their Google account.

### 4.1 Create Google Cloud Project

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Create a new project or select existing
- [ ] Name: `InsiderIntel` (or similar)

### 4.2 Enable Required APIs

- [ ] Go to **APIs & Services → Library**
- [ ] Search and enable **Google+ API** (or **Google Identity Services API**)

### 4.3 Configure OAuth Consent Screen

- [ ] Go to **APIs & Services → OAuth consent screen**
- [ ] Choose **External** user type
- [ ] Fill in app information:

| Field | Value |
|-------|-------|
| App name | `InsiderIntel` |
| User support email | Your email |
| App logo | Optional (512x512 PNG) |
| App domain | `https://yourdomain.com` |
| Authorized domains | `yourdomain.com`, `supabase.co` |
| Developer contact | Your email |

- [ ] Add scopes:
  - `email`
  - `profile`
  - `openid`
- [ ] Add test users (if in testing mode)
- [ ] Save and continue

### 4.4 Create OAuth Credentials

- [ ] Go to **APIs & Services → Credentials**
- [ ] Click **Create Credentials → OAuth client ID**
- [ ] Application type: **Web application**
- [ ] Name: `InsiderIntel Supabase`
- [ ] **Authorized JavaScript origins**:
  ```
  https://your-project-ref.supabase.co
  ```
- [ ] **Authorized redirect URIs**:
  ```
  https://your-project-ref.supabase.co/auth/v1/callback
  ```
- [ ] Click **Create**
- [ ] Copy **Client ID** and **Client Secret**

### 4.5 Configure Supabase Auth Provider

- [ ] Go to Supabase Dashboard → **Authentication → Providers**
- [ ] Find **Google** and toggle **Enable**
- [ ] Paste your **Client ID**
- [ ] Paste your **Client Secret**
- [ ] **Skip nonce check**: Leave disabled
- [ ] Save

### 4.6 Publish OAuth App (For Production)

While in "Testing" mode, only test users can use Google OAuth.

- [ ] Go to **OAuth consent screen**
- [ ] Click **Publish App**
- [ ] Confirm publishing
- [ ] Now any Google user can sign in

> **Note**: If you request sensitive scopes, you may need Google verification. For basic auth (email, profile), this is usually not required.

---

## 5. Stripe Payments

Stripe handles subscription payments for Retail ($29/mo) and Pro ($79/mo) plans.

### 5.1 Create Stripe Account

- [ ] Sign up at [stripe.com](https://stripe.com)
- [ ] Complete business verification (required for live mode)
- [ ] Note: You can develop and test in **Test mode** first

### 5.2 Create Products and Prices

In the Stripe Dashboard → **Products**:

**Retail Plan ($29/month)**

- [ ] Click **Add Product**
- [ ] Name: `Retail Plan`
- [ ] Description: `Perfect for active individual investors tracking insider activity`
- [ ] Add **Price**:
  - Pricing model: Standard pricing
  - Price: `$29.00`
  - Billing period: Monthly
  - Click **Add price**
- [ ] Copy the **Price ID** (starts with `price_`) → `STRIPE_RETAIL_PRICE_ID`

**Pro Plan ($79/month)**

- [ ] Click **Add Product**
- [ ] Name: `Pro Plan`
- [ ] Description: `For professionals who need comprehensive data and advanced analytics`
- [ ] Add **Price**:
  - Pricing model: Standard pricing
  - Price: `$79.00`
  - Billing period: Monthly
  - Click **Add price**
- [ ] Copy the **Price ID** → `STRIPE_PRO_PRICE_ID`

### 5.3 Get API Keys

- [ ] Go to **Developers → API Keys**
- [ ] Copy **Secret key** → `STRIPE_SECRET_KEY`
  - Test mode: starts with `sk_test_`
  - Live mode: starts with `sk_live_`

> **Never expose secret keys in client-side code.**

### 5.4 Configure Webhook

Webhooks notify your app when subscription events occur.

- [ ] Go to **Developers → Webhooks**
- [ ] Click **Add endpoint**
- [ ] **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
- [ ] **Events to send** - select these:
  - `checkout.session.completed` - User completed checkout
  - `customer.subscription.created` - New subscription
  - `customer.subscription.updated` - Plan change, renewal
  - `customer.subscription.deleted` - Cancellation
  - `invoice.payment_succeeded` - Successful payment
  - `invoice.payment_failed` - Failed payment
- [ ] Click **Add endpoint**
- [ ] **Reveal** and copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 5.5 Configure Customer Portal

The Customer Portal lets users manage their subscription.

- [ ] Go to **Settings → Billing → Customer portal**
- [ ] Click **Activate test link** (test mode) or configure for live
- [ ] Configure settings:

| Setting | Recommended Value |
|---------|-------------------|
| Allow payment method updates | Yes |
| Allow subscription cancellations | Yes |
| Cancellation mode | At end of billing period |
| Allow subscription pausing | Optional |
| Allow switching plans | Yes |
| Show invoice history | Yes |

- [ ] Set **Default return URL**: `https://yourdomain.com/settings/billing`
- [ ] Save

### 5.6 Local Development with Stripe CLI

To test webhooks locally:

```bash
# Install Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# The CLI will output a webhook signing secret like:
# whsec_xxxxx
# Use this for local STRIPE_WEBHOOK_SECRET
```

### 5.7 Test Payments

Use these test cards:

| Scenario | Card Number |
|----------|-------------|
| Successful payment | `4242 4242 4242 4242` |
| Requires authentication | `4000 0025 0000 3155` |
| Declined | `4000 0000 0000 9995` |

- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any 5-digit ZIP

---

## 6. Resend Email Service

Resend sends transactional emails (daily digests, alerts, weekly summaries).

### 6.1 Create Resend Account

- [ ] Sign up at [resend.com](https://resend.com)
- [ ] Verify your email address

### 6.2 Add and Verify Domain

For production, you must verify your domain to send from custom addresses.

- [ ] Go to **Domains → Add Domain**
- [ ] Enter your domain (e.g., `yourdomain.com`)
- [ ] Add the DNS records provided to your domain's DNS settings:

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| TXT | `@` or domain | `v=spf1 include:...` | SPF record |
| CNAME or TXT | `resend._domainkey` | `...` | DKIM record |
| TXT | `_dmarc` | `v=DMARC1; p=none; ...` | DMARC (optional but recommended) |

- [ ] Wait for domain verification (usually minutes, can take up to 48 hours)
- [ ] Verification status will show "Verified" when complete

### 6.3 Get API Key

- [ ] Go to **API Keys → Create API Key**
- [ ] Name: `InsiderIntel Production`
- [ ] Permission: **Full access** (or **Sending access** only)
- [ ] Copy the API key → `RESEND_API_KEY`

### 6.4 Configure From Address

The `EMAIL_FROM` variable defines the sender:

```env
EMAIL_FROM=InsiderIntel <notifications@yourdomain.com>
```

Ensure the domain in the email address matches your verified domain.

### 6.5 Test Email Delivery

```bash
# Test with curl
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_xxxxx' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "InsiderIntel <notifications@yourdomain.com>",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>This is a test email from InsiderIntel.</p>"
  }'
```

---

## 7. Anthropic Claude API

Claude AI generates contextual analysis for insider transactions.

### 7.1 Create Anthropic Account

- [ ] Sign up at [console.anthropic.com](https://console.anthropic.com)
- [ ] Complete account verification
- [ ] Add a payment method (usage-based billing)

### 7.2 Get API Key

- [ ] Go to **API Keys** in the console
- [ ] Click **Create Key**
- [ ] Name: `InsiderIntel Production`
- [ ] Copy the key (starts with `sk-ant-`) → `ANTHROPIC_API_KEY`

### 7.3 Usage and Cost Information

**Model used**: `claude-sonnet-4-20250514` (or latest)

**Features:**
- Generates contextual analysis for insider transactions
- Produces significance scores (0.0 - 1.0)
- Batch processing with built-in rate limiting
- Company-level aggregate insights

**Cost estimates:**
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens
- Each transaction analysis: ~500-1000 tokens (~$0.01-0.02)

**Rate limiting (built-in to app):**
- 100ms delay between requests
- Max 5 concurrent API calls
- Exponential backoff on errors

---

## 8. OpenFIGI API

OpenFIGI provides CUSIP to ticker symbol mapping for 13F institutional holdings data.

### 8.1 API Key (Optional but Recommended)

The API works without a key but with lower rate limits:

| Access | Rate Limit | CUSIPs per Request |
|--------|------------|-------------------|
| No API key | 25 req/min | 5 |
| With API key (free) | 250 req/min | 100 |

### 8.2 Get API Key

- [ ] Go to [openfigi.com/api](https://www.openfigi.com/api)
- [ ] Click **Get API Key**
- [ ] Create a free account
- [ ] Copy your API key → `OPENFIGI_API_KEY`

### 8.3 How It Works in the App

The system uses a multi-layer approach:
1. **Hardcoded fallback** - ~60 common securities for instant lookup
2. **OpenFIGI API** - Dynamic lookup for unknown CUSIPs
3. **In-memory cache** - 7-day TTL to minimize API calls

---

## 9. Sentry Error Tracking

Sentry provides real-time error tracking and performance monitoring.

### 9.1 Create Sentry Project

- [ ] Sign up at [sentry.io](https://sentry.io)
- [ ] Create organization (or use existing)
- [ ] Create project:
  - Platform: **Next.js**
  - Project name: `insiderintel`

### 9.2 Get Project DSN

- [ ] Go to **Settings → Projects → [insiderintel] → Client Keys (DSN)**
- [ ] Copy the DSN → `NEXT_PUBLIC_SENTRY_DSN`

### 9.3 Configure Source Maps (Optional)

For better stack traces in production:

- [ ] Go to **Settings → Auth Tokens**
- [ ] Create token with scopes: `project:releases`, `org:read`
- [ ] Set environment variables:
  - `SENTRY_AUTH_TOKEN`
  - `SENTRY_ORG`
  - `SENTRY_PROJECT`

### 9.4 Features Included

- Client-side error tracking
- Server-side error tracking (API routes, server components)
- Session Replay (10% sample in production)
- Performance monitoring (10% sample)
- Cron job monitoring

---

## 10. Vercel Deployment

### 10.1 Connect Repository

- [ ] Sign up/login at [vercel.com](https://vercel.com)
- [ ] Click **Add New → Project**
- [ ] Import your Git repository
- [ ] Select the repository containing InsiderIntel

### 10.2 Configure Project Settings

- [ ] **Framework Preset**: Next.js (auto-detected)
- [ ] **Root Directory**: `.` (or subdirectory if monorepo)
- [ ] **Build Command**: `next build` (default)
- [ ] **Output Directory**: `.next` (default)
- [ ] **Install Command**: `npm install` (default)

### 10.3 Add Environment Variables

Add all required environment variables in **Settings → Environment Variables**:

- [ ] Add each variable from the [Environment Variables Reference](#12-environment-variables-reference)
- [ ] Select environments: **Production**, **Preview**, **Development** as appropriate
- [ ] Some variables (like `NEXT_PUBLIC_*`) should be in all environments
- [ ] Production secrets should only be in Production

### 10.4 Configure Domain

- [ ] Go to **Settings → Domains**
- [ ] Add your custom domain (e.g., `yourdomain.com`)
- [ ] Follow DNS configuration instructions:
  - For apex domain: Add A record pointing to Vercel IPs
  - For subdomain: Add CNAME record pointing to `cname.vercel-dns.com`
- [ ] Wait for DNS propagation and SSL certificate provisioning

### 10.5 Deploy

- [ ] Push to main branch to trigger deployment
- [ ] Or click **Deploy** in Vercel dashboard
- [ ] Monitor build logs for errors
- [ ] Visit deployment URL to verify

---

## 11. Vercel Cron Jobs

Cron jobs run scheduled tasks for email digests and AI context generation.

### 11.1 Verify vercel.json Configuration

The project includes `vercel.json` with cron schedules:

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

| Job | Schedule | Time (UTC) | Description |
|-----|----------|------------|-------------|
| Daily Digest | `0 13 * * *` | 1:00 PM daily | Sends daily watchlist activity |
| Weekly Summary | `0 14 * * 1` | 2:00 PM Mondays | Sends weekly market summary |
| AI Context | `0 */6 * * *` | Every 6 hours | Generates AI analysis |

### 11.2 Generate CRON_SECRET

Vercel automatically authenticates cron requests, but our endpoints also verify a secret:

```bash
# Generate a secure random string
openssl rand -hex 32
```

- [ ] Add this value as `CRON_SECRET` in Vercel environment variables

### 11.3 How Cron Authentication Works

Vercel sends cron requests with an `Authorization` header:
```
Authorization: Bearer <CRON_SECRET>
```

The app verifies this in each cron route handler using `lib/auth/cron.ts`.

### 11.4 Monitor Cron Jobs

- [ ] Go to Vercel Dashboard → **Cron Jobs**
- [ ] View scheduled jobs and their status
- [ ] Check **Logs** for execution history and errors

### 11.5 Cron Job Limitations by Plan

| Vercel Plan | Max Crons | Min Interval |
|-------------|-----------|--------------|
| Hobby (Free) | 2 jobs | Daily |
| Pro | 40 jobs | Every minute |
| Enterprise | 100 jobs | Every minute |

> **Note**: The free tier only supports 2 cron jobs and daily intervals. You may need to upgrade or consolidate jobs.

---

## 12. Environment Variables Reference

### Required Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard | Anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard | Service role key (server only) |
| `NEXT_PUBLIC_APP_URL` | Your domain | Production URL (e.g., `https://yourdomain.com`) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard | API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhooks | Webhook signing secret |
| `STRIPE_RETAIL_PRICE_ID` | Stripe Products | Retail plan price ID |
| `STRIPE_PRO_PRICE_ID` | Stripe Products | Pro plan price ID |
| `RESEND_API_KEY` | Resend Dashboard | Email API key |
| `EMAIL_FROM` | Your domain | Sender address |
| `ANTHROPIC_API_KEY` | Anthropic Console | Claude API key |
| `CRON_SECRET` | Self-generated | Cron job authentication |

### Optional Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `OPENFIGI_API_KEY` | OpenFIGI | Higher rate limits for CUSIP lookups |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry | Error tracking DSN |
| `SENTRY_ORG` | Sentry | Organization slug |
| `SENTRY_PROJECT` | Sentry | Project slug |
| `SENTRY_AUTH_TOKEN` | Sentry | Auth token for source maps |
| `LOG_LEVEL` | N/A | Override log level (trace/debug/info/warn/error) |

### Complete .env.local Template

```env
# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# ============================================
# APPLICATION
# ============================================
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# ============================================
# STRIPE PAYMENTS
# ============================================
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_RETAIL_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx

# ============================================
# EMAIL (RESEND)
# ============================================
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=InsiderIntel <notifications@yourdomain.com>

# ============================================
# AI (ANTHROPIC)
# ============================================
ANTHROPIC_API_KEY=sk-ant-xxxxx

# ============================================
# CRON JOBS
# ============================================
CRON_SECRET=your-secure-random-string-here

# ============================================
# OPTIONAL: OPENFIGI
# ============================================
OPENFIGI_API_KEY=your-api-key-here

# ============================================
# OPTIONAL: SENTRY
# ============================================
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=insiderintel
SENTRY_AUTH_TOKEN=sntrys_xxxxx

# ============================================
# OPTIONAL: LOGGING
# ============================================
LOG_LEVEL=info
```

---

## 13. Production Launch Checklist

### Pre-Launch Verification

#### Supabase
- [ ] Database schema created (all tables, indexes, views)
- [ ] RLS policies enabled and tested
- [ ] Profile trigger working (new users get profiles)
- [ ] Email confirmation enabled
- [ ] Email templates customized
- [ ] Custom SMTP configured (not using Supabase defaults)
- [ ] Site URL and redirect URLs configured

#### Authentication
- [ ] Email signup working
- [ ] Email confirmation emails received
- [ ] Password reset flow working
- [ ] Google OAuth working
- [ ] Google OAuth app published (not in testing mode)

#### Stripe
- [ ] Products and prices created
- [ ] Webhook endpoint configured
- [ ] All events selected for webhook
- [ ] Customer portal enabled and configured
- [ ] **Using live mode keys** (not test keys)
- [ ] Test subscription flow end-to-end

#### Email (Resend)
- [ ] Domain verified
- [ ] DNS records configured (SPF, DKIM, DMARC)
- [ ] Test email sent successfully
- [ ] From address matches verified domain

#### Vercel
- [ ] Repository connected
- [ ] All environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Cron jobs visible in dashboard

### Post-Launch Verification

#### Functionality Tests
- [ ] New user can sign up with email
- [ ] New user receives and confirms email
- [ ] User can sign in with Google
- [ ] User can reset password
- [ ] Dashboard loads with data
- [ ] Watchlist add/remove works
- [ ] Stripe checkout completes
- [ ] Stripe portal accessible
- [ ] Subscription tier updates correctly

#### Cron Job Tests
- [ ] Manually trigger daily digest
- [ ] Manually trigger weekly summary
- [ ] Manually trigger AI context generation
- [ ] Verify cron jobs run on schedule

#### Monitoring Setup
- [ ] Sentry receiving errors (trigger test error)
- [ ] Vercel logs accessible
- [ ] Stripe webhook logs clean

---

## 14. Troubleshooting

### Authentication Issues

**Problem**: Email confirmation link doesn't work

**Solutions**:
- Verify **Site URL** in Supabase matches your domain
- Check redirect URLs include your callback path
- Ensure DNS is properly configured for your domain

---

**Problem**: Google OAuth fails with redirect error

**Solutions**:
- Verify redirect URI in Google Console matches: `https://your-project.supabase.co/auth/v1/callback`
- Ensure authorized JavaScript origins includes Supabase URL
- Check Google OAuth app is published (not in testing mode)

---

**Problem**: Password reset email not received

**Solutions**:
- Check spam folder
- Verify custom SMTP settings if configured
- Check Supabase email rate limits (4/hour on free)
- Review Resend logs for delivery status

### Stripe Issues

**Problem**: Webhook events not received

**Solutions**:
- Verify webhook URL is publicly accessible
- Check webhook signing secret matches environment variable
- Review Stripe webhook logs for errors
- For local testing, ensure Stripe CLI is forwarding

---

**Problem**: Customer portal shows 404

**Solutions**:
- Ensure customer portal is activated in Stripe settings
- Verify user has a Stripe customer ID in database
- Check return URL is configured

---

**Problem**: Subscription tier doesn't update after payment

**Solutions**:
- Check webhook endpoint is receiving `checkout.session.completed`
- Verify `profiles.stripe_customer_id` is set
- Review server logs for webhook handler errors

### Email Issues

**Problem**: Emails going to spam

**Solutions**:
- Verify SPF, DKIM, and DMARC records are configured
- Use a dedicated email subdomain (e.g., `mail.yourdomain.com`)
- Build sender reputation gradually
- Check Resend dashboard for reputation score

---

**Problem**: Domain verification failing

**Solutions**:
- DNS changes can take up to 48 hours
- Verify DNS records are exact (no trailing dots, correct type)
- Use MXToolbox to verify DNS propagation

### Cron Job Issues

**Problem**: Cron jobs not running

**Solutions**:
- Verify `vercel.json` is in project root and deployed
- Check Vercel plan supports required cron frequency
- Verify `CRON_SECRET` is set in Vercel environment
- Review Vercel cron logs for errors

---

**Problem**: Cron job returns 401 Unauthorized

**Solutions**:
- Ensure `CRON_SECRET` in Vercel matches what the app expects
- Vercel automatically sends the secret in Authorization header
- Check cron auth middleware in `lib/auth/cron.ts`

### Database Issues

**Problem**: RLS policy blocking queries

**Solutions**:
- Verify user is authenticated (check `auth.uid()`)
- Test queries in Supabase SQL Editor with RLS disabled
- Review policy definitions for errors
- Use service role key for admin operations (server only)

---

**Problem**: Profile not created for new user

**Solutions**:
- Verify trigger `on_auth_user_created` exists
- Check function `handle_new_user()` for errors
- Review Supabase logs for trigger failures
- Manually create profile if needed for testing

---

## Quick Reference: Service Dashboards

| Service | Dashboard URL | What to Monitor |
|---------|---------------|-----------------|
| Supabase | dashboard.supabase.com | Database, Auth, Logs |
| Stripe | dashboard.stripe.com | Payments, Webhooks, Subscriptions |
| Resend | resend.com/emails | Deliverability, Logs |
| Anthropic | console.anthropic.com | Usage, Costs |
| Vercel | vercel.com | Deployments, Crons, Logs |
| Sentry | sentry.io | Errors, Performance |
| Google Cloud | console.cloud.google.com | OAuth, API Usage |

---

*Last updated: January 18, 2026*
